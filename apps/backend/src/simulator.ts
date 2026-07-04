import { supabase } from './supabase';
import { Device, Alert, RoomId } from 'shared-types';
import { Server } from 'socket.io';

let io: Server;

export function initSimulator(socketServer: Server) {
  io = socketServer;
  
  // Every 10 seconds, randomly toggle some devices
  setInterval(simulateDeviceChanges, 10000);

  // Every 60 seconds, check for alerts
  setInterval(checkAlerts, 60000);
}

async function simulateDeviceChanges() {
  const { data, error } = await supabase.from('devices').select('*');
  if (error || !data) return;

  const devices = data as Device[];
  let changed = false;

  for (const device of devices) {
    // 10% chance to flip each device
    if (Math.random() < 0.1) {
      const newStatus = device.status === 'ON' ? 'OFF' : 'ON';
      let wattage = 0;
      if (newStatus === 'ON') {
        wattage = device.type === 'FAN' ? 60 : 15;
      }
      
      const lastChanged = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('devices')
        .update({ status: newStatus, wattage, lastChanged })
        .eq('id', device.id);

      if (!updateError) {
        changed = true;
        const updatedDevice = { ...device, status: newStatus, wattage, lastChanged };
        // Broadcast change
        io.emit('device:update', updatedDevice);
      }
    }
  }
}

async function checkAlerts() {
  const { data: devicesData, error: devicesError } = await supabase.from('devices').select('*');
  if (devicesError || !devicesData) return;

  const devices = devicesData as Device[];
  const now = new Date();
  const currentHour = now.getHours();
  const isAfterHours = currentHour < 9 || currentHour >= 17;

  const activeAlerts = new Map<string, Alert>(); // room-type -> Alert to avoid duplicates
  
  // Fetch existing recent alerts to avoid duplicate fires (e.g. within last 1 hour)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const { data: existingAlerts } = await supabase
    .from('alerts')
    .select('*')
    .gte('triggeredAt', oneHourAgo);
    
  if (existingAlerts) {
    for (const a of existingAlerts) {
      activeAlerts.set(`${a.room}-${a.type}`, a);
    }
  }

  // 1. After hours check
  if (isAfterHours) {
    for (const device of devices) {
      if (device.status === 'ON') {
        const key = `${device.room}-AFTER_HOURS`;
        if (!activeAlerts.has(key)) {
          await triggerAlert('AFTER_HOURS', device.room, `Device ${device.label} is ON after office hours.`);
          activeAlerts.set(key, { id: '', type: 'AFTER_HOURS', room: device.room, message: '', triggeredAt: '' }); // dummy value to prevent repeat in same loop
        }
      }
    }
  }

  // 2. Stagnation check
  const rooms: RoomId[] = ['drawing_room', 'work_room_1', 'work_room_2'];
  const twoHoursAgoTime = now.getTime() - 2 * 60 * 60 * 1000;

  for (const room of rooms) {
    const roomDevices = devices.filter(d => d.room === room);
    if (roomDevices.length === 0) continue;

    const allOn = roomDevices.every(d => d.status === 'ON');
    const allStagnant = roomDevices.every(d => new Date(d.lastChanged).getTime() < twoHoursAgoTime);

    if (allOn && allStagnant) {
      const key = `${room}-ROOM_STAGNATION`;
      if (!activeAlerts.has(key)) {
        await triggerAlert('ROOM_STAGNATION', room, `All devices in ${room.replace(/_/g, ' ')} have been ON for over 2 hours.`);
        activeAlerts.set(key, { id: '', type: 'ROOM_STAGNATION', room, message: '', triggeredAt: '' });
      }
    }
  }
}

async function triggerAlert(type: "AFTER_HOURS" | "ROOM_STAGNATION", room: RoomId, message: string) {
  const alertId = `${type}-${room}-${Date.now()}`;
  const triggeredAt = new Date().toISOString();
  
  const newAlert = {
    id: alertId,
    type,
    room,
    message,
    triggeredAt
  };

  const { error } = await supabase.from('alerts').insert(newAlert);
  if (!error) {
    io.emit('alert:new', newAlert);
  } else {
    console.error('Error inserting alert:', error);
  }
}
