import { Device, RoomId } from 'shared-types';

const API_URL = 'http://localhost:3001';

export async function fetchStatus(): Promise<Device[]> {
  const res = await fetch(`${API_URL}/api/devices`);
  if (!res.ok) throw new Error('Failed to fetch devices');
  return res.json() as Promise<Device[]>;
}

export async function fetchRoom(room: string): Promise<Device[] | { error: string }> {
  const res = await fetch(`${API_URL}/api/devices/${room}`);
  if (!res.ok) {
    if (res.status === 404) return { error: 'Room not found' };
    throw new Error('Failed to fetch room');
  }
  return res.json() as Promise<Device[]>;
}

export async function fetchUsage(): Promise<{ totalWatts: number, roomBreakdown: Record<string, number> }> {
  const res = await fetch(`${API_URL}/api/power/summary`);
  if (!res.ok) throw new Error('Failed to fetch power summary');
  return res.json() as Promise<{ totalWatts: number, roomBreakdown: Record<string, number> }>;
}
