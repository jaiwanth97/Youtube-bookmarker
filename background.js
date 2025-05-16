// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Bookmarker extension installed");

  chrome.storage.sync.get("bookmarks", (data) => {
    if (!data.bookmarks) {
      chrome.storage.sync.set({ bookmarks: [] }, () => {
        console.log("Bookmarks storage initialized");
      });
    }
  });
});