document.addEventListener('DOMContentLoaded', async () => {
  const translationsContainer = document.getElementById('translations-container');
  
  try {
    // Get saved translations from storage
    const result = await chrome.storage.local.get('savedTranslations');
    const savedTranslations = result.savedTranslations || [];
    
    if (savedTranslations.length === 0) {
      translationsContainer.innerHTML = `
        <div class="no-translations">
          No translations saved yet. Translate some words to see them here!
        </div>
      `;
      return;
    }
    
    // Sort by most recent first
    savedTranslations.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Clear loading message
    translationsContainer.innerHTML = '';
    
    // Create a card for each translation
    savedTranslations.forEach(translation => {
      const translationElement = document.createElement('div');
      translationElement.className = 'translation-item';
      
      let definitionsHtml = '';
      if (translation.definitions && translation.definitions.length > 0) {
        definitionsHtml = `
          <div class="definitions">
            <strong>Meanings:</strong>
            <ul>
              ${translation.definitions.map(def => `<li>${def}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      const date = new Date(translation.timestamp).toLocaleString();
      
      translationElement.innerHTML = `
        <div class="word">${translation.word}</div>
        ${translation.translation ? `<div class="translation"><strong>Translation:</strong> ${translation.translation}</div>` : ''}
        ${translation.pronunciation ? `<div class="pronunciation"><strong>Pronunciation:</strong> ${translation.pronunciation}</div>` : ''}
        ${definitionsHtml}
        <div class="timestamp">Saved on ${date}</div>
      `;
      
      translationsContainer.appendChild(translationElement);
    });
    
  } catch (error) {
    console.error('Error loading translations:', error);
    translationsContainer.innerHTML = `
      <div class="no-translations">
        Error loading saved translations. Please try again.
      </div>
    `;
  }
});
