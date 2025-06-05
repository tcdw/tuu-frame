import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentVideoPath, setCurrentVideoPath] = useState<string | undefined>(undefined);

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
    <>
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          className='my-video'
          onEnded={handleVideoEnded} // Play next random video when current one ends
        />
      ) : (
        <p>No video selected. Click "Open Video File" to choose a video.</p>
      )}
    </>
  );
}

export default App
