import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

let client: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (!client) {
    if (!process.env.MISTRAL_API_KEY) {
      console.warn("MISTRAL_API_KEY is not set. API calls will fail.");
    }
    client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY || 'dummy_key',
    });
  }
  return client;
}
