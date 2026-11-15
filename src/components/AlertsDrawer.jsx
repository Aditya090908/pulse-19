import React from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AlertsDrawer({ isOpen, onClose, alerts = [] }) {
  if (!isOpen) return null;

  const severityConfig = {
    critical: {
      badge: 'bg-rose-950/80 text-rose-400 border-rose-600/40',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
    },
    warning: {
      badge: 'bg-amber-950/80 text-amber-400 border-amber-600/40',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    info: {
      badge: 'bg-cyan-950/80 text-cyan-400 border-cyan-600/40',
      icon: Info,
      iconColor: 'text-cyan-400',
    },
    success: {
      badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-600/40',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-cyan-500/30 p-6 shadow-2xl flex flex-col font-mono text-slate-100 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white tracking-wide">
              SURVEILLANCE BULLETINS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Simulated public health notifications and telemetry dispatches (Zero-API Demo).
        </p>

        {/* Alerts List */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${config.badge}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {alert.region}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-900">
                  <span>DISPATCH ID: {alert.id}</span>
                  <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-bold transition-all"
          >
            CLOSE DISPATCHES
          </button>
        </div>
      </div>
    </div>
  );
}
