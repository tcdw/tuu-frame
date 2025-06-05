import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentVideoPath, setCurrentVideoPath] = useState<string | undefined>(undefined);

  const handleOpenFile = async () => {
    const filePath = await window.electronAPI.openFile();
    console.log('Selected file:', filePath);
    if (filePath) {
      setVideoUrl(`mv-stream://${filePath}`);
    } else {
      setVideoUrl(undefined);
      console.log('No file selected');
    }
  };

  const handleOpenDirectory = async () => {
    const videoFiles = await window.electronAPI.openDirectory();
    console.log('Found video files:', videoFiles);
    if (videoFiles && videoFiles.length > 0) {
      setPlaylist(videoFiles);
      playRandomVideo(videoFiles, undefined); // Play a random video, ensuring it's not 'undefined'
    } else if (videoFiles) { // videoFiles is an empty array
      alert('No video files found in the selected directory.');
      setPlaylist([]);
      setVideoUrl(undefined);
      setCurrentVideoPath(undefined);
    } else { // videoFiles is undefined (e.g., dialog cancelled)
      console.log('No directory selected or an error occurred.');
      // Potentially clear playlist and videoUrl if desired
      // setPlaylist([]);
      // setVideoUrl(undefined);
      // setCurrentVideoPath(undefined);
    }
  };

  const playRandomVideo = (currentPlaylist: string[] = playlist, currentPath: string | undefined = currentVideoPath) => {
    if (!currentPlaylist || currentPlaylist.length === 0) {
      setVideoUrl(undefined);
      setCurrentVideoPath(undefined);
      return;
    }

    let randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    let nextVideoPath = currentPlaylist[randomIndex];

    // If playlist has more than one video and the randomly selected one is the same as current, try once more
    if (currentPlaylist.length > 1 && nextVideoPath === currentPath) {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
      nextVideoPath = currentPlaylist[randomIndex];
    }
    
    setCurrentVideoPath(nextVideoPath);
    setVideoUrl(`mv-stream://${encodeURIComponent(nextVideoPath)}`);
  };

  useEffect(() => {
    const handleUpdatePlaylist = (videoFiles: string[]) => {
      console.log('Received main:updatePlaylist IPC with videos:', videoFiles);
      if (videoFiles && videoFiles.length > 0) {
        setPlaylist(videoFiles);
        playRandomVideo(videoFiles); // Pass videoFiles directly to ensure it uses the latest
      } else {
        setPlaylist([]);
        setCurrentVideoPath(undefined);
        setVideoUrl(undefined);
        console.log('Received empty playlist or no video files from main process.');
      }
    };

    // Setup listener
    window.electronAPI?.onUpdatePlaylist(handleUpdatePlaylist);

    // Cleanup listener on component unmount
    return () => {
      // ipcRenderer.removeListener is not directly available here due to contextBridge
      // For now, we rely on the main process to manage sending to existing windows.
      // If multiple listeners become an issue, we'd need to expose a removeListener function via preload.
      // However, for a single App component instance, this should be fine.
      // A simple way to "remove" is to re-register with a no-op, but that's not clean.
      // The best practice would be for electronAPI.onUpdatePlaylist to return a cleanup function.
      // For now, let's assume this is okay for a single-window app.
      console.log('Cleaning up onUpdatePlaylist listener (conceptual).');
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleVideoEnded = () => {
    console.log('Video ended, playing next random video from playlist.');
    playRandomVideo(playlist, currentVideoPath);
  };

  return (
    <div className="App">
      <button onClick={handleOpenFile} className='test-btn'>Open Video File</button>
      <button onClick={handleOpenDirectory} className='test-btn' style={{ top: '5rem' }}>Open Directory</button>
      {videoUrl ? (
        <ReactPlayer
          url={videoUrl}
          playing
          controls
          width='100%'
          height='100%'
          onEnded={handleVideoEnded} // Play next random video when current one ends
        />
      ) : (
        <p>No video selected. Click "Open Video File" to choose a video.</p>
      )}
    </div>
  );
}

export default App
