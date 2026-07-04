import { Router } from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('alerts').select('*').order('triggeredAt', { ascending: false }).limit(50);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

export default router;
