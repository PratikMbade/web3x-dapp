'use client';

import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface WalletAddressProps {
  address: string;
  showCopy?: boolean;
  showExternal?: boolean;
  truncate?: boolean;
}

export function WalletAddress({
  address,
  showCopy = true,
  showExternal = false,
  truncate = true,
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="text-sm font-mono  px-2 py-1 rounded">
        {displayAddress}
      </code>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
      {showExternal && (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
      {copied && <span className="text-xs text-green-600">Copied!</span>}
    </div>
  );
}
