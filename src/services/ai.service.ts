import OpenAI from 'openai';
import { ElevenLabsClient } from 'elevenlabs';
import { config } from '../config/env';
import { Stream } from 'openai/streaming';

export class AIService {
    private openai: OpenAI;
    private elevenLabs: ElevenLabsClient;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.GROQ_API_KEY,
            baseURL: config.AI_BASE_URL,
        });

        this.elevenLabs = new ElevenLabsClient({
            apiKey: config.ELEVENLABS_API_KEY,
        });
    }

    async getResponseStream(
        messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
    ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        try {
            const stream = await this.openai.chat.completions.create({
                model: config.AI_MODEL,
                messages: messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 1024,
            });
            return stream;
        } catch (error) {
            console.error('Error getting AI response:', error);
            throw error;
        }
    }

    async textToSpeechStream(text: string, emotion: string = 'neutral', intensity: number = 0.5): Promise<NodeJS.ReadableStream> {
        try {
            // Map emotion to stability/similarity_boost
            const voiceSettings = this.getVoiceSettings(emotion, intensity);

            const audioStream = await this.elevenLabs.textToSpeech.convert(config.VOICE_ID, {
                text,
                model_id: config.AUDIO_MODEL,
                voice_settings: voiceSettings,
            });

            return audioStream;
        } catch (error) {
            console.error('Error generating TTS:', error);
            throw error;
        }
    }

    private getVoiceSettings(emotion: string, intensity: number) {
        // Base settings
        let stability = 0.5;
        let similarity_boost = 0.75;

        switch (emotion) {
            case 'happy':
                stability = 0.4;
                similarity_boost = 0.85;
                break;
            case 'sad':
                stability = 0.6;
                similarity_boost = 0.7;
                break;
            case 'angry':
                stability = 0.3;
                similarity_boost = 0.9;
                break;
            case 'calm':
                stability = 0.7;
                similarity_boost = 0.65;
                break;
            case 'anxious':
                stability = 0.35;
                similarity_boost = 0.8;
                break;
        }

        // Adjust by intensity
        stability = Math.max(0.1, stability - (intensity * 0.2));
        similarity_boost = Math.min(1.0, similarity_boost + (intensity * 0.15));

        return { stability, similarity_boost };
    }
}

export const aiService = new AIService();
