import { Router } from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../supabase';
import type { RoomId } from 'shared-types';

const router = Router();

const VALID_ROOMS = new Set<RoomId>(['drawing_room', 'work_room_1', 'work_room_2']);

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('devices').select('*').order('id', { ascending: true });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

router.get('/:room', async (req: Request, res: Response): Promise<void> => {
  const room = req.params.room as RoomId;
  if (!VALID_ROOMS.has(room)) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const { data, error } = await supabase.from('devices').select('*').eq('room', room).order('id', { ascending: true });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
