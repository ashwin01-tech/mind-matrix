/**
 * Crisis Detection and Intervention Service
 * Identifies crisis situations and provides immediate support
 */

export interface CrisisIndicators {
  self_harm: boolean;
  suicidal_ideation: boolean;
  homicidal_ideation: boolean;
  severe_substance_abuse: boolean;
  acute_psychosis: boolean;
  other_crisis: boolean;
}

export interface CrisisResponse {
  is_crisis: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: CrisisIndicators;
  resources: CrisisResource[];
  immediate_actions: string[];
  message: string;
}

export interface CrisisResource {
  country: string;
  service_name: string;
  phone: string;
  website?: string;
  text_code?: string;
  description: string;
}

class CrisisDetectionService {
  private crisisKeywords = {
    self_harm: [
      'cut',
      'cutting',
      'harm',
      'hurt myself',
      'self harm',
      'self-harm',
      'slit',
      'burn',
      'overdose',
    ],
    suicidal: [
      'suicide',
      'suicidal',
      "don't want to live",
      'end it',
      'kill myself',
      'hang myself',
      'not worth living',
      'better off dead',
      'want to die',
      'take my life',
    ],
    homicidal: [
      'kill someone',
      'murder',
      'harm others',
      'hurt people',
      'violence',
      'violent attack',
      'mass harm',
    ],
    severe_substance: [
      'overdose',
      'overdosed',
      'heavy drugs',
      'inject',
      'cocaine',
      'heroin',
      'extreme drinking',
    ],
    psychosis: [
      'hearing voices',
      'seeing things',
      'hallucinating',
      'not real',
      'conspiracy',
      'being followed',
      'controlled by',
    ],
  };

  private resources: CrisisResource[] = [
    // US Resources
    {
      country: 'US',
      service_name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      website: 'https://988lifeline.org',
      text_code: 'Text 988',
      description: 'Free, confidential, 24/7 support',
    },
    {
      country: 'US',
      service_name: 'Crisis Text Line',
      phone: '',
      website: 'https://www.crisistextline.org',
      text_code: 'Text HOME to 741741',
      description: 'Immediate support via text',
    },

    // UK Resources
    {
      country: 'UK',
      service_name: 'Samaritans',
      phone: '116 123',
      website: 'https://www.samaritans.org',
      description: 'Available 24/7, free to call',
    },
    {
      country: 'UK',
      service_name: 'Crisis Team',
      phone: '111',
      website: 'https://www.nhs.uk',
      description: 'Mental health crisis support',
    },

    // Canada Resources
    {
      country: 'CA',
      service_name: 'Canada Suicide Prevention Service',
      phone: '1-833-456-4566',
      website: 'https://suicideprevention.ca',
      description: '24/7 crisis support',
    },

    // Australia Resources
    {
      country: 'AU',
      service_name: 'Lifeline Australia',
      phone: '13 11 14',
      website: 'https://www.lifeline.org.au',
      description: '24/7 crisis support',
    },

    // EU Resources
    {
      country: 'EU',
      service_name: 'Telefonseelsorge (Germany)',
      phone: '0800 111 0111 or 0800 111 0222',
      website: 'https://www.telefonseelsorge.de',
      description: 'Free, confidential 24/7',
    },
  ];

  /**
   * Detect if message contains crisis indicators
   */
  detectCrisis(text: string): CrisisResponse {
    const lowerText = text.toLowerCase();
    const indicators: CrisisIndicators = {
      self_harm: false,
      suicidal_ideation: false,
      homicidal_ideation: false,
      severe_substance_abuse: false,
      acute_psychosis: false,
      other_crisis: false,
    };

    let indicatorCount = 0;

    // Check for self-harm
    if (this.checkKeywords(lowerText, this.crisisKeywords.self_harm)) {
      indicators.self_harm = true;
      indicatorCount++;
    }

    // Check for suicidal ideation
    if (this.checkKeywords(lowerText, this.crisisKeywords.suicidal)) {
      indicators.suicidal_ideation = true;
      indicatorCount++;
    }

    // Check for homicidal ideation
    if (this.checkKeywords(lowerText, this.crisisKeywords.homicidal)) {
      indicators.homicidal_ideation = true;
      indicatorCount++;
    }

    // Check for severe substance abuse
    if (this.checkKeywords(lowerText, this.crisisKeywords.severe_substance)) {
      indicators.severe_substance_abuse = true;
      indicatorCount++;
    }

    // Check for psychosis
    if (this.checkKeywords(lowerText, this.crisisKeywords.psychosis)) {
      indicators.acute_psychosis = true;
      indicatorCount++;
    }

    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (indicators.suicidal_ideation || indicators.self_harm) {
      severity = 'critical';
    } else if (
      indicators.homicidal_ideation ||
      indicators.acute_psychosis
    ) {
      severity = 'high';
    } else if (indicators.severe_substance_abuse) {
      severity = 'high';
    }

    const is_crisis = severity !== 'low';

    return {
      is_crisis,
      severity,
      indicators,
      resources: this.getLocalizedResources(),
      immediate_actions: this.getImmediateActions(indicators),
      message: this.generateCrisisMessage(indicators, severity),
    };
  }

  /**
   * Check if text contains any of the keywords
   */
  private checkKeywords(text: string, keywords: string[]): boolean {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get localized crisis resources (can be expanded with user location)
   */
  private getLocalizedResources(): CrisisResource[] {
    // For now, return US resources as default
    // In production, determine user location and return appropriate resources
    return this.resources.filter((r) => r.country === 'US');
  }

  /**
   * Get immediate actions based on crisis type
   */
  private getImmediateActions(indicators: CrisisIndicators): string[] {
    const actions: string[] = [];

    if (indicators.suicidal_ideation) {
      actions.push('🚨 Please call emergency services immediately');
      actions.push('Contact a trusted friend or family member');
      actions.push('Move to a safe location away from means of harm');
      actions.push('Text or call a crisis line right now');
    }

    if (indicators.self_harm) {
      actions.push('🚨 Seek immediate medical attention if bleeding');
      actions.push('Move to a safe environment');
      actions.push('Contact someone you trust');
      actions.push('Call a crisis helpline');
    }

    if (indicators.homicidal_ideation) {
      actions.push('🚨 Do not act on these thoughts');
      actions.push('Call emergency services (911 in US)');
      actions.push('Leave the situation if possible');
      actions.push('Speak with a mental health professional immediately');
    }

    if (indicators.severe_substance_abuse) {
      actions.push('🚨 Seek medical attention immediately');
      actions.push('Call Poison Control (1-800-222-1222 in US)');
      actions.push('Tell someone where you are');
      actions.push('Do not drive or operate machinery');
    }

    if (indicators.acute_psychosis) {
      actions.push('🚨 Seek immediate psychiatric evaluation');
      actions.push('Stay with a trusted person');
      actions.push('Go to nearest emergency room');
      actions.push('Call a crisis team or ambulance');
    }

    return actions.slice(0, 4);
  }

  /**
   * Generate crisis-specific message
   */
  private generateCrisisMessage(
    indicators: CrisisIndicators,
    severity: string
  ): string {
    const messages: Record<string, string> = {
      suicidal: `I'm deeply concerned about what you're sharing. Your life has value and there is help available. Please reach out to a crisis service immediately. You don't have to go through this alone.`,
      self_harm: `I'm worried about your safety. Self-harm is a sign that you're in real pain and need real support. Please contact a crisis service or trusted person. You deserve compassion and care.`,
      homicidal: `I'm concerned about these thoughts. It's important to talk to a mental health professional who can help. Please reach out to emergency services or a crisis team.`,
      substance: `I'm concerned about your safety. Substance abuse can be life-threatening. Please seek medical attention or contact a crisis service immediately.`,
      psychosis: `I'm concerned about what you're experiencing. These experiences deserve professional evaluation. Please reach out to a psychiatrist or go to an emergency room.`,
    };

    if (indicators.suicidal_ideation) return messages.suicidal;
    if (indicators.self_harm) return messages.self_harm;
    if (indicators.homicidal_ideation) return messages.homicidal;
    if (indicators.severe_substance_abuse) return messages.substance;
    if (indicators.acute_psychosis) return messages.psychosis;

    return 'I\'m here to support you. Please consider reaching out to a mental health professional.';
  }

  /**
   * Generate safety plan
   */
  generateSafetyPlan(
    currentConcerns: string[],
    trustedPeople: string[] = []
  ): {
    warning_signs: string[];
    coping_strategies: string[];
    people_to_contact: string[];
    professional_contacts: string[];
    safe_environment_tips: string[];
  } {
    return {
      warning_signs: [
        'Increased isolation',
        'Giving away possessions',
        'Talking about burden to others',
        'Researching methods',
        'Saying goodbye',
        'Increased substance use',
        'Talking about not being needed',
      ],
      coping_strategies: [
        'Call or text a trusted person',
        'Use grounding techniques (5-4-3-2-1)',
        'Engage in physical activity',
        'Practice breathing exercises',
        'Write down your thoughts',
        'Listen to music',
        'Remove access to means of harm',
      ],
      people_to_contact: trustedPeople,
      professional_contacts: [
        'Your therapist/counselor',
        'Your psychiatrist/doctor',
        'Crisis hotline (available 24/7)',
        'Emergency services (911)',
      ],
      safe_environment_tips: [
        'Remove or secure any means of harm',
        'Create a calm, safe space',
        'Ensure adequate sleep',
        'Avoid alcohol and drugs',
        'Maintain a support network',
        'Keep medications secure',
      ],
    };
  }

  /**
   * Check if message shows improvement (getting better)
   */
  checkForImprovement(
    previousMessage: string,
    currentMessage: string
  ): boolean {
    const improvementKeywords = [
      'better',
      'improving',
      'feeling',
      'helped',
      'support',
      'grateful',
      'thank',
      'appreciated',
      'strength',
      'hopeful',
    ];

    const currentLower = currentMessage.toLowerCase();
    const crisisKeywords = [
      ...this.crisisKeywords.self_harm,
      ...this.crisisKeywords.suicidal,
      ...this.crisisKeywords.homicidal,
    ];

    // Check if current message has crisis keywords
    if (crisisKeywords.some((kw) => currentLower.includes(kw))) {
      return false;
    }

    // Check if current message has improvement keywords
    const improvementCount = improvementKeywords.filter((kw) =>
      currentLower.includes(kw)
    ).length;

    return improvementCount >= 2;
  }
}

export default new CrisisDetectionService();
