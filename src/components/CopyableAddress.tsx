import { useCallback, useState } from 'react';
import { Copy } from 'lucide-react';

interface CopyableAddressProps {
  address: string;
  className?: string;
}

const fallbackCopy = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

export function CopyableAddress({ address, className }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      fallbackCopy(address);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }, [address]);

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-left">{address}</span>
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded hover:bg-neutral-100 transition-colors block"
          aria-label="주소 복사"
          title="주소 복사"
        >
          <Copy className="w-4 h-4 text-neutral-400" />
        </button>
        {copied && (
          <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1 text-xs text-white shadow-lg">
            복사 완료
          </div>
        )}
      </div>
    </div>
  );
}
