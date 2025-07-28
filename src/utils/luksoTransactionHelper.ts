import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// LSP6 Key Manager ABI - only what we need
const KEY_MANAGER_ABI: AbiItem[] = [
  {
    inputs: [
      { internalType: "bytes", name: "payload", type: "bytes" }
    ],
    name: "execute",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "payable",
    type: "function"
  }
];

// LSP0 ERC725Account ABI - for encoding execute
const LSP0_ABI: AbiItem[] = [
  {
    inputs: [
      { internalType: "uint256", name: "operationType", type: "uint256" },
      { internalType: "address", name: "target", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" }
    ],
    name: "execute",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "payable",
    type: "function"
  }
];

// Check if address is a Universal Profile by checking for LSP0 interface
export async function isUniversalProfile(web3: Web3, address: string): Promise<boolean> {
  try {
    const code = await web3.eth.getCode(address);
    if (code === '0x' || code === '0x0') return false;
    
    // Check for ERC725X interface (0x7545acac)
    const erc725xInterface = '0x7545acac';
    const supportsInterface = new web3.eth.Contract([
      {
        inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
      }
    ] as AbiItem[], address);
    
    try {
      const supports = await supportsInterface.methods.supportsInterface(erc725xInterface).call();
      return Boolean(supports);
    } catch {
      // If supportsInterface fails, assume it's not a UP
      return false;
    }
  } catch (error) {
    console.error('[isUniversalProfile] Error:', error);
    return false;
  }
}

// Get Key Manager address from UP storage
export async function getKeyManager(web3: Web3, upAddress: string): Promise<string | null> {
  try {
    // LSP6KeyManager storage key
    const LSP6_KEY = '0x4b80742de2bf393a64c70290360c27e3e68c2a02c8ab5b7c4e88e3a5f6c02a9e';
    const result = await web3.eth.getStorageAt(upAddress, LSP6_KEY);
    
    if (result && result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      // Extract address from storage (last 20 bytes)
      return '0x' + result.slice(-40);
    }
    
    return null;
  } catch (error) {
    console.error('[getKeyManager] Error:', error);
    return null;
  }
}

// Main transaction sender
export async function sendTransaction(
  contract: any,
  method: string,
  params: any[],
  options: any,
  web3: Web3,
  account: string,
  targetAddress: string
): Promise<any> {
  try {
    console.log('[sendTransaction] Starting transaction:', {
      method,
      params,
      account,
      targetAddress,
      value: options.value
    });

    // Check if sender is a Universal Profile
    const isUP = await isUniversalProfile(web3, account);
    
    if (!isUP) {
      console.log('[sendTransaction] Regular EOA detected, sending direct transaction');
      // For EOA, send transaction directly
      return await contract.methods[method](...params).send({
        from: account,
        ...options
      });
    }

    console.log('[sendTransaction] Universal Profile detected');
    
    // Get Key Manager address
    const keyManagerAddress = await getKeyManager(web3, account);
    if (!keyManagerAddress) {
      console.error('[sendTransaction] No Key Manager found for UP');
      throw new Error('Key Manager not found for Universal Profile');
    }
    
    console.log('[sendTransaction] Key Manager address:', keyManagerAddress);
    
    // Encode the contract call
    const targetCallData = contract.methods[method](...params).encodeABI();
    console.log('[sendTransaction] Target call data:', targetCallData.substring(0, 10) + '...');
    
    // Create LSP0 contract instance for encoding
    const lsp0Contract = new web3.eth.Contract(LSP0_ABI, account);
    
    // Encode the UP execute call
    const upExecuteData = lsp0Contract.methods.execute(
      0, // operation type: CALL
      targetAddress,
      options.value || '0',
      targetCallData
    ).encodeABI();
    
    console.log('[sendTransaction] UP execute data:', upExecuteData.substring(0, 10) + '...');
    
    // Create Key Manager contract instance
    const keyManagerContract = new web3.eth.Contract(KEY_MANAGER_ABI, keyManagerAddress);
    
    // Prepare transaction options
    const txOptions: any = {
      from: account,
      gas: options.gas || '2000000', // Default 2M gas
      gasPrice: options.gasPrice // Let web3 handle if not specified
    };
    
    // If the original call had value, we need to send it through Key Manager
    if (options.value && options.value !== '0') {
      txOptions.value = options.value;
      console.log('[sendTransaction] Including value:', web3.utils.fromWei(options.value, 'ether'), 'LYX');
    }
    
    console.log('[sendTransaction] Sending transaction through Key Manager...');
    
    // Send transaction through Key Manager
    const receipt = await keyManagerContract.methods
      .execute(upExecuteData)
      .send(txOptions);
    
    console.log('[sendTransaction] Transaction successful!');
    console.log('[sendTransaction] Transaction hash:', receipt.transactionHash);
    console.log('[sendTransaction] Gas used:', receipt.gasUsed);
    
    return receipt;
    
  } catch (error: any) {
    console.error('[sendTransaction] Transaction failed:', error);
    
    // Enhanced error handling
    if (error.message) {
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient LYX balance. Please check your account balance.');
      } else if (error.message.includes('User denied') || error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else if (error.message.includes('gas required exceeds allowance')) {
        throw new Error('Gas estimation failed. The transaction may fail or require more gas.');
      } else if (error.message.includes('nonce too low')) {
        throw new Error('Transaction nonce error. Please try again.');
      }
    }
    
    // Re-throw with more context
    throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
  }
}

// Helper function to estimate gas for UP transactions
export async function estimateGas(
  contract: any,
  method: string,
  params: any[],
  options: any,
  web3: Web3,
  account: string,
  targetAddress: string
): Promise<string> {
  try {
    const isUP = await isUniversalProfile(web3, account);
    
    if (!isUP) {
      // For EOA, estimate directly
      return await contract.methods[method](...params).estimateGas({
        from: account,
        ...options
      });
    }
    
    // For UP, we need to estimate through Key Manager
    const keyManagerAddress = await getKeyManager(web3, account);
    if (!keyManagerAddress) {
      throw new Error('Key Manager not found');
    }
    
    const targetCallData = contract.methods[method](...params).encodeABI();
    const lsp0Contract = new web3.eth.Contract(LSP0_ABI, account);
    const upExecuteData = lsp0Contract.methods.execute(
      0,
      targetAddress,
      options.value || '0',
      targetCallData
    ).encodeABI();
    
    const keyManagerContract = new web3.eth.Contract(KEY_MANAGER_ABI, keyManagerAddress);
    
    const estimatedGas = await keyManagerContract.methods
      .execute(upExecuteData)
      .estimateGas({
        from: account,
        value: options.value || '0'
      });
    
    // Add 20% buffer for safety
    return Math.floor(Number(estimatedGas) * 1.2).toString();
    
  } catch (error) {
    console.error('[estimateGas] Error:', error);
    // Return a safe default
    return '2000000';
  }
}