const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

let translatedText = '';
let isTranslating = false;

const LANG_CODES = {
  'English': 'en', 'Bengali': 'bn', 'Spanish': 'es',
  'French': 'fr', 'German': 'de', 'Italian': 'it',
  'Portuguese': 'pt', 'Dutch': 'nl', 'Russian': 'ru',
  'Chinese (Simplified)': 'zh-CN', 'Chinese (Traditional)': 'zh-TW',
  'Japanese': 'ja', 'Korean': 'ko', 'Arabic': 'ar',
  'Hindi': 'hi', 'Turkish': 'tr', 'Vietnamese': 'vi',
  'Thai': 'th', 'Polish': 'pl', 'Ukrainian': 'uk',
  'Swedish': 'sv', 'Greek': 'el', 'Hebrew': 'he',
  'Indonesian': 'id', 'Persian': 'fa', 'Swahili': 'sw', 'auto': 'auto'
};

document.getElementById('inputText').addEventListener('input', () => {
  const len = document.getElementById('inputText').value.length;
  document.getElementById('charCount').textContent = len + ' / 5000';
});

document.getElementById('inputText').addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('translateBtn').click();
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('inputText').value = '';
  document.getElementById('outputText').innerHTML = 'Translation appears here';
  document.getElementById('charCount').textContent = '0 / 5000';
  document.getElementById('outCount').textContent = '';
  document.getElementById('detectedBadge').textContent = '';
  document.getElementById('statusBar').textContent = '';
  document.getElementById('statusBar').className = 'status-bar';
  translatedText = '';
});

document.getElementById('swapBtn').addEventListener('click', () => {
  const src = document.getElementById('srcLang');
  const tgt = document.getElementById('tgtLang');
  if (src.value === 'auto') return;
  const srcVal = src.value;
  const tgtVal = tgt.value;
  src.value = tgtVal;
  tgt.value = srcVal;
  document.getElementById('inputText').value = translatedText || '';
  document.getElementById('outputText').innerHTML = 'Translation appears here';
  translatedText = '';
  document.getElementById('outCount').textContent = '';
  const len = document.getElementById('inputText').value.length;
  document.getElementById('charCount').textContent = len + ' / 5000';
});

document.getElementById('copyBtn').addEventListener('click', () => {
  if (!translatedText) return;
  navigator.clipboard.writeText(translatedText).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.innerHTML = '';
    setTimeout(() => { btn.innerHTML = ''; }, 1500);
  });
});

document.getElementById('speakSrcBtn').addEventListener('click', () => {
  const text = document.getElementById('inputText').value;
  if (!text) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
});

document.getElementById('speakTgtBtn').addEventListener('click', () => {
  if (!translatedText) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(translatedText));
});

document.getElementById('translateBtn').addEventListener('click', async () => {
  if (isTranslating) return;
  const inputText = document.getElementById('inputText').value.trim();
  if (!inputText) { showStatus('Please enter some text to translate.', 'error'); return; }
  const srcLangName = document.getElementById('srcLang').value;
  const tgtLangName = document.getElementById('tgtLang').value;
  const srcCode = LANG_CODES[srcLangName] || 'en';
  const tgtCode = LANG_CODES[tgtLangName] || 'en';
  if (srcCode !== 'auto' && srcCode === tgtCode) {
    showStatus('Source and target languages are the same.', 'error'); return;
  }
  isTranslating = true;
  const btn = document.getElementById('translateBtn');
  btn.disabled = true;
  btn.innerHTML = 'Translating...';
  document.getElementById('outputText').innerHTML = 'Translating...';
  document.getElementById('detectedBadge').textContent = '';
  document.getElementById('statusBar').textContent = '';
  try {
    const langPair = srcCode === 'auto' ? `en|${tgtCode}` : `${srcCode}|${tgtCode}`;
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(inputText)}&langpair=${langPair}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error: ' + response.status);
    const data = await response.json();
    if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed');
    const result = data.responseData.translatedText;
    translatedText = result;
    document.getElementById('outputText').textContent = result;
    document.getElementById('outCount').textContent = result.length + ' chars';
    if (srcCode === 'auto' && data.responseData.detectedSourceLanguage) {
      document.getElementById('detectedBadge').innerHTML =
        `Detected: ${data.responseData.detectedSourceLanguage}`;
    }
    showStatus('✓ Translation complete — Ctrl+Enter to translate again', 'success');
  } catch (err) {
    document.getElementById('outputText').innerHTML =
      'Translation failed. Please try again.';
    showStatus('Error: ' + (err.message || 'Something went wrong.'), 'error');
  } finally {
    isTranslating = false;
    btn.disabled = false;
    btn.innerHTML = ' Translate';
  }
});

function showStatus(msg, type) {
  const el = document.getElementById('statusBar');
  el.textContent = msg;
  el.className = 'status-bar' + (type ? ' ' + type : '');
}
