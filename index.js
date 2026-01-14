import { CLIENT_ID, BASE_URL } from "./config.js";
const playerCard = document.querySelector(".player");
const player = document.querySelector("audio");
const songName = document.querySelector(".song-name");
const artist = document.querySelector(".artist");
const songImg = document.querySelector(".song-image");
const playlistUI = document.querySelector(".ol-playlist");
const playingTime = document.querySelector(".song-start");
const songSlider = document.querySelector("#song-slider");
const volumeBar = document.querySelector(".volume");
const loadButton = document.querySelector(".load-button");
const unloadButton = document.querySelector(".unload-button");
const filters = document.querySelector(".filters");
let isSliderDragged = false;
const playlist = {
  tracks: [],
  currSongIndex: 0,
  song: {},
  showSongs: 5,
  currPage: 1,
  pages: 1,
  length: 0,
  shuffle: false,
  songHistoryIndex: [],
  currSongHistoryElement: 0,
  activeFilter: filters.value,
};

const updateSongData = () => {
  playlist.song = {
    name: playlist.tracks[playlist.currSongIndex].name,
    artist: playlist.tracks[playlist.currSongIndex].artist_name,
    image: playlist.tracks[playlist.currSongIndex].image,
    duration: playlist.tracks[playlist.currSongIndex].duration,
    audio: playlist.tracks[playlist.currSongIndex].audio,
  };
};

const loadPlaylistData = (data) => {
  playlist.tracks = data.results.map((playlist) => playlist.tracks).flat();
  playlist.length = playlist.tracks.length;
  playlist.pages = Math.ceil(playlist.length / 5);
  playlist.currSongIndex =
    playlist.shuffle === false
      ? 0
      : Math.trunc(Math.random() * playlist.length);
  playlist.currPage = Math.trunc(playlist.currSongIndex / 5) + 1;
  updateSongData();

  if (playlist.shuffle) {
    playlist.songHistoryIndex = [];
    playlist.songHistoryIndex.push(playlist.currSongIndex);
  }

  if (playlist.length <= 5 || playlist.currPage === playlist.pages)
    loadButton.classList.add("hidden");
  else loadButton.classList.remove("hidden");

  if (playlist.currPage === 1) unloadButton.classList.add("hidden");
};

const updatePlayer = () => {
  songName.innerText = playlist.song.name;
  artist.innerText = playlist.song.artist;
  songImg.src = playlist.song.image;

  player.src = `${playlist.song.audio}`;
  songSlider.max = playlist.song.duration;

  const mins = Math.trunc(playlist.song.duration / 60);
  const secs = Math.trunc(playlist.song.duration % 60);
  document.querySelector(".song-end").innerText = `${mins}:${secs
    .toString()
    .padStart(2, 0)}`;

  if (document.querySelector(".fa-play.hidden")) player.play();
};

const renderPlaylist = () => {
  playlistUI.innerHTML = "";
  for (let i = 0; i < playlist.currPage * playlist.showSongs; i++) {
    if (i > playlist.length - 1) break;
    const generateLi = `
    <li class='track ${
      i === playlist.currSongIndex ? "selected" : ""
    }' data-id=${i}>
    <img src=${playlist.tracks[i].image}></img>
    <div>
      <h5>${playlist.tracks[i].name}</h5>
      <h6>${playlist.tracks[i].artist_name}</h6>
    </div>
    </li>`;
    playlistUI.insertAdjacentHTML("beforeend", generateLi);
  }
};

const loadSongs = () => {
  if (playlist.currPage !== playlist.pages) playlist.currPage++;
  if (playlist.currPage === playlist.pages) loadButton.classList.add("hidden");
  if (playlist.currPage !== 1) unloadButton.classList.remove("hidden");

  renderPlaylist();
};

const hideSongs = () => {
  playlist.currPage--;
  if (playlist.currPage === 1) unloadButton.classList.add("hidden");
  if (playlist.currPage !== playlist.pages)
    loadButton.classList.remove("hidden");

  renderPlaylist();
};

const updateSelectedSong = (target) => {
  document
    .querySelectorAll(".track")
    .forEach((track) => track.classList.remove("selected"));
  target.classList.add("selected");
};

const nextSong = () => {
  if (playlist.shuffle)
    if (
      playlist.currSongHistoryElement ===
      playlist.songHistoryIndex.length - 1
    ) {
      let randomIndex;
      do {
        randomIndex = Math.trunc(Math.random() * playlist.length);
      } while (playlist.currSongIndex === randomIndex);
      playlist.currSongIndex = randomIndex;
      playlist.songHistoryIndex.push(playlist.currSongIndex);
      playlist.currSongHistoryElement += 1;
    } else {
      playlist.currSongHistoryElement += 1;
      playlist.currSongIndex =
        playlist.songHistoryIndex[playlist.currSongHistoryElement];
    }
  else
    playlist.currSongIndex =
      playlist.currSongIndex < playlist.length - 1
        ? playlist.currSongIndex + 1
        : 0;

  updateSongData();
  updatePlayer();

  while (playlist.currSongIndex > playlist.currPage * playlist.showSongs - 1)
    loadSongs();

  const target = document.querySelector(
    `li[data-id='${playlist.currSongIndex}']`
  );
  updateSelectedSong(target);
};

const prevSong = () => {
  if (playlist.shuffle) {
    if (playlist.currSongHistoryElement === 0) {
      let randomIndex;
      do {
        randomIndex = Math.trunc(Math.random() * playlist.length);
      } while (playlist.currSongIndex === randomIndex);
      playlist.currSongIndex = randomIndex;
      playlist.songHistoryIndex.unshift(playlist.currSongIndex);
      playlist.currSongHistoryElement = 0;
    } else {
      playlist.currSongHistoryElement -= 1;
      playlist.currSongIndex =
        playlist.songHistoryIndex[playlist.currSongHistoryElement];
    }
  } else
    playlist.currSongIndex =
      playlist.currSongIndex > 0
        ? playlist.currSongIndex - 1
        : playlist.length - 1;

  updateSongData();
  updatePlayer();

  while (playlist.currSongIndex > playlist.currPage * playlist.showSongs - 1)
    loadSongs();

  const target = document.querySelector(
    `li[data-id='${playlist.currSongIndex}']`
  );
  updateSelectedSong(target);
};

const setEvents = () => {
  playerCard.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("fa-play")) {
      target.classList.add("hidden");
      document.querySelector(".fa-pause").classList.remove("hidden");
      player.play();
    }
    if (target.classList.contains("fa-pause")) {
      target.classList.add("hidden");
      document.querySelector(".fa-play").classList.remove("hidden");
      player.pause();
    }
    if (target.classList.contains("fa-forward-step")) nextSong();
    if (target.classList.contains("fa-backward-step")) prevSong();
    if (target.classList.contains("fa-volume-high")) {
      target.classList.add("hidden");
      document.querySelector(".fa-volume-xmark").classList.remove("hidden");
      volumeBar.value = 0;
      player.muted = true;
    }
    if (target.classList.contains("fa-volume-xmark")) {
      target.classList.add("hidden");
      document.querySelector(".fa-volume-high").classList.remove("hidden");
      volumeBar.value = 50;
      player.muted = false;
    }
    if (target.classList.contains("fa-repeat")) {
      player.loop = !player.loop;
      target.classList.toggle("active-icon");
    }
    if (target.classList.contains("load-button")) loadSongs();
    if (target.classList.contains("unload-button")) hideSongs();
    if (target.classList.contains("fa-shuffle")) {
      playlist.shuffle = !playlist.shuffle;
      target.classList.toggle("active-icon");
      if (playlist.shuffle)
        playlist.songHistoryIndex.push(playlist.currSongIndex);
      else {
        playlist.songHistoryIndex = [];
        playlist.currSongHistoryElement = 0;
      }
    }

    if (target.closest(".track")) {
      playlist.currSongIndex = parseInt(target.closest(".track").dataset.id);
      updateSongData();
      updatePlayer();
      if (playlist.shuffle) {
        playlist.songHistoryIndex.splice(playlist.currSongHistoryElement + 1);
        playlist.songHistoryIndex.push(playlist.currSongIndex);
        playlist.currSongHistoryElement = playlist.songHistoryIndex.length - 1;
      }

      const track = target.closest(".track");
      updateSelectedSong(track);
    }
  });

  document.querySelectorAll(".volume-icon").forEach((icon) =>
    icon.addEventListener("mouseenter", (e) => {
      volumeBar.classList.remove("hidden");
      document.querySelector(".top-left").classList.add("volume-hover");
    })
  );

  filters.addEventListener("change", () => {
    playlist.songHistoryIndex = [];
    playlist.currSongHistoryElement = 0;
    playlist.activeFilter = filters.value;
    getData();
  });

  volumeBar.addEventListener("input", () => {
    player.volume = volumeBar.value / 100;
    if (player.volume === 0) {
      document.querySelector(".fa-volume-xmark").classList.remove("hidden");
      document.querySelector(".fa-volume-high").classList.add("hidden");
    } else {
      document.querySelector(".fa-volume-xmark").classList.add("hidden");
      document.querySelector(".fa-volume-high").classList.remove("hidden");
    }
  });

  document.querySelector(".top-left").addEventListener("mouseleave", (e) => {
    volumeBar.classList.add("hidden");
    document.querySelector(".top-left").classList.remove("volume-hover");
  });

  songSlider.addEventListener("input", (e) => {
    const mins = Math.trunc(songSlider.value / 60);
    const secs = Math.trunc(songSlider.value) % 60;
    playingTime.innerText = `${mins}:${secs.toString().padStart(2, 0)}`;
    player.currentTime = songSlider.value;
  });

  songSlider.addEventListener("mousedown", () => (isSliderDragged = true));
  songSlider.addEventListener("mouseup", () => {
    isSliderDragged = false;
    if (player.ended && player.paused) nextSong();
    if (
      document.querySelector(".fa-play").classList.contains("hidden") &&
      player.paused
    )
      player.play();
  });

  player.addEventListener("timeupdate", (e) => {
    const mins = Math.trunc(player.currentTime / 60);
    const secs = Math.trunc(player.currentTime) % 60;
    playingTime.innerText = `${mins}:${secs.toString().padStart(2, 0)}`;
    songSlider.value = Math.trunc(player.currentTime);
  });

  player.addEventListener("ended", () => {
    if (!isSliderDragged) nextSong();
  });
};

async function getData() {
  try {
    const response = await fetch(
      `${BASE_URL}?client_id=${CLIENT_ID}&name=${playlist.activeFilter}`
    );
    const data = await response.json();
    loadPlaylistData(data);
    updatePlayer();
    renderPlaylist();
  } catch (error) {
    console.error("Something went wrong");
  }
}

getData();
setEvents();
