import { } from 'react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config';

interface PageOverlayProps {
  isVisible: boolean;
}

export function PageOverlay({ isVisible }: PageOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-500 ease-out-cubic',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <img
          src="/images/logo-x.webp"
          alt={siteConfig.title || 'XALVAJE'}
          width={187}
          height={240}
          className="h-20 w-auto animate-[breathe_1.6s_ease-in-out_infinite]"
        />
        <div className="w-24 h-0.5 bg-exvia-subtle rounded-full overflow-hidden">
          <div className="h-full bg-exvia-red animate-[slide_1s_ease-in-out_infinite] w-1/3 rounded-full" />
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.72; transform: scale(0.94); }
        }
      `}</style>
    </div>
  );
}
