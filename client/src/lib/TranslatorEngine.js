/**
 * Simple NLP and Dictionary Engine for Text-to-Sign translation
 * In a production app, this would be a backend service using a robust NLP library like SpaCy
 * and a comprehensive ASL dictionary API.
 */

// Basic dictionary mapping words to visual representations (or video IDs/SVG data)
const ASL_DICTIONARY = {
  "hello": { type: "phrase", word: "Hello", description: "Wave hand outward." },
  "my": { type: "phrase", word: "My", description: "Place flat hand on chest." },
  "name": { type: "phrase", word: "Name", description: "Tap extended index and middle fingers of both hands together, forming an 'X' shape." },
  "is": { type: "ignore" }, // "is" is generally dropped in ASL grammar when asserting identity
  "what": { type: "phrase", word: "What", description: "Hold hands palms up and move them side to side slightly." },
  "thank you": { type: "phrase", word: "Thank You", description: "Touch chin with fingertips and move hand forward." },
  "thanks": { type: "phrase", word: "Thank You", description: "Touch chin with fingertips and move hand forward." },
  "goodbye": { type: "phrase", word: "Goodbye", description: "Wave hand by folding fingers up and down." },
  "yes": { type: "phrase", word: "Yes", description: "Make a fist and nod it up and down." },
  "no": { type: "phrase", word: "No", description: "Snap index and middle finger to thumb." },
  "please": { type: "phrase", word: "Please", description: "Rub open hand in a circle on chest." },
  "sorry": { type: "phrase", word: "Sorry", description: "Make a fist and rub in circle on chest." },
  "love": { type: "phrase", word: "Love", description: "Cross arms over chest with fists, like a hug." },
  "you": { type: "phrase", word: "You", description: "Point directly at the person." },
  "me": { type: "phrase", word: "Me", description: "Point to yourself." },
  "i": { type: "phrase", word: "I", description: "Point to yourself." },
  "help": { type: "phrase", word: "Help", description: "Place fist on open palm and raise both." },
  "eat": { type: "phrase", word: "Eat", description: "Make flat O shape and tap mouth." },
  "food": { type: "phrase", word: "Food", description: "Make flat O shape and tap mouth." },
  "water": { type: "phrase", word: "Water", description: "Make W handshape and tap index finger to chin." },
  "learn": { type: "phrase", word: "Learn", description: "One hand flat, other hand grasps 'information' from it and brings to forehead." },
  "sign": { type: "phrase", word: "Sign", description: "Index fingers point up, circle hands back towards body." }
};

// Common ASL phrase groupings for simple NLP
const PHRASES = [
  "thank you",
  "good morning",
  "good night",
  "how are you",
  "excuse me",
  "see you later"
];

export const translateTextToSignSequence = (text) => {
  if (!text || typeof text !== "string") return [];

  // 1. Normalize and clean the text
  let cleanText = text.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")
    .replace(/\s{2,}/g," ")
    .trim();

  // 2. Multi-word phrase extraction
  // Check if string contains multi-word phrases and temporarily replace them to protect them during split
  PHRASES.forEach((phrase, index) => {
    if (cleanText.includes(phrase)) {
      cleanText = cleanText.replace(new RegExp(phrase, 'g'), `__PHRASE_${index}__`);
    }
  });

  // 3. Tokenize by space
  const tokens = cleanText.split(" ");
  const sequence = [];

  // 4. Map to ASL signs
  for (const token of tokens) {
    if (!token) continue;

    // Check if it's a protected multi-word phrase
    if (token.startsWith("__PHRASE_")) {
      const phraseIndex = parseInt(token.replace("__PHRASE_", "").replace("__", ""));
      const phraseStr = PHRASES[phraseIndex];
      const dictEntry = ASL_DICTIONARY[phraseStr];
      if (dictEntry) {
        sequence.push({
          id: `t_${Date.now()}_${sequence.length}`,
          ...dictEntry
        });
      }
      continue;
    }

    // Check exact word match
    const dictionaryMatch = ASL_DICTIONARY[token];
    
    if (dictionaryMatch) {
      if (dictionaryMatch.type !== "ignore") {
        sequence.push({
          id: `t_${Date.now()}_${sequence.length}`,
          ...dictionaryMatch
        });
      }
    } else {
      // Fingerspelling fallback for unknown words
      // ASL drops articles often, so let's ignore a, an, the entirely
      if (["a", "an", "the", "to", "are"].includes(token)) {
        continue;
      }
      
      const letters = token.split("");
      for (const letter of letters) {
        sequence.push({
          id: `t_${Date.now()}_${sequence.length}`,
          type: "letter",
          word: letter.toUpperCase(),
          description: `Fingerspell letter ${letter.toUpperCase()}`
        });
      }
    }
  }

  return sequence;
};
