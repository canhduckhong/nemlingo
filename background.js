chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "translate-danish-word",
      title: "Translate Danish word",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "translate-danish-word" && info.selectionText) {
      // Check that we have text selected
      console.log('Saving selected word:', info.selectionText);
      
      // Only open popup after storage operation is complete
      chrome.storage.local.set({ selectedWord: info.selectionText }, () => {
        console.log('Selected word saved to storage');
        chrome.action.openPopup();
      });
    } else if (info.menuItemId === "translate-danish-word") {
      console.error('No text was selected');
    }
  });
  