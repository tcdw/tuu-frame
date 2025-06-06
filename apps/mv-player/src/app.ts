import './App.css';

let currentPlaylist: string[] = [];
let currentVideoPath: string | undefined = undefined;

const videoElement = document.getElementById('video-player') as HTMLVideoElement | null;
const statusMessageElement = document.getElementById('status-message') as HTMLParagraphElement | null;

function setVideoUrl(url: string | undefined) {
  if (videoElement) {
    if (url) {
      videoElement.src = url;
      videoElement.controls = true;
      videoElement.style.display = 'block';
      if (statusMessageElement) statusMessageElement.style.display = 'none';
    } else {
      videoElement.src = '';
      videoElement.style.display = 'none';
      if (statusMessageElement) {
        statusMessageElement.textContent = 'No video selected or playlist empty.';
        statusMessageElement.style.display = 'block';
      }
    }
  }
}

function playRandomVideo(playlistToUse: string[] = currentPlaylist, previousPath: string | undefined = currentVideoPath) {
  if (!videoElement) {
    console.error('Video element not found');
    return;
  }

  if (!playlistToUse || playlistToUse.length === 0) {
    setVideoUrl(undefined);
    currentVideoPath = undefined;
    console.log('Playlist is empty. Stopping playback.');
    return;
  }

  let randomIndex = Math.floor(Math.random() * playlistToUse.length);
  let nextVideoPath = playlistToUse[randomIndex];

  if (playlistToUse.length > 1 && nextVideoPath === previousPath) {
    randomIndex = (randomIndex + 1) % playlistToUse.length;
    nextVideoPath = playlistToUse[randomIndex];
  }

  currentVideoPath = nextVideoPath;
  const newVideoUrl = `mv-stream://${encodeURIComponent(nextVideoPath)}`;
  setVideoUrl(newVideoUrl);
  console.log('Playing next video:', nextVideoPath);
  videoElement.load(); // Call load() to ensure the new source is loaded
  videoElement.play().catch(error => console.error('Error trying to play video:', error));
}

function handleVideoEnded() {
  console.log('Video ended, playing next random video from playlist.');
  playRandomVideo(currentPlaylist, currentVideoPath);
}

if (videoElement) {
  videoElement.onended = handleVideoEnded;
} else {
  console.error('Video player element not found in the DOM.');
}

// Listen for playlist updates from the main process
if (globalThis.electronAPI && typeof globalThis.electronAPI.onUpdatePlaylist === 'function') {
  globalThis.electronAPI.onUpdatePlaylist((newVideoFiles: string[]) => {
    console.log('Main process updated playlist:', newVideoFiles);
    currentPlaylist = newVideoFiles;
    if (newVideoFiles && newVideoFiles.length > 0) {
      playRandomVideo(newVideoFiles, undefined); // Play a random video from the new list
    } else {
      setVideoUrl(undefined); // Clear video if new playlist is empty
      currentVideoPath = undefined;
    }
  });
} else {
  console.error('electronAPI.onUpdatePlaylist is not available.');
}

// Initial state message
if (videoElement && !videoElement.src && statusMessageElement) {
  statusMessageElement.textContent = 'Waiting for video...';
  statusMessageElement.style.display = 'block';
  videoElement.style.display = 'none';
}

console.log('Renderer script app.ts loaded.');
