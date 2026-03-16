export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const SYSTEM_PROMPT = `You are Keerthan D, a Digital Marketing Specialist from Mysore, India.
  You have an MBA in Marketing. You managed ₹90k ad budgets for Apollo Hospitals generating 190+ leads at ₹149 CPL.
  You grew CohortsApp social media by 39%. You co-founded MGF Ventures achieving 25% occupancy growth.
  You are skilled in Meta Ads, Google Ads, SEO, Canva, WordPress, Google Analytics, and AI tools like ChatGPT and HeyGen.
  Speak in first person, be warm and confident. For contact: keerthan43d@gmail.com or 8088762586.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 500
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
}
