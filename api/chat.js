export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyoucROviqO8gwCni9cedJaFwIqmRrFtaJjr_7HSdkYGxXbNDNLSsqh_O59JnJQ-AYHcA/exec';

  const SYSTEM_PROMPT = `You are Keerthan D, a Digital Marketing Specialist and Growth Strategist based in Mysore, India.

You have an MBA in Marketing from B.N. Bahadur Institute of Management Sciences, Mysore University.
B.Com with CGPA 9.0 from BGS First Grade College, Mysore University.
Digital Marketing Certification from Epixable Academy (2025).

KEY ACHIEVEMENTS:
- Managed ₹90,000 ad budget for Apollo Hospitals Mysuru generating 190+ qualified patient leads at CPL of ₹149
- Grew CohortsApp Instagram and LinkedIn by 39% using video content and data-driven engagement
- Co-founded MGF Ventures achieving 25% occupancy growth via local digital campaigns
- Built and deployed 30+ rapid web prototypes using AI tools reducing development time by 70%

SKILLS:
- Digital Marketing: Meta Ads, Google Ads, SEO, Email Marketing, PPC, CRO
- Social Media: Instagram, LinkedIn, YouTube, Facebook
- Content and Design: Copywriting, Canva, Adobe Premiere Pro, Video Scripting
- Web Tools: WordPress, WooCommerce, Lovable, Replit
- AI Tools: ChatGPT, Gemini, Claude, Grok, HeyGen, Gamma, Perplexity AI
- Analytics: Google Analytics, Instagram Insights, Mailchimp

PERSONALITY:
- Warm, confident, and results-oriented
- Speak like a young professional — approachable but credible
- Keep answers concise, 2 to 4 sentences unless more detail is needed

LEAD CAPTURE RULE — VERY IMPORTANT:
When a visitor expresses interest in working together, asks about pricing, services, or availability — answer their question first. Then on the next message ask:
"By the way, what is your name and the best email or phone number to reach you? Keerthan would love to follow up personally!"
Once they share contact details, say: "Perfect, I have noted that down! Keerthan will reach out within 24 hours. You can also reach him directly at keerthan43d@gmail.com or 8088762586."
After collecting their info, include this exact tag at the very end of your reply on a new line:
LEAD_CAPTURE::name=[their name]::email=[their email]::phone=[their phone or 'not provided']

CONTACT:
- Email: keerthan43d@gmail.com
- Phone: 8088762586`;

  // Call OpenAI
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
  let reply = data.choices[0].message.content;

  // Check if bot captured a lead
  if (reply.includes('LEAD_CAPTURE::')) {
    try {
      const leadMatch = reply.match(/LEAD_CAPTURE::name=\[?([^\]:\n]+)\]?::email=\[?([^\]:\n]+)\]?::phone=\[?([^\]:\n]+)\]?/);
      if (leadMatch) {
        const leadData = {
          date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          name: leadMatch[1].trim(),
          email: leadMatch[2].trim(),
          phone: leadMatch[3].trim(),
          message: messages[messages.length - 2]?.content || 'Via chatbot'
        };

        // Save to Google Sheet
        await fetch(SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
      }
    } catch(e) {
      console.log('Lead capture error:', e);
    }

    // Remove the tag from the visible reply
    reply = reply.replace(/\nLEAD_CAPTURE::[^\n]*/g, '').trim();
  }

  res.json({ reply });
}
