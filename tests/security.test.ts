import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// Mock Claude just to be absolutely certain we don't hit billing if a test fails
vi.mock('../api/lib/mistralClient.js', () => ({
  getMistralClient: () => ({
    chat: {
      stream: () => async function* () {
        yield { choices: [{ delta: { content: 'Drafted essay.' } }] };
      },
      complete: async () => ({
        choices: [{ message: { content: '[]' } }]
      })
    }
  })
}));

describe('The Auth Gate (Security Tests)', () => {

  it('Unauthenticated Access: Blocks /api/draft POST when missing httpOnly JWT cookie', async () => {
    // We intentionally omit setting the 'Cookie' header (Simulating missing auth)
    const res = await request(app)
      .post('/api/draft')
      .send({
        scholarshipId: 's001',
        studentProfile: {
          firstName: 'John',
          major: 'CS',
          gpa: 3.5,
          extracurriculars: ['Chess'],
          demographics: ['Any']
        }
      });

    // The authMiddleware should trap this instantly and return a 401
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('CORS Bypass: Rejects preflight requests from an unwhitelisted origin', async () => {
    // Set a mock environment variable just for this test
    process.env.ALLOWED_ORIGINS = 'https://grantpath.vercel.app';

    // We attempt a preflight OPTIONS request from an unauthorized domain
    const res = await request(app)
      .options('/api/find') // Preflight request
      .set('Origin', 'http://malicious-hacker-site.com')
      .set('Access-Control-Request-Method', 'POST');

    // Since our CORS configuration throws `new Error('Not allowed by CORS')` for bad origins,
    // Express catches this and translates it to a 500 error state.
    // The critical part is that no Access-Control-Allow-Origin header is granted.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).toBe(500); 
    expect(res.text).toContain('Not allowed by CORS');
  });
});
