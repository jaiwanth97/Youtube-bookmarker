document.addEventListener('DOMContentLoaded', function() {
    loadBookmarks();
    setupThemeToggle();
});

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = currentTheme + '-theme';
    themeToggle.checked = currentTheme === 'dark';
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.className = 'dark-theme';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.className = 'light-theme';
            localStorage.setItem('theme', 'light');
        }
    });
}

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
                    <p>No bookmarks yet</p>
                    <p>Click the + button on YouTube videos to add bookmarks</p>
                </div>
            `;
            return;
        }

        const sortedBookmarks = [...data.bookmarks].sort((a, b) => {
            const aTime = a.timestamp || 0;
            const bTime = b.timestamp || 0;
            return bTime - aTime;
        });

        const groupedBookmarks = {};
        sortedBookmarks.forEach(bookmark => {
            if (!groupedBookmarks[bookmark.videoId]) {
                groupedBookmarks[bookmark.videoId] = [];
            }
            groupedBookmarks[bookmark.videoId].push(bookmark);
        });
        Object.keys(groupedBookmarks).forEach(videoId => {
            const bookmarks = groupedBookmarks[videoId];
            const mainBookmark = bookmarks[0];
            const groupContainer = document.createElement("div");
            groupContainer.classList.add("bookmark-group");

            const mainElement = createBookmarkElement(mainBookmark, bookmarks.length > 1);
            mainElement.classList.add("bookmark-main");

            if (bookmarks.length > 1) {

                const dropdownIndicator = document.createElement("div");
                dropdownIndicator.classList.add("dropdown-indicator");
                
                const timestampCount = document.createElement("div");
                timestampCount.classList.add("timestamp-count");
                timestampCount.innerHTML = `
                    ${bookmarks.length}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                `;
                
                dropdownIndicator.appendChild(timestampCount);
                mainElement.querySelector(".bookmark-info").appendChild(dropdownIndicator);

                const dropdownContainer = document.createElement("div");
                dropdownContainer.classList.add("timestamps-dropdown");
                dropdownContainer.style.display = "none";

                bookmarks.slice(1).forEach(bookmark => {
                    const bookmarkElement = createBookmarkElement(bookmark, false);
                    bookmarkElement.classList.add("bookmark-timestamp");
                    dropdownContainer.appendChild(bookmarkElement);
                });
                
                groupContainer.appendChild(mainElement);
                groupContainer.appendChild(dropdownContainer);

                mainElement.addEventListener('click', function(e) {
                    if (e.target.closest('.btn') || e.target.closest('a')) return;
                    
                    const dropdown = this.parentNode.querySelector('.timestamps-dropdown');
                    const isHidden = dropdown.style.display === 'none';
                    dropdown.style.display = isHidden ? 'block' : 'none';

                    const icon = this.querySelector('.dropdown-icon');
                    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0)';
                });
            } else {
                groupContainer.appendChild(mainElement);
            }
            
            bookmarksList.appendChild(groupContainer);
        });
        addButtonEventListeners();
    });
}

function createBookmarkElement(bookmark, showTimestampsButton) {
    const bookmarkElement = document.createElement("div");
    bookmarkElement.classList.add("bookmark");

    const minutes = Math.floor(bookmark.time / 60);
    const seconds = bookmark.time % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
 
    const safeTitle = sanitizeString(bookmark.title || "Untitled");
    const truncatedTitle = truncateTitle(safeTitle, 38);
    const safeVideoLink = bookmark.videoLink || "#";
    const safeThumbnail = bookmark.thumbnail || "images/default-thumbnail.png";
    const videoId = bookmark.videoId || "";
    let buttonsHTML = `
        <button class="btn btn-play" data-link="${safeVideoLink}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Play
        </button>
    `;

    if (showTimestampsButton) {
        buttonsHTML += `
            <button class="btn btn-timestamps" data-video-id="${videoId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Timestamps
            </button>
        `;
    }
    
    buttonsHTML += `
        <button class="btn btn-delete" data-video-id="${bookmark.videoId}" data-time="${bookmark.time}" data-title="${safeTitle}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete
        </button>
    `;

    bookmarkElement.innerHTML = `
        <div class="bookmark-thumbnail">
            <img src="${safeThumbnail}" alt="Thumbnail" 
                 onerror="this.src='images/default-thumbnail.png';">
            <div class="bookmark-time">${formattedTime}</div>
        </div>
        <div class="bookmark-info">
            <h3 class="bookmark-title">
                <a href="${safeVideoLink}" target="_blank" title="${safeTitle}">
                    ${truncatedTitle}
                </a>
            </h3>
            <div class="bookmark-actions">
                ${buttonsHTML}
            </div>
        </div>
    `;

    return bookmarkElement;
}

function addButtonEventListeners() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const videoId = this.dataset.videoId;
            const time = parseInt(this.dataset.time);
            const title = this.dataset.title;
            
            if (videoId && time !== undefined) {
                deleteBookmark(videoId, time, title);
            }
        });
    });

    document.querySelectorAll('.btn-play').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const link = this.dataset.link;
            if (link) {
                chrome.tabs.create({ url: link });
            }
        });
    });

    document.querySelectorAll('.btn-timestamps').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();

            const mainElement = this.closest('.bookmark-main');
            if (mainElement) {
                mainElement.click();
            }
        });
    });
    
    document.querySelectorAll('.bookmark-title a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function deleteBookmark(videoId, time, title) {
    chrome.storage.sync.get({ bookmarks: [] }, (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error accessing bookmarks:", chrome.runtime.lastError);
            return;
        }
        
        const index = data.bookmarks.findIndex(bookmark => 
            bookmark.videoId === videoId && 
            bookmark.time === time &&
            bookmark.title === title
        );
        
        if (index === -1) {
            console.error("Bookmark not found");
            return;
        }
        
        const updatedBookmarks = [...data.bookmarks];
        updatedBookmarks.splice(index, 1);
        
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving updated bookmarks:", chrome.runtime.lastError);
                return;
            }
            
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
    
    container.insertBefore(errorEl, container.firstChild);
    setTimeout(() => {
        errorEl.style.opacity = '0';
        errorEl.style.transition = 'opacity 0.5s';
        setTimeout(() => errorEl.remove(), 500);
    }, 5000);
}

function sanitizeString(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function truncateTitle(title, maxLength) {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
}