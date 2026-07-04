import type { Device } from 'shared-types';
import { Fan, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DeviceCard({ device }: { device: Device }) {
  const [pulse, setPulse] = useState(false);
  const isOn = device.status === 'ON';

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [device.lastChanged]);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${isOn ? 'border-sky-500/50 bg-sky-900/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'border-slate-800 bg-slate-800/30'} ${pulse ? 'ring-2 ring-sky-400 scale-[1.02]' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isOn ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
            {device.type === 'FAN' ? (
              <Fan className={`w-6 h-6 transition-transform ${isOn ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
            ) : (
              <Lightbulb className={`w-6 h-6 transition-all ${isOn ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] text-yellow-300' : ''}`} />
            )}
          </div>
          <div>
            <h3 className={`font-medium transition-colors ${isOn ? 'text-slate-100' : 'text-slate-400'}`}>{device.label}</h3>
            <p className="text-xs text-slate-500">{isOn ? `${device.wattage}W` : 'Off'}</p>
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full transition-colors ${isOn ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800/50 text-slate-500'}`}>
          {device.status}
        </div>
      </div>
    </div>
  );
}
