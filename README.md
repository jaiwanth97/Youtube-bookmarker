# YouTube Bookmarker

![YouTube Bookmarker](https://img.shields.io/badge/Chrome%20Extension-v2.1.3-red)
![License](https://img.shields.io/badge/License-MIT-blue)

A Chrome extension that allows you to bookmark specific timestamps in YouTube videos for later reference. Save your favorite moments, important sections, or quotes with a single click and access them anytime from the extension's popup.

## Features

- 🎬 Bookmark specific timestamps in YouTube videos with a single click
- 🕒 Organize timestamps from the same video automatically
- 📋 View all your bookmarks in a clean, user-friendly interface
- 🌙 Toggle between light and dark themes
- 🔄 Synchronize bookmarks across devices via Chrome sync
- 🚀 Fast and lightweight with minimal impact on performance

## Installation

### Installation

### Manual Installation
1. Download or clone this repository
   ```
   git clone https://github.com/jaiwanth97/youtube-bookmarker.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## How to Use

### Adding Bookmarks
1. Navigate to any YouTube video
2. A "+" button will appear in the YouTube player controls
3. Play the video and click the "+" button at any timestamp you want to bookmark
4. A notification will appear confirming your bookmark was saved

### Managing Bookmarks
1. Click the YouTube Bookmarker icon in your Chrome toolbar
2. View all your bookmarks organized by video
3. Use the provided buttons to:
   - 🎬 **Play**: Open the video at the specific timestamp
   - 🕒 **Timestamps**: View all bookmarks for the same video
   - 🗑️ **Delete**: Remove the bookmark

### Theme Toggle
- Use the theme toggle switch in the header to switch between dark and light themes
- Your theme preference will be saved for future sessions

## Technical Details

### Architecture
- **Background Script**: Handles extension initialization and storage setup
- **Content Script**: Injects the bookmark button into YouTube pages and handles bookmark creation
- **Popup Interface**: Provides a user interface for managing bookmarks

### Technologies Used
- HTML5, CSS3, and JavaScript
- Chrome Extension API
- Chrome Storage Sync API

## Storage and Privacy

- All bookmarks are stored in Chrome's sync storage, allowing access across devices where you're signed in
- No data is sent to external servers
- No tracking or analytics are implemented
- The extension only requires access to YouTube domains and storage permission

## Development

### Project Structure
- `manifest.json` - Extension configuration
- `background.js` - Background service worker
- `content.js` - YouTube page integration
- `popup.html`, `popup.js`, `popup.css` - User interface
- `images/` - Icons and assets

### Building and Testing
1. Make your changes to the codebase
2. Load the extension in Chrome using Developer mode
3. Test functionality on YouTube videos
4. Use Chrome DevTools to debug if needed (right-click the extension icon and select "Inspect Popup")

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **jaiwanth97** - [GitHub Profile](https://github.com/jaiwanth97)

## Acknowledgments

- Icon design inspired by YouTube's UI
- Thanks to all contributors and users who provided feedback

---

If you find this extension useful, please consider starring the GitHub repository!