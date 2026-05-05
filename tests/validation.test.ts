import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js'; // Ensure app is exported in index.ts

// Mock the Claude client so we don't hit the real API or incur billing during tests
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

describe('The Validation Wall (Security & Boundary Tests)', () => {
  let authCookie: string;

  beforeAll(async () => {
    // 1. Penetrate the Vault (Mock Login to secure the JWT cookie)
    const loginRes = await request(app).post('/api/auth/login');
    authCookie = loginRes.headers['set-cookie'][0];
  });

  it('Payload Injection: Rejects string where array is expected (extracurriculars)', async () => {
    const res = await request(app)
      .post('/api/draft')
      .set('Cookie', authCookie)
      .send({
        scholarshipId: 's001',
        studentProfile: {
          firstName: 'John',
          major: 'Computer Science',
          gpa: 3.5,
          demographics: ['First-Generation'],
          // INJECTION: String instead of Array
          extracurriculars: 'Debate Team, Robotics', 
        }
      });

    // The validation wall should catch the type coercion immediately
    expect(res.status).toBe(400);
    const errorPaths = res.body.errors.map((e: any) => e.path);
    expect(errorPaths).toContain('studentProfile.extracurriculars');
  });

  it('Script Injection: Properly digests XSS payloads in string inputs', async () => {
    const res = await request(app)
      .post('/api/draft')
      .set('Cookie', authCookie)
      .send({
        scholarshipId: 's001',
        studentProfile: {
          firstName: 'John',
          major: 'CS',
          gpa: 3.5,
          demographics: ['Any'],
          extracurriculars: ['Chess'],
          // INJECTION: Malicious script
          personalNote: "<script>alert('XSS')</script>" 
        }
      });

    // The express-validator .escape() neutralizes the string. 
    // It shouldn't fail validation, it should just successfully pass an inert string to the logic.
    expect(res.status).toBe(200);
  });

  it('Boundary Testing: Rejects GPA over 5.0', async () => {
    const res = await request(app)
      .post('/api/draft')
      .set('Cookie', authCookie)
      .send({
        scholarshipId: 's001',
        studentProfile: {
          firstName: 'John',
          major: 'CS',
          // BOUNDARY VIOLATION: > 5.0
          gpa: 5.1, 
          demographics: ['Any'],
          extracurriculars: ['Chess']
        }
      });

    expect(res.status).toBe(400);
    const errorPaths = res.body.errors.map((e: any) => e.path);
    expect(errorPaths).toContain('studentProfile.gpa');
  });

  it('Boundary Testing: Rejects GPA below 0', async () => {
    const res = await request(app)
      .post('/api/draft')
      .set('Cookie', authCookie)
      .send({
        scholarshipId: 's001',
        studentProfile: {
          firstName: 'John',
          major: 'CS',
          // BOUNDARY VIOLATION: < 0
          gpa: -0.1, 
          demographics: ['Any'],
          extracurriculars: ['Chess']
        }
      });

    expect(res.status).toBe(400);
    const errorPaths = res.body.errors.map((e: any) => e.path);
    expect(errorPaths).toContain('studentProfile.gpa');
  });
});
