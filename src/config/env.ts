import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().default('file:../mindmatrix.db'),
    GROQ_API_KEY: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    AI_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),
    AI_MODEL: z.string().default('llama-3.3-70b-versatile'),
    VOICE_ID: z.string().default('21m00Tcm4TlvDq8ikWAM'),
    AUDIO_MODEL: z.string().default('eleven_monolingual_v1'),
});

const processEnv = envSchema.safeParse(process.env);

if (!processEnv.success) {
    console.error('❌ Invalid environment variables:', processEnv.error.format());
    process.exit(1);
}

export const config = processEnv.data;
