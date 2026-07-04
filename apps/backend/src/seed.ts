import { Device, RoomId } from 'shared-types';
import { supabase } from './supabase';

const ROOMS: RoomId[] = ['drawing_room', 'work_room_1', 'work_room_2'];

export async function seedDevicesIfEmpty() {
  const { data, error } = await supabase.from('devices').select('id').limit(1);
  if (error) {
    console.error('❌ Error checking devices table:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Devices already seeded.');
    return;
  }

  console.log('🌱 Seeding devices...');
  const devices: Omit<Device, 'lastChanged'>[] = [];

  for (const room of ROOMS) {
    // 2 fans
    for (let i = 1; i <= 2; i++) {
      devices.push({
        id: `${room}-fan-${i}`,
        type: 'FAN',
        room,
        label: `Fan ${i}`,
        status: 'OFF',
        wattage: 0,
      });
    }
    // 3 lights
    for (let i = 1; i <= 3; i++) {
      devices.push({
        id: `${room}-light-${i}`,
        type: 'LIGHT',
        room,
        label: `Light ${i}`,
        status: 'OFF',
        wattage: 0,
      });
    }
  }

  const devicesToInsert = devices.map(d => ({
    ...d,
    lastChanged: new Date().toISOString()
  }));

  const { error: insertError } = await supabase.from('devices').insert(devicesToInsert);
  
  if (insertError) {
    console.error('❌ Error seeding devices:', insertError.message);
  } else {
    console.log('✅ Seeded 15 devices successfully.');
  }
}
