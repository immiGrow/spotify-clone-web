console.log("Initializing Spotify Clone Frontend...");

let currentSong = new Audio();
let songs = [];
let current_folder = "";
let isPlaying = false;

const playBtn = document.getElementById("play");
const currentSongNameEl = document.getElementById("current-song-name");
const artistNameEl = document.getElementById("artist-name");

const BASE_URL = "./songs"; // Relative path on Netlify

function formatTime(seconds) {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getPlaylists() {
  const res = await fetch(`${BASE_URL}/playlists.txt`);
  const text = await res.text();
  return text.split(",").map(p => p.trim()).filter(Boolean);
}

async function getSongsFromPlaylist(folder) {
  current_folder = folder;
  const res = await fetch(`${BASE_URL}/${folder}/songs.txt`);
  const text = await res.text();
  const songNames = text.split(",").map(name => name.trim()).filter(Boolean);
  return songNames;
}

function resolveSongURL(folder, baseName) {
  return `${BASE_URL}/${folder}/${baseName}.mp3`;
}

async function playMusic(trackBaseName) {
  if (!trackBaseName) return;
  const url = resolveSongURL(current_folder, trackBaseName);

  currentSong.src = url;
  await currentSong.play();
  isPlaying = true;

  playBtn.src = "svg/pause.svg";
  currentSongNameEl.innerText = trackBaseName;
  artistNameEl.innerText = "Unknown Artist"; // You can improve this with metadata if available
}

function populateSongs(songNames) {
  const songsList = document.querySelector(".songs-list");
  songsList.innerHTML = "";

  songNames.forEach(song => {
    const div = document.createElement("div");
    div.className = "song-item";
    div.innerHTML = `
      <img class="invert" src="svg/music.svg" alt="music">
      <div class="song-name">${song}</div>
      <div class="play-icon">
        <div class="play-button">
          <img src="svg/play-button.svg" alt="Play-button">
        </div>
      </div>`;
    div.addEventListener("click", () => {
      playMusic(song);
    });
    songsList.appendChild(div);
  });
}

async function displayAlbums() {
  const playlists = await getPlaylists();

  const container = document.querySelector(".spotify-playlists");
  container.innerHTML = "";

  for (let playlist of playlists) {
    try {
      const res = await fetch(`${BASE_URL}/${playlist}/info.json`);
      const info = await res.json();
      const div = document.createElement("div");
      div.className = "playlist-card";
      div.innerHTML = `
        <div class="playlist-items">
          <div class="playlist-img">
            <img class="playlist-card-img" src="${BASE_URL}/${playlist}/cover.jpg" alt="${info.title}">
            <img class="spotify-card-logo invert" src="spotify-icon.svg" alt="Spotify">
            <div class="play-button spotify-play-button play-btn">
              <img src="svg/play-button.svg" alt="Play-button">
            </div>
          </div>
          <div class="playlist-lines">
            <h2 class="playlist-headline">${info.title}</h2>
            <h3>${info.description}</h3>
          </div>
        </div>`;
      div.addEventListener("click", async () => {
        songs = await getSongsFromPlaylist(playlist);
        populateSongs(songs);
        if (songs.length > 0) {
          playMusic(songs[0]);
        }
        // Show left section on small screens (optional UI)
        document.querySelector(".left-section").style.transform = "translateX(0)";
        document.querySelector(".left-section").style.zIndex = 10;
      });

      container.appendChild(div);
    } catch (e) {
      console.warn(`Skipping ${playlist}, missing info.json or cover.jpg`);
    }
  }
}

function attachEventListeners() {
  playBtn.addEventListener("click", () => {
    if (!currentSong.src) return;
    if (currentSong.paused) {
      currentSong.play();
      playBtn.src = "svg/pause.svg";
      isPlaying = true;
    } else {
      currentSong.pause();
      playBtn.src = "svg/play-button.svg";
      isPlaying = false;
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    if (!currentSong.duration) return;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentSong.currentTime = percent * currentSong.duration;
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".current-song-time").innerText = formatTime(currentSong.currentTime);
    document.querySelector(".current-song-duration").innerText = formatTime(currentSong.duration);

    if (currentSong.duration) {
      document.querySelector(".seekbar-circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
  });

  currentSong.addEventListener("ended", () => {
    const currentSongName = currentSongNameEl.innerText;
    const idx = songs.indexOf(currentSongName);
    if (idx >= 0 && idx + 1 < songs.length) {
      playMusic(songs[idx + 1]);
    } else {
      playBtn.src = "svg/play-button.svg";
      isPlaying = false;
    }
  });

  document.getElementById("previous").addEventListener("click", () => {
    const currentSongName = currentSongNameEl.innerText;
    const idx = songs.indexOf(currentSongName);
    if (idx > 0) playMusic(songs[idx - 1]);
  });

  document.getElementById("next").addEventListener("click", () => {
    const currentSongName = currentSongNameEl.innerText;
    const idx = songs.indexOf(currentSongName);
    if (idx >= 0 && idx + 1 < songs.length) playMusic(songs[idx + 1]);
  });

  document.getElementById("volume-min").addEventListener("click", () => {
    currentSong.volume = 0;
    document.getElementById("song-volume").value = 0;
  });

  document.getElementById("volume-max").addEventListener("click", () => {
    currentSong.volume = 1;
    document.getElementById("song-volume").value = 100;
  });

  document.getElementById("song-volume").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".hamburger-menu").addEventListener("click", () => {
    document.querySelector(".left-section").style.transform = "translateX(0)";
    document.querySelector(".left-section").style.zIndex = 10;
  });

  document.querySelector(".close-icon").addEventListener("click", () => {
    document.querySelector(".left-section").style.transform = "translateX(-101%)";
  });
}

async function main() {
  attachEventListeners();
  await displayAlbums();

  const playlists = await getPlaylists();
  if (playlists.length === 0) return;

  songs = await getSongsFromPlaylist(playlists[0]);
  populateSongs(songs);
  await playMusic(songs[0]);
}

main();
