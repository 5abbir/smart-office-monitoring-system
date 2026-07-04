import { Router } from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('devices').select('room, wattage');
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  let totalWatts = 0;
  const roomBreakdown: Record<string, number> = {
    drawing_room: 0,
    work_room_1: 0,
    work_room_2: 0
  };

  if (data) {
    for (const d of data) {
      totalWatts += d.wattage;
      if (roomBreakdown[d.room] !== undefined) {
        roomBreakdown[d.room] += d.wattage;
      }
    }
  }

  res.json({ totalWatts, roomBreakdown });
});

export default router;
