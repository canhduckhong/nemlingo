// No API key needed for the free Google Translate API

document.addEventListener('DOMContentLoaded', async () => {
  chrome.storage.local.get('selectedWord', async (result) => {
    const selectedWord = result.selectedWord;
    console.log('Retrieved from storage:', result);
    console.log('selectedWord:', selectedWord);
    
    if (!selectedWord) {
      // Handle case where selectedWord is undefined
      document.getElementById('word').textContent = 'No word selected';
      document.getElementById('meaning').textContent = 'Please select a Danish word on a webpage, right-click and choose "Translate Danish word" from the context menu.';
      document.getElementById('pronunciation').hidden = true;
      return; // Exit early
    }
    
    document.getElementById('word').textContent = selectedWord;
    
    // Set up audio right away so it's ready to play
    const audio = document.getElementById('pronunciation');
    audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(selectedWord)}&tl=da&client=tw-ob`;
    
    // Auto-play the audio when popup opens
    audio.addEventListener('canplaythrough', () => {
      audio.play();
    });
    // Use Google Translate API to translate from Danish to English
    try {
      // Get translation
      const translateResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=da&tl=en&dt=t&dt=bd&dj=1&q=${encodeURIComponent(selectedWord)}`);
      const translateData = await translateResponse.json();
      console.log('Translation data:', translateData);
      
      // Get pronunciation data - specifically for Danish
      const pronunciationResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=da&tl=en&dt=rm&dj=1&q=${encodeURIComponent(selectedWord)}`);
      const pronunciationData = await pronunciationResponse.json();
      console.log('Pronunciation data:', pronunciationData);
      
      // Extract main translation
      const mainTranslation = translateData.sentences?.[0]?.trans || "Translation not available";
      
      // Extract pronunciation if available
      let pronunciation = "";
      if (pronunciationData && pronunciationData.sentences && pronunciationData.sentences[0] && pronunciationData.sentences[0].src_translit) {
        pronunciation = pronunciationData.sentences[0].src_translit;
      }
      
      // Extract definitions if available
      let definitions = [];
      if (translateData.dict && translateData.dict.length > 0 && translateData.dict[0].terms) {
        definitions = translateData.dict[0].terms.slice(0, 3); // Get up to 3 definitions
      }
      
      // Format the translation result
      let result = {
        translation: mainTranslation,
        pronunciation: pronunciation,
        definitions: definitions
      };
      
      // Format the output to be more readable with HTML
      const formattedResult = formatTranslationResult(result);
      document.getElementById('meaning').innerHTML = formattedResult;
    } catch (error) {
      console.error('Translation error:', error);
      document.getElementById('meaning').textContent = `Error: Could not get translation. ${error.message}`;
    }

    // We already set up the audio earlier and started playing it
  });
});

/**
 * Format the translation result to be more readable with HTML
 * @param {Object} result - The translation result object
 * @returns {string} Formatted HTML
 */
function formatTranslationResult(result) {
  if (!result) return "";
  
  let html = '';
  
  // Add the main translation
  if (result.translation) {
    html += `<div class="translation"><strong>Translation:</strong> ${result.translation}</div>`;
  }
  
  // Add pronunciation if available
  if (result.pronunciation) {
    html += `<div class="pronunciation"><strong>Pronunciation:</strong> <span class="ipa">${result.pronunciation}</span></div>`;
  }
  
  // Add definitions if available
  if (result.definitions && result.definitions.length > 0) {
    html += `<p><strong>Meanings:</strong></p>`;
    html += `<ul>`;
    result.definitions.forEach(def => {
      html += `<li>${def}</li>`;
    });
    html += `</ul>`;
  }
  
  // If no content was added, return a default message
  if (!html) {
    return `<p>No translation information available.</p>`;
  }
  
  return html;
}
