import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getMistralClient } from '../lib/mistralClient.js';
import { MODELS } from '../lib/constants.js';
import type { StudentQuery } from '@/types/index.js';

const router = express.Router();

router.post('/', 
  [
    body('zipCode').optional().isString().trim().matches(/^\d{5}$/).withMessage('ZipCode must be exactly 5 digits').escape(),
    body('gpa').optional().isFloat({ min: 0, max: 5.0 }),
    body('major').optional().isString().trim().escape(),
    body('demographics').optional().isArray(),
    body('demographics.*').isString().trim().escape(),
    body('extracurriculars').optional().isArray(),
    body('extracurriculars.*').isString().trim().escape(),
  ],
  async (req: Request<{}, {}, StudentQuery>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const client = getMistralClient();
      const userMessage = `Based on the following student profile, search your knowledge base for 3-5 real-world scholarships that they qualify for. Return the results in pure JSON format matching this exact array schema: [{ "id": "string", "name": "string", "description": "string", "amount": number, "gpaMin": number, "url": "string", "matchReason": "string", "deadline": "string", "matchScore": 95, "essayPrompt": "string" }]. 
Student Profile: 
ZipCode: ${req.body.zipCode || 'Not specified'}
GPA: ${req.body.gpa || 'Not specified'}
Major: ${req.body.major || 'Not specified'}
Demographics: ${(req.body.demographics || []).join(', ') || 'Not specified'}
Extracurriculars: ${(req.body.extracurriculars || []).join(', ') || 'Not specified'}

IMPORTANT: Output strictly a raw JSON array. Do not include markdown code blocks like \`\`\`json.`;

      let textContent = "[]";

      if (!process.env.MISTRAL_API_KEY) {
        // Fallback for demo recording when no real API key is present
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
        textContent = JSON.stringify([
          {
            id: "mock-1",
            name: "Connecticut STEM Innovators Scholarship",
            description: "A scholarship for aspiring STEM majors in CT.",
            amount: 5000,
            gpaMin: 3.0,
            url: "https://example.com/ct-stem",
            matchReason: "Matches your Major and State",
            deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
            matchScore: 95,
            essayPrompt: "Describe a time you solved a complex problem using technology."
          },
          {
            id: "mock-2",
            name: "First-Generation College Student Grant",
            description: "Financial assistance for first-generation students.",
            amount: 2500,
            gpaMin: 2.5,
            url: "https://example.com/first-gen",
            matchReason: "Matches your Demographics",
            deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
            matchScore: 88,
            essayPrompt: "What does being the first in your family to attend college mean to you?"
          }
        ]);
      } else {
        const response = await client.chat.complete({
          model: MODELS.MISTRAL_LARGE,
          messages: [
            { role: 'system', content: "You are a scholarship search engine. Return only a raw JSON array of scholarships." },
            { role: 'user', content: userMessage }
          ]
        });

        textContent = typeof response.choices?.[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : "[]";
      }
      // Fallback regex to extract JSON if wrapped in markdown despite instructions
      const jsonMatch = textContent.match(/\[.*\]/s);
      const rawJson = jsonMatch ? jsonMatch[0] : textContent;
      
      const results = JSON.parse(rawJson);

      res.json({
        count: results.length,
        scholarships: results
      });
    } catch (error) {
      console.error("Error matching scholarships via Mistral:", error);
      res.status(500).json({ error: "Failed to find live scholarships from Mistral AI" });
    }
  }
);

export default router;
