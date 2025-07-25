import Web3 from 'web3';

// Basic Key Manager ABI for execute function
export function getKeyManagerABI() {
  return [
    {
      "inputs": [
        { "internalType": "uint256", "name": "operationType", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" },
        { "internalType": "bytes", "name": "data", "type": "bytes" }
      ],
      "name": "execute",
      "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
      "stateMutability": "payable",
      "type": "function"
    }
  ];
}

// Check if address is a Universal Profile
export async function checkIfUniversalProfile(web3: Web3, address: string): Promise<boolean> {
  try {
    const code = await web3.eth.getCode(address);
    // Simple check - UPs have contract code
    return code !== '0x' && code !== '0x0';
  } catch {
    return false;
  }
}

// Get Key Manager address for UP
export async function getKeyManagerAddress(web3: Web3, upAddress: string): Promise<string | null> {
  try {
    // LSP6 Key Manager key in UP storage
    const LSP6_KEY = '0x4b80742de2bf393a64c70290360c27e3e68c2a02c8ab5b7c4e88e3a5f6c02a9e';
    const keyManagerAddress = await web3.eth.getStorageAt(upAddress, LSP6_KEY);
    
    if (keyManagerAddress && keyManagerAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return '0x' + keyManagerAddress.slice(-40);
    }
    
    return null;
  } catch {
    return null;
  }
}

// LUKSO UP transaction helper
export async function sendTransaction(
  contract: any,
  method: string,
  params: any[],
  options: any,
  web3: Web3,
  account: string,
  targetAddress: string
) {
  try {
    // Check if we're using UP (has executeRelayCall)
    const isUP = await checkIfUniversalProfile(web3, account);
    
    if (isUP) {
      console.log('[sendTransaction] Detected Universal Profile, using Key Manager');
      console.log('[sendTransaction] Original options:', options);
      
      // For UP, we need to prepare the transaction differently
      const encodedData = contract.methods[method](...params).encodeABI();
      
      // Get the Key Manager address
      const keyManagerAddress = await getKeyManagerAddress(web3, account);
      
      if (keyManagerAddress) {
        console.log('[sendTransaction] Key Manager found:', keyManagerAddress);
        
        // Prepare executeRelayCall transaction
        const keyManagerContract = new web3.eth.Contract(
          getKeyManagerABI(),
          keyManagerAddress
        );
        
        // Encode the function call
        const encodedData = contract.methods[method](...params).encodeABI();
        
        // Ensure value is properly formatted as hex
        const valueToSend = options.value || '0';
        const valueInHex = web3.utils.toHex(valueToSend);
        
        // Build execute parameters
        const executeParams = {
          operation: 0, // CALL operation (not operationType!)
          to: targetAddress,
          value: valueInHex, // Must be hex format
          data: encodedData
        };

        // Build transaction options
        const txOptions: any = {
          from: account,
          gas: '1000000', // Increased gas limit
          gasPrice: undefined // Let web3 calculate
        };

        // Add value if sending native currency
        if (options.value && options.value !== '0') {
          txOptions.value = valueInHex; // Use hex format
          console.log('[sendTransaction] Including value in transaction:', {
            value: options.value,
            valueInHex: valueInHex,
            valueInLYX: web3.utils.fromWei(options.value, 'ether')
          });
        }

        console.log('[sendTransaction] Execute params:', {
          ...executeParams,
          data: executeParams.data.substring(0, 10) + '...' // Show only first 10 chars
        });
        console.log('[sendTransaction] Transaction options:', txOptions);

        // Execute through Key Manager
        const receipt = await keyManagerContract.methods
          .execute(
            executeParams.operation,
            executeParams.to,
            executeParams.value,
            executeParams.data
          )
          .send(txOptions);

        console.log('[sendTransaction] Transaction successful:', receipt);
        return receipt;
      } else {
        console.log('[sendTransaction] No Key Manager found, falling back to direct transaction');
      }
    } else {
      console.log('[sendTransaction] EOA detected, using direct transaction');
    }
    
    // Fallback to regular transaction for EOA
    return await contract.methods[method](...params).send(options);
  } catch (error: any) {
    console.error('[sendTransaction] Transaction error:', error);
    
    // More detailed error logging
    if (error.message) {
      console.error('[sendTransaction] Error message:', error.message);
      
      // Check for specific error patterns
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds. Please check your balance.');
      } else if (error.message.includes('Relayer Error')) {
        console.error('[sendTransaction] Relayer error details:', {
          code: error.code,
          message: error.message
        });
        throw new Error('Transaction rejected by relayer. Please check your UP permissions and balance.');
      }
    }
    
    throw error;
  }
}