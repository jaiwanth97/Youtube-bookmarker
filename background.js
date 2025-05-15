// Background service worker for the Chrome Bookmarker extension

// Initialize when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Bookmarker extension installed");
  
  // Initialize bookmarks storage if needed
  chrome.storage.sync.get("bookmarks", (data) => {
    if (!data.bookmarks) {
      chrome.storage.sync.set({ bookmarks: [] }, () => {
        console.log("Bookmarks storage initialized");
      });
    }
  });
});