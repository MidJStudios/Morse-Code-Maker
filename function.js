// Simple Morse Code beeper using Web Audio API
// 1 kHz sine wave, 0.1 second time increments

// Morse table (A–Z, 0–9, basic punctuation)
const MORSE_TABLE = {
  'A': '.-',
  'B': '-...',
  'C': '-.-.',
  'D': '-..',
  'E': '.',
  'F': '..-.',
  'G': '--.',
  'H': '....',
  'I': '..',
  'J': '.---',
  'K': '-.-',
  'L': '.-..',
  'M': '--',
  'N': '-.',
  'O': '---',
  'P': '.--.',
  'Q': '--.-',
  'R': '.-.',
  'S': '...',
  'T': '-',
  'U': '..-',
  'V': '...-',
  'W': '.--',
  'X': '-..-',
  'Y': '-.--',
  'Z': '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '!': '-.-.--',
  '-': '-....-',
  '/': '-..-.',
  '@': '.--.-.',
  '(': '-.--.',
  ')': '-.--.-',
  ';': '-.-.-.',
  ':': '---...',
  '$': '...-..-',
  '&': '.-...',
  '_': '..--.-',
  '"': '.-..-.',
  "'": '.----.',
  '=': '-...-',
};

// Timing constants (seconds)
const UNIT = 0.05;          // base unit
const DOT = UNIT;          // 1 unit
const DASH = 3 * UNIT;     // 3 units
const GAP_INTRA = UNIT;    // between dots/dashes in same letter
const GAP_LETTER = 3 * UNIT; // between letters
const GAP_WORD = 7 * UNIT;   // between words

// Create AudioContext once
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Play a single tone segment (dot or dash)
function scheduleBeep(startTime, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 1000; // 1 kHz

  // connect oscillator -> gain -> destination
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // envelope: on at startTime, off at startTime + duration
  gain.gain.setValueAtTime(1, startTime);
  gain.gain.setValueAtTime(0, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01); // small buffer
}

// Convert text to Morse and schedule beeps
function playMorseFromText(text) {
  const now = audioCtx.currentTime;
  let t = now;

  const words = text.toUpperCase().split(/\s+/);

  words.forEach((word, wIndex) => {
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const pattern = MORSE_TABLE[ch];
      if (!pattern) {
        // skip unsupported characters
        continue;
      }

      // For each symbol in the letter
      for (let j = 0; j < pattern.length; j++) {
        const symbol = pattern[j];
        const duration = symbol === '.' ? DOT : DASH;

        // beep
        scheduleBeep(t, duration);
        t += duration;

        // intra-character gap (except after last symbol)
        if (j < pattern.length - 1) {
          t += GAP_INTRA;
        }
      }

      // letter gap (except after last letter in word)
      if (i < word.length - 1) {
        t += GAP_LETTER;
      }
    }

    // word gap (except after last word)
    if (wIndex < words.length - 1) {
      t += GAP_WORD;
    }
  });
}

// Example usage:
// Call playMorseFromText("hello world") from a button click
// (user interaction is needed to start AudioContext on some browsers)
document.getElementById('morseButton').addEventListener('click', () => {
  const input = document.getElementById('morseInput').value || 'hello world';
  playMorseFromText(input);
});