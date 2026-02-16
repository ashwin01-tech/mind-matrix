/**
 * Memory Service for Mind Matrix
 * Tracks user patterns, emotional history, and provides context
 * for more informed responses
 */

export interface UserMemory {
  userId: string;
  frequentEmotions: Record<string, number>; // emotion -> frequency
  commonTriggers: Record<string, number>; // trigger -> frequency
  effectiveCopingStrategies: string[];
  emotionalBaseline: number; // average intensity
  concerningPatterns: string[];
  lastUpdated: Date;
}

export interface ConversationContext {
  recentEmotions: string[];
  identifiedTriggers: string[];
  usedStrategies: string[];
  emotionalTrend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

class MemoryService {
  /**
   * Build user memory from conversation history
   * Tracks emotional patterns over time
   */
  buildUserMemory(
    userId: string,
    messages: Array<{
      emotion?: string;
      intensity?: number;
      triggers?: string[];
      content: string;
      createdAt: Date;
    }>
  ): UserMemory {
    const frequentEmotions: Record<string, number> = {};
    const commonTriggers: Record<string, number> = {};
    const effectiveCopingStrategies: string[] = [];
    let totalIntensity = 0;
    let emotionCount = 0;
    const concerningPatterns: string[] = [];

    // Analyze messages
    for (const msg of messages) {
      if (msg.emotion) {
        frequentEmotions[msg.emotion] =
          (frequentEmotions[msg.emotion] || 0) + 1;
        emotionCount++;
        const intensity = msg.intensity || 0.5;
        totalIntensity += intensity;

        // Track concerning patterns
        if (msg.emotion === 'aggressive' && intensity > 0.7) {
          concerningPatterns.push('High intensity anger episodes');
        }
        if (msg.emotion === 'sad' && intensity > 0.8) {
          concerningPatterns.push('Persistent severe sadness');
        }
      }

      if (msg.triggers) {
        for (const trigger of msg.triggers) {
          commonTriggers[trigger] = (commonTriggers[trigger] || 0) + 1;
        }
      }

      // Extract coping strategies mentioned in content
      if (
        msg.content.toLowerCase().includes('helped') ||
        msg.content.toLowerCase().includes('better')
      ) {
        effectiveCopingStrategies.push(msg.content);
      }
    }

    return {
      userId,
      frequentEmotions,
      commonTriggers,
      effectiveCopingStrategies: [
        ...new Set(effectiveCopingStrategies),
      ].slice(0, 5),
      emotionalBaseline: emotionCount > 0 ? totalIntensity / emotionCount : 0.5,
      concerningPatterns: [...new Set(concerningPatterns)],
      lastUpdated: new Date(),
    };
  }

  /**
   * Get contextual information for current conversation
   * Identifies patterns and relevant past experiences
   */
  getConversationContext(
    messages: Array<{
      emotion?: string;
      intensity?: number;
      triggers?: string[];
      content: string;
    }>,
    recentMessageCount: number = 5
  ): ConversationContext {
    const recentMessages = messages.slice(-recentMessageCount);
    const recentEmotions: string[] = [];
    const identifiedTriggers: string[] = [];
    let emotionTrend: 'improving' | 'declining' | 'stable' = 'stable';

    // Analyze recent messages
    for (const msg of recentMessages) {
      if (msg.emotion) {
        recentEmotions.push(msg.emotion);
      }
      if (msg.triggers) {
        identifiedTriggers.push(...msg.triggers);
      }
    }

    // Determine emotional trend
    if (recentMessages.length >= 2) {
      const firstHalf = recentMessages.slice(0, Math.ceil(recentMessages.length / 2));
      const secondHalf = recentMessages.slice(Math.ceil(recentMessages.length / 2));

      const firstAvgIntensity =
        firstHalf.reduce((sum, msg) => sum + (msg.intensity || 0), 0) /
        firstHalf.length;
      const secondAvgIntensity =
        secondHalf.reduce((sum, msg) => sum + (msg.intensity || 0), 0) /
        secondHalf.length;

      if (secondAvgIntensity < firstAvgIntensity * 0.9) {
        emotionTrend = 'improving';
      } else if (secondAvgIntensity > firstAvgIntensity * 1.1) {
        emotionTrend = 'declining';
      }
    }

    // Generate recommendations based on context
    const recommendations = this.generateContextualRecommendations(
      recentEmotions,
      identifiedTriggers,
      emotionTrend
    );

    return {
      recentEmotions: [...new Set(recentEmotions)],
      identifiedTriggers: [...new Set(identifiedTriggers)],
      usedStrategies: [],
      emotionalTrend: emotionTrend,
      recommendations,
    };
  }

  /**
   * Generate recommendations based on conversation context
   */
  private generateContextualRecommendations(
    emotions: string[],
    triggers: string[],
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    // Emotion-based recommendations
    if (emotions.includes('anxious')) {
      recommendations.push(
        'Try a grounding exercise like the 5-4-3-2-1 technique'
      );
      recommendations.push('Practice slow, deep breathing');
    }

    if (emotions.includes('sad')) {
      recommendations.push('Consider reaching out to someone you trust');
      recommendations.push('Engage in an activity that brings you joy');
    }

    if (emotions.includes('angry')) {
      recommendations.push('Take a break before responding to anything');
      recommendations.push('Channel this energy into physical activity');
    }

    // Trigger-based recommendations
    if (triggers.includes('Work')) {
      recommendations.push('Consider setting work-life boundaries');
      recommendations.push('Schedule breaks throughout your day');
    }

    if (triggers.includes('Relationship')) {
      recommendations.push('Communication is key - consider having a conversation');
      recommendations.push(
        'Reflect on your needs and how to express them clearly'
      );
    }

    if (triggers.includes('Health')) {
      recommendations.push('Consult with a healthcare professional if needed');
      recommendations.push('Practice self-care and stress management');
    }

    // Trend-based recommendations
    if (trend === 'declining') {
      recommendations.push(
        'I notice your mood is declining. Would you like to talk more?'
      );
      recommendations.push('Consider professional support if things worsen');
    }

    if (trend === 'improving') {
      recommendations.push('Great! I see you\'re feeling better');
      recommendations.push('Keep up with the strategies that are helping');
    }

    return recommendations.slice(0, 3);
  }

  /**
   * Extract key themes from conversation
   */
  extractThemes(
    messages: Array<{ content: string; emotion?: string }>
  ): {
    themes: string[];
    frequency: Record<string, number>;
  } {
    const themes: Record<string, number> = {};
    const keywords = {
      work: ['job', 'boss', 'work', 'career', 'office', 'deadline', 'meeting'],
      relationships: [
        'friend',
        'family',
        'partner',
        'girlfriend',
        'boyfriend',
        'husband',
        'wife',
        'relationship',
      ],
      health: [
        'health',
        'sick',
        'pain',
        'doctor',
        'hospital',
        'disease',
        'therapy',
      ],
      personal_growth: [
        'improve',
        'goal',
        'learn',
        'better',
        'achievement',
        'success',
      ],
      stress: [
        'stress',
        'worried',
        'anxious',
        'overwhelmed',
        'panic',
        'nervous',
      ],
      happiness: ['happy', 'joy', 'excited', 'love', 'grateful', 'blessed'],
      sadness: [
        'sad',
        'depressed',
        'unhappy',
        'lonely',
        'heartbroken',
        'down',
      ],
      conflict: ['argue', 'fight', 'conflict', 'disagree', 'anger', 'mad'],
    };

    const lowerContent = messages
      .map((m) => m.content.toLowerCase())
      .join(' ');

    for (const [theme, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerContent.includes(word)) {
          themes[theme] = (themes[theme] || 0) + 1;
        }
      }
    }

    const sortedThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);

    return {
      themes: sortedThemes,
      frequency: themes,
    };
  }

  /**
   * Calculate user engagement score
   */
  calculateEngagementScore(
    messages: Array<{
      createdAt: Date;
      emotion?: string;
      intensity?: number;
    }>
  ): number {
    if (messages.length === 0) return 0;

    let score = 0;

    // Frequency score (0-30 points)
    const messageCount = messages.length;
    score += Math.min(30, messageCount);

    // Recency score (0-20 points)
    const lastMessage = messages[messages.length - 1];
    const daysSinceLastMessage =
      (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastMessage < 1) score += 20;
    else if (daysSinceLastMessage < 3) score += 15;
    else if (daysSinceLastMessage < 7) score += 10;

    // Emotional depth score (0-25 points)
    const avgIntensity =
      messages.reduce((sum, msg) => sum + (msg.intensity || 0), 0) /
      messages.length;
    if (avgIntensity > 0.7) score += 25;
    else if (avgIntensity > 0.5) score += 15;
    else score += 5;

    // Consistency score (0-25 points)
    const timeDifferences: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      const diff =
        messages[i].createdAt.getTime() -
        messages[i - 1].createdAt.getTime();
      timeDifferences.push(diff);
    }

    if (timeDifferences.length > 0) {
      const avgTimeDiff =
        timeDifferences.reduce((a, b) => a + b) / timeDifferences.length;
      const variance =
        timeDifferences.reduce(
          (sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2),
          0
        ) / timeDifferences.length;

      // Lower variance = higher consistency
      if (variance < 1000000000) score += 25; // Consistent daily
      else if (variance < 10000000000) score += 15;
      else score += 5;
    }

    return Math.min(100, score);
  }
}

export default new MemoryService();
