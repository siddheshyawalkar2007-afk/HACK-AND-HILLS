import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
      {notifications.map((n) => {
        const isSuccess = n.type === 'success';
        const isError = n.type === 'error';
        const isWarning = n.type === 'warning';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start space-x-3 transition-all transform translate-y-0 backdrop-blur-md ${
              isSuccess
                ? 'bg-[#0E201B]/95 border-emerald-500/40 text-emerald-200'
                : isError
                ? 'bg-[#291114]/95 border-rose-500/40 text-rose-200'
                : isWarning
                ? 'bg-[#261E0E]/95 border-amber-500/40 text-amber-200'
                : 'bg-[#121B2B]/95 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide text-slate-100">{n.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{n.message}</p>
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

