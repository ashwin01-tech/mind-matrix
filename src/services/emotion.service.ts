export interface EmotionAnalysis {
    emotion: string;
    intensity: number;
    valence?: 'positive' | 'negative' | 'neutral' | 'mixed';
    arousal?: 'low' | 'medium' | 'high';
    secondary?: string[];
    triggers?: string[];
    cognitiveDistortions?: string[];
}

export class EmotionService {
    private emotions: Record<string, { keywords: string[]; baseline: number }> = {
        happy: {
            keywords: ['happy', 'joy', 'joyful', 'excited', 'great', 'awesome', 'wonderful', 'love', 'delighted', 'thrilled', 'proud', 'grateful', 'blessed', 'hopeful', 'cheerful'],
            baseline: 0.8,
        },
        sad: {
            keywords: ['sad', 'sadness', 'unhappy', 'depressed', 'blue', 'down', 'terrible', 'awful', 'miserable', 'lonely', 'grief', 'lost', 'empty', 'heartbroken', 'devastated'],
            baseline: 0.2,
        },
        angry: {
            keywords: ['angry', 'anger', 'furious', 'fury', 'mad', 'irritated', 'frustrated', 'annoyed', 'hate', 'despise', 'disgusted', 'livid', 'enraged', 'outraged', 'bitter', 'resentful', 'bullshit', 'fuck', 'damn', 'pissed', 'rage', 'sick of', 'fed up', 'screw', 'hell', 'crap', 'sucks', 'stupid', 'idiot', 'ridiculous', 'pathetic'],
            baseline: 0.3,
        },
        anxious: {
            keywords: ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'scared', 'afraid', 'fear', 'panic', 'stress', 'stressed', 'overwhelmed', 'uncertain', 'uneasy', 'terrified'],
            baseline: 0.25,
        },
        calm: {
            keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'chill', 'cool', 'collected', 'composed', 'tranquil', 'zen', 'balanced', 'grounded'],
            baseline: 0.7,
        },
        aggressive: {
            keywords: ['kill', 'murder', 'destroy', 'harm', 'hurt', 'attack', 'fight', 'violence', 'violent', 'brutal', 'savage', 'ruthless', 'vicious', 'assault', 'beat'],
            baseline: 0.35,
        },
        fearful: {
            keywords: ['afraid', 'fear', 'scared', 'terrified', 'horrified', 'dread', 'phobia', 'petrified', 'apprehensive', 'paranoid'],
            baseline: 0.3,
        },
        disgusted: {
            keywords: ['disgusted', 'disgust', 'gross', 'yuck', 'repulsed', 'repulsion', 'vile', 'revolting', 'nauseated', 'sickened', 'repugnant'],
            baseline: 0.25,
        },
    };

    private cognitiveDistortions: Record<string, string[]> = {
        catastrophizing: ['worst', 'never', 'always', 'disaster', 'ruined', 'end of the world', 'terrible'],
        'all-or-nothing': ['always', 'never', 'completely', 'total failure', 'perfect', 'worthless'],
        overgeneralization: ['everything', 'nothing', 'never', 'always', 'every time'],
        personalization: ["it's my fault", 'i caused', 'because of me', 'my responsibility'],
        'mind-reading': ['they think', 'they know', 'everyone knows', 'they must'],
        'should-statements': ['should', 'must', 'ought to', "shouldn't"],
    };

    detectEmotion(text: string): EmotionAnalysis {
        const lowerText = text.toLowerCase();
        const scores: Record<string, number> = {};
        let maxScore = 0;
        let dominantEmotion = 'neutral';

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
                if (score > maxScore) {
                    maxScore = score;
                    dominantEmotion = emotion;
                }
            }
        }

        // Boost intensity for strong negative patterns
        if (lowerText.match(/\b(is|are|was|were)\s+(bullshit|crap|stupid|ridiculous|pathetic|awful|terrible)\b/)) {
            if (scores['angry']) {
                scores['angry'] = Math.min(1.0, scores['angry'] + 0.3);
                if (scores['angry'] > maxScore) {
                    maxScore = scores['angry'];
                    dominantEmotion = 'angry';
                }
            } else {
                scores['angry'] = 0.6;
                maxScore = 0.6;
                dominantEmotion = 'angry';
            }
        }

        // Detect cognitive distortions
        const detectedDistortions = this.detectCognitiveDistortions(text);

        // Determine valence, arousal, and secondary emotions
        const analysis: EmotionAnalysis = {
            emotion: maxScore > 0 ? dominantEmotion : 'neutral',
            intensity: maxScore > 0 ? Math.min(1.0, maxScore) : 0.5,
            valence: this.determineValence(dominantEmotion),
            arousal: this.determineArousal(dominantEmotion),
            secondary: this.getSecondaryEmotions(scores, dominantEmotion),
            triggers: this.extractTriggers(text),
            cognitiveDistortions: detectedDistortions,
        };

        return analysis;
    }

    private determineValence(emotion: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
        const positiveEmotions = ['happy', 'calm', 'peaceful'];
        const negativeEmotions = ['sad', 'angry', 'anxious', 'aggressive', 'fearful', 'disgusted'];

        if (positiveEmotions.includes(emotion)) return 'positive';
        if (negativeEmotions.includes(emotion)) return 'negative';
        return 'neutral';
    }

    private determineArousal(emotion: string): 'low' | 'medium' | 'high' {
        const highArousalEmotions = ['angry', 'excited', 'aggressive', 'fearful'];
        const lowArousalEmotions = ['calm', 'sad', 'peaceful'];

        if (highArousalEmotions.includes(emotion)) return 'high';
        if (lowArousalEmotions.includes(emotion)) return 'low';
        return 'medium';
    }

    private getSecondaryEmotions(scores: Record<string, number>, primary: string): string[] {
        return Object.entries(scores)
            .filter(([emotion, score]) => emotion !== primary && score > 0.3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([emotion]) => emotion);
    }

    private detectCognitiveDistortions(text: string): string[] {
        const lowerText = text.toLowerCase();
        const detected: string[] = [];

        for (const [distortion, patterns] of Object.entries(this.cognitiveDistortions)) {
            for (const pattern of patterns) {
                if (lowerText.includes(pattern)) {
                    detected.push(distortion);
                    break;
                }
            }
        }

        return [...new Set(detected)]; // Remove duplicates
    }

    private extractTriggers(text: string): string[] {
        const triggers: string[] = [];
        const triggerPatterns = [
            { pattern: /(work|job|boss|office|meeting|deadline)/gi, label: 'Work' },
            { pattern: /(family|mom|dad|parent|sibling|brother|sister)/gi, label: 'Family' },
            { pattern: /(relationship|partner|boyfriend|girlfriend|wife|husband|dating)/gi, label: 'Relationship' },
            { pattern: /(health|sick|disease|pain|doctor|hospital)/gi, label: 'Health' },
            { pattern: /(money|financial|debt|bills|broke|poor)/gi, label: 'Financial' },
            { pattern: /(school|exam|test|homework|assignment)/gi, label: 'School' },
            { pattern: /(friend|friendship|betrayal|conflict)/gi, label: 'Friendship' },
        ];

        for (const { pattern, label } of triggerPatterns) {
            if (pattern.test(text)) {
                triggers.push(label);
            }
        }

        return [...new Set(triggers)]; // Remove duplicates
    }
}

export const emotionService = new EmotionService();
