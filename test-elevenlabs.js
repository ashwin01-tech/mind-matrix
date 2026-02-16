
const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

async function test() {
    console.log('Testing ElevenLabs API Key...');
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
        console.error('Error: ELEVENLABS_API_KEY not found in .env');
        return;
    }
    console.log(`Key length: ${key.length}`);
    console.log(`Key prefix: ${key.substring(0, 5)}...`);

    const client = new ElevenLabsClient({ apiKey: key });

    try {
        console.log('Fetching voices...');
        const response = await client.voices.getAll();
        console.log('Success! Found', response.voices.length, 'voices.');
    } catch (error) {
        console.error('API Error:', error.statusCode, error.body);
    }
}

test();
