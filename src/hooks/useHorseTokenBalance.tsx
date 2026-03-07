// hooks/useHorseTokenBalance.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { horseTokenContractInstance } from '@/contract/horse-token-contract/contract-instance';
import { formatUnits } from 'ethers/lib/utils';

export function useHorseTokenBalance() {
  const activeAccount = useActiveAccount();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!activeAccount) return;

    try {
      setLoading(true);
      const horseTokenInsta = await horseTokenContractInstance(activeAccount);
      const data = await horseTokenInsta.balanceOf(activeAccount.address);
      const userBalance = formatUnits(data, 18);
      setBalance(parseFloat(userBalance).toFixed(2));
    } catch (error) {
      console.error('Error fetching horse token balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  }, [activeAccount]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
}