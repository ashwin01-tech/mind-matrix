export class EmotionService {
    private emotions: Record<string, { keywords: string[]; baseline: number }> = {
        happy: {
            keywords: ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'love'],
            baseline: 0.8,
        },
        sad: {
            keywords: ['sad', 'unhappy', 'depressed', 'blue', 'down', 'terrible', 'awful'],
            baseline: 0.2,
        },
        angry: {
            keywords: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed', 'hate'],
            baseline: 0.3,
        },
        anxious: {
            keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress'],
            baseline: 0.25,
        },
        calm: {
            keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'chill', 'cool'],
            baseline: 0.7,
        },
    };

    detectEmotion(text: string): { emotion: string; intensity: number } {
        const lowerText = text.toLowerCase();
        const scores: Record<string, number> = {};

        for (const [emotion, data] of Object.entries(this.emotions)) {
            let score = 0;
            let found = false;

            for (const keyword of data.keywords) {
                if (lowerText.includes(keyword)) {
                    score += data.baseline * 0.5;
                    found = true;
                }
            }

            if (found) {
                // Check for punctuation emphasis
                if (/[!?.]{2,}/.test(text)) score += 0.1;
                // Check for CAPS
                const capsCount = (text.match(/[A-Z]/g) || []).length;
                if (capsCount > text.length * 0.5) score += 0.1;

                scores[emotion] = Math.min(score, 1.0);
            }
        }

        if (Object.keys(scores).length === 0) {
            return { emotion: 'neutral', intensity: 0.5 };
        }

        const dominantEmotion = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b));
        return { emotion: dominantEmotion[0], intensity: dominantEmotion[1] };
    }
}

export const emotionService = new EmotionService();
