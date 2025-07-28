import Web3 from 'web3';

// Simple transaction sender that works with both EOA and UP
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
    console.log('[sendTransaction] Sending transaction:', {
      method,
      account,
      targetAddress,
      value: options.value
    });

    // Just send the transaction - let the provider handle UP/EOA differences
    const tx = await contract.methods[method](...params).send({
      from: account,
      value: options.value || '0',
      gas: options.gas || '1000000',
      ...options
    });

    console.log('[sendTransaction] Transaction successful:', tx.transactionHash);
    return tx;

  } catch (error: any) {
    console.error('[sendTransaction] Transaction failed:', error);
    
    // Simple error messages
    if (error.code === 4001 || error.message?.includes('User denied')) {
      throw new Error('Transaction cancelled by user');
    }
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient LYX balance');
    }
    
    // Just pass through the error
    throw error;
  }
}