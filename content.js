function injectPlusButton() {
    const rightControls = document.querySelector(".ytp-right-controls");
    if (!rightControls) return;

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

        const title = document.title.replace(" - YouTube", "").trim();
        const time = Math.floor(video.currentTime);
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get("v");

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
            timestamp: Date.now()
        };
        chrome.storage.sync.get({ bookmarks: [] }, (data) => {
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
                    showSaveNotification("Bookmark saved!");
                });
            } else {
                showSaveNotification("Already bookmarked!");
            }
        });
    });

    rightControls.insertAdjacentElement("afterbegin", button);
}

function showSaveNotification(message = "Bookmark saved!") {
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
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.5s";
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}
let checkingForVideoPlayer = false;

function checkForVideoPlayerAndInject() {
    if (checkingForVideoPlayer) return;
    
    checkingForVideoPlayer = true;
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

let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (location.pathname === "/watch") {
            checkForVideoPlayerAndInject();
        }
    }
});
observer.observe(document, { subtree: true, childList: true });

if (location.pathname === "/watch") {
    checkForVideoPlayerAndInject();
}