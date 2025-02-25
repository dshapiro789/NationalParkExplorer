import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import BitcoinLogo from './BitcoinLogo';

export default function DonationSection() {
  const [copied, setCopied] = useState(false);
  const bitcoinAddress = 'bc1qqe8xgv60cmy3rgm0lgjvmplq0xpnkyykdsuzwv';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="text-center md:text-right">
      <div className="inline-flex items-center space-x-2 text-green-100">
        <BitcoinLogo className="h-5 w-5" />
        <h3 className="text-base font-medium">Support Development</h3>
      </div>
      
      <div className="mt-3 flex flex-col items-center md:items-end space-y-3">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qqe8xgv60cmy3rgm0lgjvmplq0xpnkyykdsuzwv"
          alt="Bitcoin QR Code"
          className="w-24 h-24 bg-white p-2 rounded-lg"
        />
        
        <div className="relative group max-w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 bg-green-800 rounded-lg px-3 py-1.5">
            <code className="text-xs text-green-100 font-mono break-all">{bitcoinAddress}</code>
            <button
              onClick={handleCopy}
              className="text-green-100 hover:text-white transition-colors flex-shrink-0"
              title="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          {copied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-xs px-2 py-1 rounded">
              Copied!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}