# ElevenLabs API Setup Guide

## Issue: 401 Error (Unauthorized)

If you're seeing this error in the console:
```
Error generating TTS: ElevenLabsError: Status code: 401
```

This means your ElevenLabs API key is either:
1. Missing
2. Invalid
3. Expired

## Solution

### Option 1: Update Your API Key (Recommended)

1. **Get a new API key from ElevenLabs:**
   - Visit: https://elevenlabs.io/
   - Sign up or log in
   - Go to Profile → API Keys
   - Create a new API key

2. **Update your `.env` file:**
   ```bash
   # Open the .env file in the project root
   nano .env
   ```

3. **Replace the old key:**
   ```env
   ELEVENLABS_API_KEY=your_new_api_key_here
   ```

4. **Restart the server:**
   ```bash
   # Press Ctrl+C to stop the server
   npm run dev
   ```

### Option 2: Disable Voice (Quick Fix)

If you don't need voice features right now:

1. **In the Dashboard UI:**
   - Click the volume icon to disable voice
   - The speaker icon will show as muted

2. **The app will work perfectly without voice:**
   - Text responses will still work
   - All other features remain functional
   - No more 401 errors

### Option 3: Use Mock Mode (Development)

For development without voice:

1. **Update `src/config/env.ts`:**
   ```typescript
   ELEVENLABS_API_KEY: z.string().optional().default('mock'),
   ```

2. **The app will skip TTS generation** when key is 'mock'

## Current API Key Status

Your current `.env` has:
```
ELEVENLABS_API_KEY=sk_2cdf55042d88fadebe4188734abd3467ec1f660441a52b0c
```

This key appears to be invalid or expired. You need to generate a new one from ElevenLabs.

## Free Tier Limits

ElevenLabs free tier includes:
- 10,000 characters per month
- 3 custom voices
- Standard voice quality

## Verification

After updating the key, test it:

1. Enable voice in the UI
2. Send a message
3. Check console - should see: "Playing audio, duration: X"
4. No 401 errors

## Alternative: Use Environment Variables

For security, you can also use environment variables:

```bash
export ELEVENLABS_API_KEY="your_key_here"
npm run dev
```

## Need Help?

If you're still having issues:
1. Check ElevenLabs dashboard for API usage
2. Verify the key is copied correctly (no extra spaces)
3. Make sure you're using a valid subscription
4. Check if your account has credits remaining

## Important Notes

- ⚠️ **Never commit your API key to Git**
- ✅ The `.env` file is already in `.gitignore`
- 🔒 Keep your API keys secure
- 💡 Voice features are optional - app works without them
