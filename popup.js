document.addEventListener('DOMContentLoaded', function() {
    loadBookmarks();
});

function loadBookmarks() {
    chrome.storage.sync.get({ bookmarks: [] }, (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error loading bookmarks:", chrome.runtime.lastError);
            showErrorMessage("Could not load bookmarks. Please try again.");
            return;
        }

        const bookmarksList = document.getElementById("bookmarks-list");
        if (!bookmarksList) {
            console.error("Bookmarks list element not found");
            return;
        }
        
        bookmarksList.innerHTML = '';

        if (data.bookmarks.length === 0) {
            bookmarksList.innerHTML = `
                <div class="empty-state">
                    <p>No bookmarks yet.</p>
                    <p>Click the + button on YouTube videos to add bookmarks.</p>
                </div>
            `;
            return;
        }

        // Sort bookmarks by newest first (using timestamp if available)
        const sortedBookmarks = [...data.bookmarks].sort((a, b) => {
            // If timestamp exists, use it; otherwise fall back to array order
            const aTime = a.timestamp || 0;
            const bTime = b.timestamp || 0;
            return bTime - aTime; // Descending order (newest first)
        });

        sortedBookmarks.forEach((bookmark, index) => {
            const bookmarkElement = document.createElement("div");
            bookmarkElement.classList.add("bookmark");

            // Format time correctly
            const minutes = Math.floor(bookmark.time / 60);
            const seconds = bookmark.time % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Ensure title safety
            const safeTitle = sanitizeString(bookmark.title || "Untitled");
            const safeVideoLink = bookmark.videoLink || "#";
            const safeThumbnail = bookmark.thumbnail || "images/default-thumbnail.png";

            bookmarkElement.innerHTML = `
                <div class="bookmark-thumbnail">
                    <img src="${safeThumbnail}" alt="Thumbnail" 
                         onerror="this.src='images/default-thumbnail.png';">
                    <div class="bookmark-time">${formattedTime}</div>
                </div>
                <div class="bookmark-info">
                    <h3 class="bookmark-title">
                        <a href="${safeVideoLink}" target="_blank" title="${safeTitle}">
                            ${safeTitle}
                        </a>
                    </h3>
                    <div class="bookmark-actions">
                        <button class="btn btn-play" data-link="${safeVideoLink}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Play
                        </button>
                        <button class="btn btn-delete" data-id="${index}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            bookmarksList.appendChild(bookmarkElement);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.id);
                if (!isNaN(index) && index >= 0 && index < sortedBookmarks.length) {
                    deleteBookmark(sortedBookmarks[index]);
                }
            });
        });

        // Add event listeners for play buttons
        document.querySelectorAll('.btn-play').forEach(button => {
            button.addEventListener('click', function() {
                const link = this.dataset.link;
                if (link) {
                    chrome.tabs.create({ url: link });
                }
            });
        });
    });
}

function deleteBookmark(bookmarkToDelete) {
    chrome.storage.sync.get({ bookmarks: [] }, (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error accessing bookmarks:", chrome.runtime.lastError);
            return;
        }
        
        // Find the bookmark to delete by matching its properties
        const index = data.bookmarks.findIndex(bookmark => 
            bookmark.videoId === bookmarkToDelete.videoId && 
            bookmark.time === bookmarkToDelete.time &&
            bookmark.title === bookmarkToDelete.title
        );
        
        if (index === -1) {
            console.error("Bookmark not found");
            return;
        }
        
        // Remove the bookmark
        const updatedBookmarks = [...data.bookmarks];
        updatedBookmarks.splice(index, 1);
        
        // Update storage with the modified bookmarks array
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving updated bookmarks:", chrome.runtime.lastError);
                return;
            }
            
            // Reload the bookmarks display
            loadBookmarks();
        });
    });
}

function showErrorMessage(message) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        background-color: #ffebee;
        color: #c62828;
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 4px;
        font-size: 14px;
    `;
    
    // Insert at top of container
    container.insertBefore(errorEl, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorEl.style.opacity = '0';
        errorEl.style.transition = 'opacity 0.5s';
        setTimeout(() => errorEl.remove(), 500);
    }, 5000);
}

// Sanitize strings to prevent XSS
function sanitizeString(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}