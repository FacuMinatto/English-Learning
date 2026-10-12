const fs = require('fs');
const translate = require('google-translate-api-x');

async function generate() {
  // Read and clean the UTF-16 null bytes
  const rawWords = fs.readFileSync('words.txt', 'utf8');
  const words = rawWords
    .replace(/\0/g, '') // remove null bytes
    .replace(/\r/g, '') // remove carriage returns
    .split('\n')
    .map(w => w.trim())
    .filter(Boolean)
    .slice(0, 1000);

  console.log(`Translating ${words.length} words...`);
  const dictionary = [];
  const chunkSize = 20;
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    try {
      console.log(`Translating words ${i} to ${i + chunkSize}...`);
      const res = await translate(chunk, { to: 'es' });
      const translations = Array.isArray(res) ? res : [res];
      
      for (let j = 0; j < chunk.length; j++) {
        const en = chunk[j].charAt(0).toUpperCase() + chunk[j].slice(1);
        const es = translations[j].text.charAt(0).toUpperCase() + translations[j].text.slice(1).toLowerCase();
        dictionary.push({ id: i + j + 1, english: en, spanish: es });
      }
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error('Translation failed', e);
      for (let j = 0; j < chunk.length; j++) {
        dictionary.push({ id: i + j + 1, english: chunk[j], spanish: chunk[j] });
      }
    }
  }

  // Generate Phrases
  const rawPhrases = [
    "How are you doing?", "I appreciate it.", "That sounds great!", "Let's catch up soon.", 
    "Could you repeat that?", "I'll be right back.", "Take your time.", "It doesn't matter.", 
    "By the way.", "To be honest.", "Never mind.", "I have no idea.", "As soon as possible.", 
    "Make yourself at home.", "Keep up the good work.", "What's up?", "Long time no see.", 
    "I'm looking forward to it.", "It's up to you.", "I couldn't agree more.", "That makes sense.", 
    "Don't worry about it.", "I'm on my way.", "Let me know.", "I'll think about it.", 
    "It is what it is.", "Better late than never.", "So far, so good.", "Break a leg.", 
    "Fingers crossed.", "I'll do my best.", "I can't complain.", "No pain, no gain.", 
    "Under the weather.", "Once in a blue moon.", "A piece of cake.", "Out of the blue.", 
    "Spill the beans.", "See eye to eye.", "Bite the bullet.", "Call it a day.", 
    "Hit the sack.", "Cut to the chase.", "Get out of hand.", "Hang in there.", 
    "Pull yourself together.", "Sooner or later.", "Take it easy.", "Time flies.", "You can say that again."
  ];

  console.log(`Translating ${rawPhrases.length} phrases...`);
  const phrases = [];
  for (let i = 0; i < rawPhrases.length; i += chunkSize) {
    const chunk = rawPhrases.slice(i, i + chunkSize);
    try {
      console.log(`Translating phrases ${i} to ${i + chunkSize}...`);
      const res = await translate(chunk, { to: 'es' });
      const translations = Array.isArray(res) ? res : [res];
      
      for (let j = 0; j < chunk.length; j++) {
        phrases.push({ id: i + j + 1, english: chunk[j], spanish: translations[j].text });
      }
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error('Translation failed', e);
      for (let j = 0; j < chunk.length; j++) {
        phrases.push({ id: i + j + 1, english: chunk[j], spanish: chunk[j] });
      }
    }
  }

  const dataJsContent = `
export const initialDictionary = ${JSON.stringify(dictionary, null, 2)};
export const initialPhrases = ${JSON.stringify(phrases, null, 2)};
`;

  fs.writeFileSync('src/data.js', dataJsContent);
  console.log('Done! Wrote words and phrases to src/data.js');
}

generate();
