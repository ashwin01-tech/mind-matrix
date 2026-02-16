import { emotionService } from './emotion.service';
import { aiService } from './ai.service';

export interface EmotionAIAnalysis {
  emotion: string;
  intensity: number;
  valence: 'positive' | 'negative' | 'neutral' | 'mixed';
  arousal: 'low' | 'medium' | 'high';
  confidence: number; // 0-1 score for LLM confidence
  triggers: string[];
  cognitiveDistortions: string[];
  psychological_state?: string;
  recommendations?: string[];
  method: 'llm' | 'keyword'; // Which method was used
}

/**
 * Advanced emotion analysis using LLM with keyword fallback
 * Provides context-aware emotion detection with psychological insights
 */
class EmotionAIService {
  /**
   * Analyze emotion using LLM first, with keyword fallback
   * @param text - User message text
   * @param conversationHistory - Past messages for context
   * @returns Comprehensive emotion analysis
   */
  async analyzeEmotion(
    text: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<EmotionAIAnalysis> {
    // Try LLM-based analysis first
    try {
      return await this.analyzeWithLLM(text, conversationHistory);
    } catch (error) {
      console.warn(
        'LLM emotion analysis failed, falling back to keyword analysis:',
        error
      );
      // Fallback to keyword-based analysis
      return this.analyzeWithKeywords(text);
    }
  }

  /**
   * Analyze emotion using Groq LLM for context awareness
   */
  private async analyzeWithLLM(
    text: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<EmotionAIAnalysis> {
    try {
      const response = await aiService.analyzeEmotionWithLLM(text, conversationHistory);
      
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Parse JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          method: 'llm' as const,
        };
      }
    } catch (error) {
      throw new Error('Failed to parse LLM response');
    }

    throw new Error('Invalid LLM response');
  }

  /**
   * Fallback to keyword-based analysis from emotion.service
   */
  private analyzeWithKeywords(text: string): EmotionAIAnalysis {
    const keywordAnalysis = emotionService.detectEmotion(text);

    // Map keyword analysis to LLM format
    return {
      emotion: keywordAnalysis.emotion,
      intensity: keywordAnalysis.intensity,
      valence: keywordAnalysis.valence || 'neutral',
      arousal: keywordAnalysis.arousal || 'medium',
      confidence: 0.6, // Lower confidence for keyword-based
      triggers: keywordAnalysis.triggers || [],
      cognitiveDistortions: keywordAnalysis.cognitiveDistortions || [],
      recommendations: this.getRecommendations(keywordAnalysis.emotion),
      method: 'keyword',
    };
  }

  /**
   * Get coping recommendations based on emotion
   */
  private getRecommendations(emotion: string): string[] {
    const recommendations: Record<string, string[]> = {
      happy: [
        'Continue engaging in activities that bring you joy',
        'Share your positive energy with others',
        'Maintain healthy lifestyle habits',
      ],
      sad: [
        'Reach out to supportive people',
        'Engage in activities you enjoy',
        'Consider speaking with a therapist',
        'Practice self-compassion',
      ],
      angry: [
        'Take deep breaths to calm yourself',
        'Step away from the situation briefly',
        'Channel anger into productive activities',
        'Consider what triggered this emotion',
      ],
      anxious: [
        'Practice grounding exercises (5-4-3-2-1 technique)',
        'Try slow breathing exercises',
        'Break tasks into smaller steps',
        'Limit caffeine intake',
      ],
      calm: [
        'Maintain this peaceful state',
        'Use this time for reflection',
        'Share your calmness with others',
      ],
      aggressive: [
        'URGENT: Step away from the situation',
        'Practice deep breathing immediately',
        'Consider talking to a mental health professional',
        'Identify safe coping strategies',
      ],
      fearful: [
        'Acknowledge your fear is valid',
        'Break down the fear into manageable parts',
        'Practice grounding techniques',
        'Seek support from trusted people',
      ],
      disgusted: [
        'Explore what triggered this feeling',
        'Set healthy boundaries',
        'Talk to someone about the situation',
        'Practice self-care',
      ],
      neutral: [
        'Reflect on your day',
        'Journal about your thoughts',
        'Practice mindfulness',
      ],
    };

    return recommendations[emotion] || recommendations.neutral;
  }

  /**
   * Assess crisis risk based on emotion analysis
   * Returns risk level: low, medium, high, critical
   */
  async assessCrisisRisk(analysis: EmotionAIAnalysis): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    requires_immediate_help: boolean;
  }> {
    const crisisIndicators: string[] = [];
    let riskScore = 0;

    // Check for high-risk emotions
    if (
      analysis.emotion === 'aggressive' &&
      analysis.intensity > 0.7
    ) {
      crisisIndicators.push('High intensity aggressive emotion');
      riskScore += 3;
    }

    if (analysis.emotion === 'fearful' && analysis.intensity > 0.8) {
      crisisIndicators.push('Extreme fear');
      riskScore += 2;
    }

    if (analysis.emotion === 'sad' && analysis.intensity > 0.9) {
      crisisIndicators.push('Severe sadness/depression');
      riskScore += 2;
    }

    // Check for concerning distortions
    if (analysis.cognitiveDistortions.includes('catastrophizing')) {
      crisisIndicators.push('Catastrophic thinking patterns');
      riskScore += 1;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 5) riskLevel = 'critical';
    else if (riskScore >= 3) riskLevel = 'high';
    else if (riskScore >= 1) riskLevel = 'medium';

    return {
      riskLevel,
      indicators: crisisIndicators,
      requires_immediate_help: riskLevel === 'critical',
    };
  }

  /**
   * Get psychological insights from analysis
   */
  async generateInsights(analysis: EmotionAIAnalysis): Promise<string> {
    const insights: string[] = [];

    // Emotion intensity insight
    if (analysis.intensity > 0.8) {
      insights.push(
        `You're experiencing a strong ${analysis.emotion} emotion right now.`
      );
    } else if (analysis.intensity > 0.5) {
      insights.push(
        `You seem to be feeling somewhat ${analysis.emotion} at the moment.`
      );
    } else {
      insights.push(
        `There are hints of ${analysis.emotion} in what you're expressing.`
      );
    }

    // Cognitive distortion insight
    if (analysis.cognitiveDistortions.length > 0) {
      insights.push(
        `I notice you might be engaging in ${analysis.cognitiveDistortions.join(' and ')} thinking.`
      );
    }

    // Trigger insight
    if (analysis.triggers.length > 0) {
      insights.push(
        `Your current emotion seems connected to: ${analysis.triggers.join(', ')}`
      );
    }

    // Psychological state insight
    if (analysis.psychological_state) {
      insights.push(`\nPsychological Context: ${analysis.psychological_state}`);
    }

    return insights.join(' ');
  }
}

export default new EmotionAIService();
