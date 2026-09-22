import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  onError,
  onExpire,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isBypassMode, setIsBypassMode] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    // Nếu không cấu hình SiteKey hoặc key mặc định -> Tự động kích hoạt chế độ Bypass cho môi trường Dev
    if (!siteKey || siteKey === '1x00000000000000000000AA') {
      setIsBypassMode(true);
      onSuccess('bypass-test-token-dev');
      return;
    }

    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onSuccess(token),
            'error-callback': () => onError?.(),
            'expired-callback': () => onExpire?.(),
            theme: 'light',
          });
        } catch (e) {
          console.warn('Lỗi khi khởi tạo Cloudflare Turnstile widget:', e);
          setIsBypassMode(true);
          onSuccess('bypass-test-token-fallback');
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (isBypassMode) {
    return (
      <div className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium shadow-xs ${className}`}>
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Bảo mật chống Spam & Bot: <strong>Đã xác thực tự động (Chế độ Kiểm thử)</strong></span>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
        <Lock className="w-3.5 h-3.5 text-cyan-600" />
        <span>Xác minh bảo mật chống truy cập tự động (Cloudflare Turnstile)</span>
      </div>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
};
