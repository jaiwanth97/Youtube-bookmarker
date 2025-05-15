// Retrieve bookmarks from storage and display them
document.addEventListener('DOMContentLoaded', function() {
    loadBookmarks();
});

function loadBookmarks() {
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
        const bookmarksList = document.getElementById("bookmarks-list");
        bookmarksList.innerHTML = ''; // Clear existing content

        if (data.bookmarks.length === 0) {
            bookmarksList.innerHTML = `
                <div class="empty-state">
                    <p>No bookmarks yet.</p>
                    <p>Click the + button on YouTube videos to add bookmarks.</p>
                </div>
            `;
            return;
        }

        // Display bookmarks in reverse order (newest first)
        data.bookmarks.slice().reverse().forEach((bookmark, index) => {
            const bookmarkElement = document.createElement("div");
            bookmarkElement.classList.add("bookmark");

            // Format time (convert seconds to MM:SS format)
            const minutes = Math.floor(bookmark.time / 60);
            const seconds = bookmark.time % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            bookmarkElement.innerHTML = `
                <div class="bookmark-thumbnail">
                    <img src="${bookmark.thumbnail}" alt="Thumbnail">
                    <div class="bookmark-time">${formattedTime}</div>
                </div>
                <div class="bookmark-info">
                    <h3 class="bookmark-title">
                        <a href="${bookmark.videoLink}" target="_blank" title="${bookmark.title}">
                            ${bookmark.title}
                        </a>
                    </h3>
                    <div class="bookmark-actions">
                        <button class="btn btn-delete" data-index="${data.bookmarks.length - 1 - index}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
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
                deleteBookmark(parseInt(this.dataset.index));
            });
        });
    });
}

function deleteBookmark(index) {
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
        // Remove the bookmark at the specified index
        const updatedBookmarks = [...data.bookmarks];
        updatedBookmarks.splice(index, 1);
        
        // Update storage with the modified bookmarks array
        chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
            // Reload the bookmarks display
            loadBookmarks();
        });
    });
}