import express, { Request, Response } from 'express';
import { SCHOLARSHIPS } from '../data/scholarships.js';

const router = express.Router();

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const scholarship = SCHOLARSHIPS.find(s => s.id === id);
  
  if (!scholarship) {
    return res.status(404).json({ error: "Scholarship not found" });
  }
  
  res.json(scholarship);
});

export default router;
