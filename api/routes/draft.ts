import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { SCHOLARSHIPS } from '../data/scholarships.js';
import { getMistralClient } from '../lib/mistralClient.js';
import { PROMPTS, MODELS } from '../lib/constants.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import type { DraftRequest } from '@/types/index.js';

const router = express.Router();

router.post('/', 
  requireAuth,
  [
    body('scholarshipId').isString().trim().escape().notEmpty(),
    body('studentProfile.firstName').isString().trim().escape().notEmpty(),
    body('studentProfile.major').isString().trim().escape(),
    body('studentProfile.gpa').isFloat({ min: 0, max: 5.0 }),
    body('studentProfile.extracurriculars').isArray(),
    body('studentProfile.extracurriculars.*').isString().trim().escape(),
    body('studentProfile.demographics').isArray(),
    body('studentProfile.demographics.*').isString().trim().escape(),
    body('studentProfile.personalNote').optional().isString().trim().escape()
  ],
  async (req: Request<{}, {}, DraftRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { scholarshipId, studentProfile } = req.body;

    let scholarship = SCHOLARSHIPS.find(s => s.id === scholarshipId);
    
    // Support dynamic AI-generated scholarships for demo purposes
    if (!scholarship) {
      scholarship = {
        id: scholarshipId,
        name: "this dynamic scholarship",
        essayPrompt: "Explain how your background and goals make you the perfect candidate for this opportunity.",
        description: "Dynamic", amount: 0, gpaMin: 0, url: "", provider: "Dynamic"
      };
    }

  try {
    const client = getMistralClient();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const userMessage = `Scholarship: ${scholarship.name}\nEssay prompt: ${scholarship.essayPrompt}\nStudent profile: ${JSON.stringify(studentProfile)}\nWrite the essay now.`;

    if (client.apiKey === 'dummy_key') {
      // Mock streaming for demo purposes
      const chunks = [
        "Technology has always been a driving force in my life. ",
        "From building my first computer to coding small tools for my community, ",
        "I've seen firsthand how technical solutions can solve complex real-world problems. ",
        "This scholarship will allow me to dedicate my focus entirely to my Computer Science major ",
        "and help me become the innovator I aspire to be."
      ];
      for (const chunk of chunks) {
        await new Promise(r => setTimeout(r, 400)); // Simulate chunk delay
        res.write(`data: ${chunk}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const stream = await client.chat.stream({
      model: MODELS.MISTRAL_LARGE,
      messages: [
        { role: 'system', content: PROMPTS.SYSTEM_ESSAY_COACH },
        { role: 'user', content: userMessage }
      ]
    });

    for await (const chunk of stream) {
      // Mistral streaming structure might vary slightly by version, safely extract delta
      const deltaContent = (chunk as any).data?.choices?.[0]?.delta?.content || (chunk as any).choices?.[0]?.delta?.content;
      if (deltaContent) {
        res.write(`data: ${deltaContent}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("Error drafting essay:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate essay draft" });
    } else {
      res.write(`data: [ERROR] ${error.message}\n\n`);
      res.end();
    }
  }
});

export default router;
