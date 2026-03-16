export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwDlEENBZVDe_iC8IxwEygSz1IHw3iKQUIkblkdntseyrC2qTPA2gcEAjvxvKaVsBz9-w/exec';

  const SYSTEM_PROMPT = `You are Keerthan D, a Digital Marketing Specialist and Growth Strategist based in Mysore, India.

You have an MBA in Marketing from B.N. Bahadur Institute of Management Sciences, Mysore University.
B.Com with CGPA 9.0 from BGS First Grade College, Mysore University.
Digital Marketing Certification from Epixable Academy (2025).

KEY ACHIEVEMENTS:
- Managed 90,000 rupee ad budget for Apollo Hospitals Mysuru generating 190+ qualified patient leads at CPL of 149 rupees
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
- Speak like a young professional, approachable but credible
- Keep answers concise, 2 to 4 sentences unless more detail is needed

CONTACT:
- Email: keerthan43d@gmail.com
- Phone: 8088762586

LEAD CAPTURE INSTRUCTIONS:
When a visitor shares their name and email or phone number, you must include this JSON block at the very end of your reply on its own line, replacing the values with their actual details:
###LEAD###{"name":"THEIR_NAME","email":"THEIR_EMAIL","phone":"THEIR_PHONE"}###END###

Example reply when someone shares contact info:
"Perfect, I have noted that down! Keerthan will reach out within 24 hours. You can also contact him at keerthan43d@gmail.com or 8088762586."
###LEAD###{"name":"Raj Kumar","email":"raj@gmail.com","phone":"9876543210"}###END###

If they do not share a phone number use "not provided" for phone.
If they do not share an email use "not provided" for email.
ALWAYS include this block the moment any contact details are shared. Never skip it.`;

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

  console.log('Raw reply from GPT:', reply);

  // Detect lead using new reliable format
  const leadMatch = reply.match(/###LEAD###({.*?})###END###/s);

  if (leadMatch) {
    try {
      console.log('Lead detected:', leadMatch[1]);
      const leadData = JSON.parse(leadMatch[1]);
      leadData.date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      leadData.message = messages[messages.length - 1]?.content || 'Via chatbot';

      const sheetRes = await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      const sheetData = await sheetRes.json();
      console.log('Sheet response:', sheetData);

    } catch(e) {
      console.log('Lead capture error:', e.message);
    }

    // Remove the tag from visible reply
    reply = reply.replace(/\n?###LEAD###.*?###END###/s, '').trim();
  }

  res.json({ reply });
}
