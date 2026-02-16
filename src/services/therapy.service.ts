/**
 * Therapeutic Response Service
 * Integrates CBT, DBT, and motivational interviewing techniques
 * for evidence-based therapeutic conversations
 */

export type ConversationMode = 'crisis' | 'exploration' | 'support' | 'skills';

export interface TherapyContext {
  userEmotion: string;
  emotionIntensity: number;
  cognitiveDistortions: string[];
  triggers: string[];
  previousGoals?: string[];
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface TherapyResponse {
  mode: ConversationMode;
  technique: string;
  response: string;
  followup_question?: string;
  resources?: string[];
  exercise?: {
    type: string;
    duration: number;
    instructions: string[];
  };
}

class TherapyService {
  /**
   * Determine appropriate conversation mode based on context
   */
  determineConversationMode(
    emotion: string,
    intensity: number,
    hasCrisisIndicators: boolean
  ): ConversationMode {
    if (hasCrisisIndicators) {
      return 'crisis';
    }

    if (intensity > 0.8) {
      return 'support';
    }

    if (intensity > 0.5) {
      return 'exploration';
    }

    return 'skills';
  }

  /**
   * Generate therapy response based on context
   */
  async generateTherapyResponse(
    context: TherapyContext
  ): Promise<TherapyResponse> {
    const mode = this.determineConversationMode(
      context.userEmotion,
      context.emotionIntensity,
      false // Will be checked by crisis service separately
    );

    switch (mode) {
      case 'crisis':
        return this.generateCrisisResponse(context);
      case 'exploration':
        return this.generateExplorationResponse(context);
      case 'support':
        return this.generateSupportResponse(context);
      case 'skills':
        return this.generateSkillsResponse(context);
      default:
        return this.generateDefaultResponse(context);
    }
  }

  /**
   * Crisis mode: Immediate support and safety
   */
  private generateCrisisResponse(
    context: TherapyContext
  ): TherapyResponse {
    return {
      mode: 'crisis',
      technique: 'Immediate Support',
      response: `I can see you're going through something really difficult right now. Your safety is my top priority. 
      
I want you to know that what you're feeling is valid, and you don't have to face this alone. 

${
  context.cognitiveDistortions.length > 0
    ? `I notice you might be thinking in patterns like ${context.cognitiveDistortions.join(' and ')}. Right now, let's focus on getting you to a safe place and connected with support.`
    : 'Let\'s focus on getting you immediate support.'
}`,
      followup_question:
        'Is there someone safe you can reach out to right now? A friend, family member, or professional?',
      resources: [
        '988 - Suicide & Crisis Lifeline',
        'Crisis Text Line - Text HOME to 741741',
        'Emergency Services - 911',
      ],
    };
  }

  /**
   * Support mode: Validation and empathy
   */
  private generateSupportResponse(
    context: TherapyContext
  ): TherapyResponse {
    const distortions = context.cognitiveDistortions;
    let technique = 'Validation & Empathy';
    let response = '';

    if (distortions.includes('catastrophizing')) {
      technique = 'Thought Challenging (Catastrophizing)';
      response = `I hear that you're feeling overwhelmed and imagining the worst case scenario. That's a very real feeling, but our minds often exaggerate dangers when we're stressed.

Let me ask you this: What's actually happened so far, versus what you're worried *might* happen?`;
    } else if (distortions.includes('all-or-nothing')) {
      technique = 'Cognitive Restructuring (All-or-Nothing Thinking)';
      response = `I notice you're describing things in very absolute terms - "always" and "never". When we're upset, our brains tend to think in black and white.

Most situations exist in shades of gray. Can you think of a time when things weren't so absolute?`;
    } else if (distortions.includes('personalization')) {
      technique = 'Cognitive Reframing (Personalization)';
      response = `It sounds like you're taking responsibility for something that might not entirely be your responsibility. When we're struggling, we often blame ourselves.

What would you tell a friend who was in this situation? Would you blame them the same way?`;
    } else {
      response = `I can hear how much pain you're in right now. Your feelings are completely valid and understandable given what you're going through.

You reached out to talk about this, which takes courage. That's a strength.`;
    }

    return {
      mode: 'support',
      technique,
      response,
      followup_question: 'What would help you feel even a little bit better right now?',
      exercise:
        context.emotionIntensity > 0.75
          ? {
              type: 'Grounding Exercise',
              duration: 5,
              instructions: [
                'Name 5 things you can see',
                'Name 4 things you can touch',
                'Name 3 things you can hear',
                'Name 2 things you can smell',
                'Name 1 thing you can taste',
              ],
            }
          : undefined,
    };
  }

  /**
   * Exploration mode: Socratic questioning
   */
  private generateExplorationResponse(
    context: TherapyContext
  ): TherapyResponse {
    const triggers = context.triggers;
    let response = '';
    let question = '';

    if (triggers.includes('Work')) {
      response = `It sounds like work is affecting your emotional wellbeing. That's something many people struggle with.`;
      question = `What specifically about work is triggering this feeling right now?`;
    } else if (triggers.includes('Relationship')) {
      response = `Relationships can be a source of both joy and pain. It takes self-awareness to recognize how they affect you.`;
      question = `Can you tell me more about what's happening in this relationship?`;
    } else if (triggers.includes('Health')) {
      response = `Health concerns can bring up a lot of anxiety and worry. That's a very human response.`;
      question = `What health-related thoughts are most concerning to you right now?`;
    } else {
      response = `Let's explore what you're feeling more deeply. Understanding the roots of our emotions can help us manage them.`;
      question = `What do you think is at the core of what you're feeling?`;
    }

    return {
      mode: 'exploration',
      technique: 'Socratic Questioning',
      response,
      followup_question: question,
    };
  }

  /**
   * Skills mode: Teaching coping strategies
   */
  private generateSkillsResponse(
    context: TherapyContext
  ): TherapyResponse {
    const emotion = context.userEmotion;
    let technique = 'Coping Skills';
    let response = '';
    let exercise = undefined;

    switch (emotion) {
      case 'anxious':
        technique = 'DBT: Distress Tolerance';
        response = `Anxiety often comes from uncertainty. Let me teach you a technique that can help you manage anxious feelings in the moment.`;
        exercise = {
          type: 'Box Breathing',
          duration: 4,
          instructions: [
            'Breathe in for 4 counts',
            'Hold for 4 counts',
            'Breathe out for 4 counts',
            'Hold for 4 counts',
            'Repeat 5 times',
          ],
        };
        break;

      case 'angry':
        technique = 'DBT: Emotion Regulation';
        response = `Anger is a powerful emotion that can motivate us, but we need to manage it so it doesn't control our actions.`;
        exercise = {
          type: 'TIPP Technique',
          duration: 5,
          instructions: [
            'Temperature: Splash cold water on your face',
            'Intense exercise: Do 20 jumping jacks or run in place',
            'Paced breathing: Slow, deep breaths',
            'Paired muscle relaxation: Tense and release muscles',
          ],
        };
        break;

      case 'sad':
        technique = 'Behavioral Activation';
        response = `When we're sad, we tend to withdraw. Small actions can help shift our mood.`;
        exercise = {
          type: 'Behavioral Activation',
          duration: 15,
          instructions: [
            'Choose one small activity you used to enjoy',
            'Schedule it for today or tomorrow',
            'Complete it even if you don\'t feel like it',
            'Notice how you feel before and after',
          ],
        };
        break;

      case 'calm':
        technique = 'Mindfulness & Maintenance';
        response = `You're in a good place emotionally right now. Let me teach you how to maintain this peace.`;
        exercise = {
          type: 'Mindfulness Meditation',
          duration: 10,
          instructions: [
            'Find a comfortable position',
            'Close your eyes',
            'Notice your natural breath',
            'When your mind wanders, gently return to the breath',
            'Practice for 10 minutes',
          ],
        };
        break;

      default:
        response = `Different emotions call for different strategies. Let me teach you a skill that might be helpful.`;
    }

    return {
      mode: 'skills',
      technique,
      response,
      followup_question: 'Would you like to try this technique right now?',
      exercise,
    };
  }

  /**
   * Default response
   */
  private generateDefaultResponse(
    context: TherapyContext
  ): TherapyResponse {
    return {
      mode: 'support',
      technique: 'Empathetic Listening',
      response:
        'I\'m here to listen and support you. Tell me more about what you\'re experiencing.',
      followup_question: 'How long have you been feeling this way?',
    };
  }

  /**
   * Generate motivational interviewing response
   */
  generateMotivationalResponse(
    goal: string,
    barriers: string[]
  ): TherapyResponse {
    return {
      mode: 'exploration',
      technique: 'Motivational Interviewing',
      response: `I hear that you want to ${goal}, but you're facing some challenges: ${barriers.join(', ')}.

What do you think would help you overcome these barriers?`,
      followup_question:
        'On a scale of 1-10, how important is this goal to you, and how confident are you that you can achieve it?',
    };
  }

  /**
   * Generate psychoeducation response
   */
  generatePsychoeducationResponse(topic: string): TherapyResponse {
    const psychoeducation: Record<string, string> = {
      anxiety:
        'Anxiety is your brain\'s way of trying to protect you from danger. However, sometimes it overestimates threats. Understanding this can help you manage anxious thoughts more effectively.',
      depression:
        'Depression affects how you think, feel, and act. It\'s not weakness - it\'s a medical condition. With proper support, it can improve significantly.',
      anger:
        'Anger is a valid emotion that tells us when our boundaries have been crossed. The key is managing how we express it.',
      grief:
        'Grief is the price we pay for love. There\'s no timeline for it, and all feelings are valid.',
      trauma:
        'Trauma changes how the brain processes information. Therapy can help rewire these patterns.',
    };

    return {
      mode: 'skills',
      technique: 'Psychoeducation',
      response:
        psychoeducation[topic] ||
        'Understanding what you\'re going through is the first step toward managing it.',
      followup_question: 'Does this resonate with what you\'re experiencing?',
    };
  }

  /**
   * Create a coping strategy suggestion
   */
  generateCopingStrategies(emotion: string): string[] {
    const strategies: Record<string, string[]> = {
      happy: [
        'Share your joy with others',
        'Journal about what made you happy',
        'Do more of this activity',
        'Help someone else',
      ],
      sad: [
        'Reach out to someone you trust',
        'Do something gentle for yourself',
        'Move your body (walk, stretch)',
        'Engage in a creative activity',
      ],
      angry: [
        'Take deep breaths',
        'Go for a walk or exercise',
        'Journal your feelings',
        'Wait before responding',
      ],
      anxious: [
        'Use grounding techniques',
        'Practice deep breathing',
        'Limit caffeine',
        'Break tasks into smaller steps',
      ],
      calm: [
        'Maintain this state',
        'Practice gratitude',
        'Help others',
        'Engage in meaningful activity',
      ],
      aggressive: [
        'Remove yourself from the situation',
        'Use intense physical exercise',
        'Practice anger management',
        'Seek professional support',
      ],
      fearful: [
        'Face the fear gradually',
        'Use grounding techniques',
        'Talk about your fears',
        'Seek reassurance when needed',
      ],
      disgusted: [
        'Set boundaries',
        'Distance yourself from the trigger',
        'Talk about what bothers you',
        'Practice self-care',
      ],
    };

    return strategies[emotion] || strategies.calm;
  }
}

export default new TherapyService();
