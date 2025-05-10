chrome.storage.local.get({ bookmarks: [] }, (data) => {
    const bookmarksList = document.getElementById("bookmarks-list");

    if (data.bookmarks.length === 0) {
        bookmarksList.innerHTML = "<p>No bookmarks yet.</p>";
        return;
    }

    data.bookmarks.forEach((bookmark) => {
        const bookmarkElement = document.createElement("div");
        bookmarkElement.classList.add("bookmark");

        const img = document.createElement("img");
        img.src = bookmark.thumbnail;
        img.alt = "Thumbnail";
        img.style.width = "120px";
        bookmarkElement.appendChild(img);

        // Ensure the videoLink is correct and not related to the extension
        console.log("Generated videoLink:", bookmark.videoLink); // Debugging

        const title = document.createElement("p");
        const link = document.createElement("a");
        link.href = bookmark.videoLink; // Use the correct YouTube link
        link.target = "_blank"; // Open in new tab
        link.textContent = `Title: ${bookmark.title}`;
        title.appendChild(link);
        bookmarkElement.appendChild(title);

        const time = document.createElement("p");
        time.textContent = `Timestamp: ${bookmark.time}s`;
        bookmarkElement.appendChild(time);

        bookmarksList.appendChild(bookmarkElement);
    });
});
