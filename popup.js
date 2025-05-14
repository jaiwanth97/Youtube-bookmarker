// Retrieve bookmarks from storage and display them
chrome.storage.local.get({ bookmarks: [] }, (data) => {
    const bookmarksList = document.getElementById("bookmarks-list");

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
                    <button class="btn btn-delete" data-index="${index}">Delete</button>
                </div>
            </div>
        `;

        bookmarksList.appendChild(bookmarkElement);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const index = data.bookmarks.length - 1 - parseInt(this.dataset.index);
            
            // Remove the bookmark from storage
            const updatedBookmarks = [...data.bookmarks];
            updatedBookmarks.splice(index, 1);
            
            chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
                // Refresh the popup interface
                this.closest('.bookmark').remove();
                
                // If no bookmarks left, show empty state
                if (updatedBookmarks.length === 0) {
                    bookmarksList.innerHTML = `
                        <div class="empty-state">
                            <p>No bookmarks yet.</p>
                            <p>Click the + button on YouTube videos to add bookmarks.</p>
                        </div>
                    `;
                }
            });
        });
    });
});