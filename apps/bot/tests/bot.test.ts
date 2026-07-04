import { describe, it, expect, vi } from 'vitest';
import { fetchStatus, fetchRoom, fetchUsage } from '../src/api';

global.fetch = vi.fn();

describe('Bot API Fetcher', () => {
  it('should fetch status', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'device-1' }]
    });
    const data = await fetchStatus();
    expect(data.length).toBe(1);
    expect(data[0].id).toBe('device-1');
  });

  it('should fetch room', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'drawing_room-fan-1' }]
    });
    const data = await fetchRoom('drawing_room');
    expect((data as any)[0].id).toBe('drawing_room-fan-1');
  });

  it('should handle room not found', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    const data = await fetchRoom('invalid_room');
    expect(data).toHaveProperty('error', 'Room not found');
  });

  it('should fetch usage', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalWatts: 100, roomBreakdown: {} })
    });
    const data = await fetchUsage();
    expect(data.totalWatts).toBe(100);
  });
});
