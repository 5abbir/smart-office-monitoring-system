import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy'
});

export async function formatWithGroq(type: 'status' | 'room' | 'usage', rawData: any): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return `[Mock response - missing GROQ_API_KEY]\nData: ${JSON.stringify(rawData, null, 2)}`;
  }

  let prompt = '';
  
  if (type === 'status') {
    prompt = `You are a helpful smart office assistant. Here is the current raw JSON status of all devices in the office: ${JSON.stringify(rawData)}. Summarize the overall state in a natural, conversational way. Keep it concise.`;
  } else if (type === 'room') {
    prompt = `You are a helpful smart office assistant. Here is the current state of devices for a specific room: ${JSON.stringify(rawData)}. Describe the room's status naturally.`;
  } else if (type === 'usage') {
    const estimatedKWh = (rawData.totalWatts * 24 / 1000).toFixed(2);
    prompt = `You are a helpful smart office assistant. The office is currently drawing ${rawData.totalWatts}W of power. Room breakdown: ${JSON.stringify(rawData.roomBreakdown)}. The estimated 24-hour usage at this rate is ${estimatedKWh} kWh. Present this power usage naturally to the user in a brief, readable way.`;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 200,
    });
    return completion.choices[0]?.message?.content || 'I could not generate a response.';
  } catch (err) {
    console.error('Groq error:', err);
    return `[Error calling Groq API] Data: ${JSON.stringify(rawData)}`;
  }
}
