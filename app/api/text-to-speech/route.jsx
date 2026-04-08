import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { input, voice } = await req.json();
    const headers = {
      'x-api-key': process.env.AI_GURU_LAB_API_KEY,
      'Content-Type': 'application/json',
    };
    
    // Fallback or override logic for voice selection
    const selectedVoice = voice || 'am_michael';
    const cleanText = input.substring(0, 1000); // safety length for TTS string length

    const BASE_URL = 'https://aigurulab.tech';
    const response = await axios.post(BASE_URL + '/api/text-to-speech', {
      input: cleanText,
      voice: selectedVoice
    }, { headers });
    
    if (response.data && response.data.audio) {
      return NextResponse.json({ success: true, audio: response.data.audio });
    } else {
      return NextResponse.json({ success: false, error: 'No audio generated' });
    }
  } catch (error) {
    console.error('TTS Error:', error.response?.data || error.message);
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}
