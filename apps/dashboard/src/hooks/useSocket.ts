import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { Device, Alert } from 'shared-types';

export function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [deviceUpdates, setDeviceUpdates] = useState<Device | null>(null);
  const [newAlerts, setNewAlerts] = useState<Alert | null>(null);

  useEffect(() => {
    const s = io(url);
    setSocket(s);

    s.on('device:update', (device: Device) => {
      setDeviceUpdates(device);
    });

    s.on('alert:new', (alert: Alert) => {
      setNewAlerts(alert);
    });

    return () => {
      s.disconnect();
    };
  }, [url]);

  return { socket, deviceUpdates, newAlerts };
}
