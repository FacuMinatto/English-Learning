const fs = require('fs');
const translate = require('google-translate-api-x');

async function generate() {
  const words = fs.readFileSync('words.txt', 'utf8').split('\n').map(w => w.trim()).filter(Boolean).slice(0, 1000);
  console.log(`Translating ${words.length} words...`);
  
  const dictionary = [];
  const chunkSize = 20; // smaller chunk to avoid rate limits
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    try {
      console.log(`Translating ${i} to ${i + chunkSize}...`);
      const res = await translate(chunk, { to: 'es' });
      const translations = Array.isArray(res) ? res : [res];
      
      for (let j = 0; j < chunk.length; j++) {
        // Capitalize first letter
        const en = chunk[j].charAt(0).toUpperCase() + chunk[j].slice(1);
        const es = translations[j].text.charAt(0).toUpperCase() + translations[j].text.slice(1).toLowerCase();
        dictionary.push({
          id: i + j + 1,
          english: en,
          spanish: es
        });
      }
      // Wait a bit to avoid rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error('Translation failed', e);
      for (let j = 0; j < chunk.length; j++) {
        dictionary.push({ id: i + j + 1, english: chunk[j], spanish: chunk[j] });
      }
    }
  }

  const dataJsContent = `
export const initialDictionary = ${JSON.stringify(dictionary, null, 2)};

export const initialPhrases = [
  { id: 1, english: "How are you doing?", spanish: "¿Cómo te va?" },
  { id: 2, english: "I appreciate it.", spanish: "Te lo agradezco." },
  { id: 3, english: "That sounds great!", spanish: "¡Eso suena genial!" },
  { id: 4, english: "Let's catch up soon.", spanish: "Pongámonos al día pronto." },
  { id: 5, english: "Could you repeat that?", spanish: "¿Podrías repetir eso?" },
  { id: 6, english: "I'll be right back.", spanish: "Vuelvo enseguida." },
  { id: 7, english: "Take your time.", spanish: "Tómate tu tiempo." },
  { id: 8, english: "It doesn't matter.", spanish: "No importa." },
  { id: 9, english: "By the way.", spanish: "Por cierto." },
  { id: 10, english: "To be honest.", spanish: "Para ser honesto." },
  { id: 11, english: "Never mind.", spanish: "No importa / Olvídalo." },
  { id: 12, english: "I have no idea.", spanish: "No tengo ni idea." },
  { id: 13, english: "As soon as possible.", spanish: "Lo antes posible." },
  { id: 14, english: "Make yourself at home.", spanish: "Siéntete como en casa." },
  { id: 15, english: "Keep up the good work.", spanish: "Sigue así (buen trabajo)." }
];
`;

  fs.writeFileSync('src/data.js', dataJsContent);
  console.log('Done! Wrote 1000 words to src/data.js');
}

generate();
