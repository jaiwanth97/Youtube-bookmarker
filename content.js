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
        const title = document.title.replace(" - YouTube", "");
        const time = Math.floor(video.currentTime);
        const videoId = new URLSearchParams(window.location.search).get("v");
        const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        const videoLink = `https://www.youtube.com/watch?v=${videoId}&t=${time}s`;

        // Storing bookmark using Chrome's storage API
        chrome.storage.local.get({ bookmarks: [] }, (data) => {
            const newBookmark = { title, time, videoId, thumbnail, videoLink};

            // Add the new bookmark to the list
            const updatedBookmarks = [...data.bookmarks, newBookmark];

            // Save the updated bookmarks list
            chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
                console.log("Bookmark saved:", newBookmark);
            });
        });
    });

    rightControls.insertAdjacentElement("afterbegin", button);
}

let lastUrl = location.href;
const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(injectPlusButton, 2000);
    }
});

observer.observe(document, { subtree: true, childList: true });

setTimeout(injectPlusButton, 2000);