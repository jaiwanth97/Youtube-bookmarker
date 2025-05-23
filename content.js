// Content script modifications for handling duplicate bookmarks

function injectPlusButton() {
    const rightControls = document.querySelector(".ytp-right-controls");
    if (!rightControls) return;

    // Prevent duplicate button injection
    if (document.getElementById("yt-bookmark-btn")) return;

    const button = document.createElement("button");
    button.id = "yt-bookmark-btn";
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("images/plus.png");
    img.alt = "Bookmark";
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.marginBottom = "15px";
    button.appendChild(img);
    button.className = "ytp-button";
    button.title = "Bookmark current timestamp";
    button.style.fontSize = "20px";
    button.style.fontWeight = "bold";
    
    button.addEventListener("click", () => {
        const video = document.querySelector("video");
        if (!video) {
            console.error("No video element found");
            return;
        }
        
        // Get video information
        const title = document.title.replace(" - YouTube", "").trim();
        const time = Math.floor(video.currentTime);
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get("v");
        
        // Validate we have a valid videoId
        if (!videoId) {
            console.error("No video ID found");
            return;
        }
        
        const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        const videoLink = `https://www.youtube.com/watch?v=${videoId}&t=${time}s`;
        const newBookmark = { 
            title, 
            time, 
            videoId, 
            thumbnail, 
            videoLink,
            timestamp: Date.now() // Add timestamp for uniqueness and sorting
        };

        // Store bookmark directly without relying on background script
        chrome.storage.sync.get({ bookmarks: [] }, (data) => {
            // Check for duplicates - we only need to check for exact time duplicates
            const isDuplicate = data.bookmarks.some(bookmark => 
                bookmark.videoId === videoId && Math.abs(bookmark.time - time) < 3
            );
            
            if (!isDuplicate) {
                const updatedBookmarks = [...data.bookmarks, newBookmark];
                chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error saving bookmark:", chrome.runtime.lastError);
                        return;
                    }
                    // Show a brief notification - we're bookmarking a new timestamp
                    showSaveNotification("Bookmark saved!");
                });
            } else {
                // Already bookmarked this timestamp, show notification
                showSaveNotification("Already bookmarked!");
            }
        });
    });

    rightControls.insertAdjacentElement("afterbegin", button);
}

function showSaveNotification(message = "Bookmark saved!") {
    // Create notification element
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 9999;
        font-family: Roboto, Arial, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.5s";
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Track if we're in the process of checking for video player
let checkingForVideoPlayer = false;

function checkForVideoPlayerAndInject() {
    // Prevent multiple concurrent checks
    if (checkingForVideoPlayer) return;
    
    checkingForVideoPlayer = true;
    
    // More robust checking for video player with retry logic
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(() => {
        const rightControls = document.querySelector(".ytp-right-controls");
        if (rightControls) {
            clearInterval(checkInterval);
            injectPlusButton();
            checkingForVideoPlayer = false;
        } else if (++attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.log("Failed to find video controls after max attempts");
            checkingForVideoPlayer = false;
        }
    }, 500);
}

// URL change detection
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        
        // Only inject on watch pages
        if (location.pathname === "/watch") {
            checkForVideoPlayerAndInject();
        }
    }
});

// Start observing
observer.observe(document, { subtree: true, childList: true });

// Initial injection attempt
if (location.pathname === "/watch") {
    checkForVideoPlayerAndInject();
}