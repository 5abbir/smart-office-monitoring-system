import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

// Mock Supabase
vi.mock('../src/supabase', () => {
  return {
    supabase: {
      from: vi.fn((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          eq: vi.fn((field, value) => {
            return {
              order: vi.fn().mockResolvedValue({
                data: table === 'devices' && value === 'drawing_room' ? [
                  { id: 'drawing_room-fan-1', type: 'FAN', room: 'drawing_room', wattage: 60, status: 'ON' }
                ] : [],
                error: null
              })
            }
          }),
          then: vi.fn((resolve) => {
            if (table === 'devices') {
              resolve({
                data: [
                  { id: 'drawing_room-fan-1', type: 'FAN', room: 'drawing_room', wattage: 60, status: 'ON' },
                  { id: 'drawing_room-light-1', type: 'LIGHT', room: 'drawing_room', wattage: 15, status: 'ON' },
                  { id: 'work_room_1-fan-1', type: 'FAN', room: 'work_room_1', wattage: 0, status: 'OFF' }
                ],
                error: null
              });
            } else if (table === 'alerts') {
              resolve({
                data: [
                  { id: '1', type: 'AFTER_HOURS', room: 'drawing_room', message: 'Test alert' }
                ],
                error: null
              })
            }
          })
        };
      })
    }
  };
});

describe('API Endpoints', () => {
  it('GET /api/devices should return devices', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0].id).toBe('drawing_room-fan-1');
  });

  it('GET /api/devices/:room should return filtered devices', async () => {
    const res = await request(app).get('/api/devices/drawing_room');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /api/devices/:room should return 404 for invalid room', async () => {
    const res = await request(app).get('/api/devices/invalid_room');
    expect(res.status).toBe(404);
  });

  it('GET /api/power/summary should calculate power correctly', async () => {
    const res = await request(app).get('/api/power/summary');
    expect(res.status).toBe(200);
    expect(res.body.totalWatts).toBe(75); // 60 + 15
    expect(res.body.roomBreakdown.drawing_room).toBe(75);
    expect(res.body.roomBreakdown.work_room_1).toBe(0);
  });

  it('GET /api/alerts should return alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe('AFTER_HOURS');
  });
});
