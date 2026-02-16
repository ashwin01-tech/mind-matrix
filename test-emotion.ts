// Test the enhanced emotion detection
import { emotionService } from './src/services/emotion.service.ts';

// Test cases
const testCases = [
    { text: "kill criminals", expectedEmotion: "aggressive" },
    { text: "I'm so happy today!!!", expectedEmotion: "happy" },
    { text: "I feel terrible and hopeless", expectedEmotion: "sad" },
    { text: "I'm really angry and frustrated", expectedEmotion: "angry" },
    { text: "I'm worried and anxious about everything", expectedEmotion: "anxious" },
    { text: "I feel calm and peaceful", expectedEmotion: "calm" },
    { text: "I'm so scared and afraid", expectedEmotion: "fearful" },
    { text: "That's absolutely disgusting", expectedEmotion: "disgusted" },
];

console.log("🧠 Enhanced Emotion Detection Test Suite\n");
console.log("=" .repeat(60));

for (const testCase of testCases) {
    const result = emotionService.detectEmotion(testCase.text);
    const isCorrect = result.emotion === testCase.expectedEmotion;
    const status = isCorrect ? "✓" : "✗";
    
    console.log(`\n${status} Test: "${testCase.text}"`);
    console.log(`  Expected: ${testCase.expectedEmotion}`);
    console.log(`  Got: ${result.emotion}`);
    console.log(`  Intensity: ${(result.intensity * 100).toFixed(0)}%`);
    if (result.valence) console.log(`  Valence: ${result.valence}`);
    if (result.arousal) console.log(`  Arousal: ${result.arousal}`);
    if (result.secondary && result.secondary.length > 0) {
        console.log(`  Secondary: ${result.secondary.join(", ")}`);
    }
    if (result.cognitiveDistortions && result.cognitiveDistortions.length > 0) {
        console.log(`  Distortions: ${result.cognitiveDistortions.join(", ")}`);
    }
    if (result.triggers && result.triggers.length > 0) {
        console.log(`  Triggers: ${result.triggers.join(", ")}`);
    }
}

console.log("\n" + "=".repeat(60));
console.log("Test suite complete!");
