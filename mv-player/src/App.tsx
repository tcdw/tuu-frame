import { useState } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  const handleOpenFile = async () => {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
      // Ensure the path is a URL format. For local files, it might need 'file://' prefix.
      // However, react-player often handles raw paths correctly on Electron.
      // Let's test without 'file://' first, and add if needed.
      // Forcing 'file://' can sometimes cause issues with spaces or special characters if not encoded properly.
      // A common practice is to let Electron/browser resolve it, but if issues arise, use:
      // setVideoUrl(`file://${filePath.replace(/\\/g, '/')}`); // Basic replacement for Windows paths
      // For local files, ReactPlayer needs a URL. On macOS/Linux, this is file:///path/to/file
      // On Windows, it would be file:///C:/path/to/file after converting backslashes.
      // Since the user is on macOS, we just need to prepend file://
      setVideoUrl(`mv-stream://${filePath}`);
    } else {
      setVideoUrl(undefined);
      console.log('No file selected');
    }
  };

  return (
    <div className="App">
      <button onClick={handleOpenFile}>Open Video File</button>
      {videoUrl ? (
        <ReactPlayer
          url={videoUrl}
          playing
          controls
          width='100%'
          height='calc(100vh - 80px)' // Adjusted height to make space for the button
        />
      ) : (
        <p>No video selected. Click "Open Video File" to choose a video.</p>
      )}
    </div>
  );
}

export default App
