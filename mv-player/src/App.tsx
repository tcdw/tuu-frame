import { useState } from 'react';
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

  const playRandomVideo = (currentPlaylist: string[], currentPath?: string) => {
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
    setVideoUrl(`mv-stream://${nextVideoPath}`);
  };

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
