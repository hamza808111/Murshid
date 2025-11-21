// Quick test script to verify Gemini API works
import { testGeminiConnection } from './src/services/geminiService';

async function test() {
  console.log('Testing Gemini API connection...');
  const isWorking = await testGeminiConnection();
  console.log('Result:', isWorking ? '✅ API is working!' : '❌ API failed');
}

test();
