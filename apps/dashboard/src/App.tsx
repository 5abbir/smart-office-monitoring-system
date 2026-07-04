import { useEffect, useState, useMemo } from 'react';
import type { Device, Alert } from 'shared-types';
import { useSocket } from './hooks/useSocket';
import { DeviceCard } from './components/DeviceCard';
import { Activity, Zap, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { deviceUpdates, newAlerts } = useSocket(API_URL);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_URL}/api/devices`)
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(console.error);

    fetch(`${API_URL}/api/alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error);
  }, []);

  // Handle incoming socket updates
  useEffect(() => {
    if (deviceUpdates) {
      setDevices(prev => 
        prev.map(d => d.id === deviceUpdates.id ? deviceUpdates : d)
      );
    }
  }, [deviceUpdates]);

  useEffect(() => {
    if (newAlerts) {
      setAlerts(prev => [newAlerts, ...prev].slice(0, 50));
    }
  }, [newAlerts]);

  // Derived state
  const { totalWatts, roomWatts } = useMemo(() => {
    let total = 0;
    const byRoom: Record<string, number> = {};
    devices.forEach(d => {
      total += d.wattage;
      byRoom[d.room] = (byRoom[d.room] || 0) + d.wattage;
    });
    return { totalWatts: total, roomWatts: byRoom };
  }, [devices]);

  const devicesByRoom = useMemo(() => {
    const grouped: Record<string, Device[]> = {};
    devices.forEach(d => {
      if (!grouped[d.room]) grouped[d.room] = [];
      grouped[d.room].push(d);
    });
    return grouped;
  }, [devices]);

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-sky-400" />
            Office Energy Monitor
          </h1>
          <p className="text-slate-400 mt-1">Real-time status and power consumption</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
          <Zap className="w-6 h-6 text-yellow-400" />
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total Draw</div>
            <div className="text-2xl font-bold text-white">{totalWatts}<span className="text-sm text-slate-500 ml-1">W</span></div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rooms Panel */}
        <div className="lg:col-span-2 space-y-8">
          {Object.entries(devicesByRoom).map(([room, roomDevices]) => (
            <section key={room} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200 capitalize">
                  {room.replace(/_/g, ' ')}
                </h2>
                <div className="text-sm font-medium text-slate-400">
                  {roomWatts[room] || 0}W
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roomDevices.map(device => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Alerts Panel */}
        <aside className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-200">Active Alerts</h2>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <p>All systems nominal.</p>
              </div>
            ) : (
              <div className="overflow-y-auto p-4 space-y-3">
                {alerts.map(alert => {
                  const isStagnation = alert.type === 'ROOM_STAGNATION';
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-xl border-l-4 animate-in fade-in slide-in-from-right-4 duration-300 ${
                        isStagnation 
                          ? 'border-l-red-500 bg-red-950/20 border-y border-r border-red-900/30' 
                          : 'border-l-amber-500 bg-amber-950/20 border-y border-r border-amber-900/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${isStagnation ? 'text-red-200' : 'text-amber-200'}`}>
                          {alert.message}
                        </p>
                        <span className="text-[10px] whitespace-nowrap text-slate-500 mt-1">
                          {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}
