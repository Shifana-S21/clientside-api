const searchTerm = document.querySelector('.search');
const searchForm = document.querySelector('form');
const section = document.getElementById('searchResults');
const favoritesSection = document.getElementById('favorites');

let players = {};
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

window.addEventListener('load', () => {
  onClientLoad();
  renderFavorites();
});

function onClientLoad() {
  gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
  gapi.client.setApiKey('AIzaSyDkvoUwFQkeMcq4zs-W1G-Wl2piEd46y-M');
  searchForm.addEventListener('submit', search);
}

function search(e) {
  e.preventDefault();
  const query = searchTerm.value.trim();
  if (!query) return;

  const request = gapi.client.youtube.search.list({
    part: 'snippet',
    maxResults: 10,
    q: query,
  });

  request.execute(onSearchResponse);
}

function onSearchResponse(response) {
  section.innerHTML = '';
  const results = response.items;

  results.forEach((item, i) => {
    displayVideo(item, i, section, true);
  });
}

function displayVideo(result, index, container, allowFavorite) {
  const videoId = result.id.videoId;
  const title = result.snippet.title;
  const thumb = result.snippet.thumbnails.medium.url;

  const wrapper = document.createElement('article');

  // ✅ Add thumbnail preview
  const thumbnail = document.createElement('img');
  thumbnail.src = thumb;
  thumbnail.alt = title;
  thumbnail.style.width = '200px';
  wrapper.appendChild(thumbnail);

  // ✅ Add video player (YT Player)
  const playerDiv = document.createElement('div');
  const playerId = `vid${index}_${Math.random().toString(36).substr(2, 5)}`;
  playerDiv.id = playerId;
  wrapper.appendChild(playerDiv);

  new YT.Player(playerId, {
    height: '360',
    width: '480',
    videoId,
    events: {
      onReady: (e) => {
        if (e.target.getDuration() === 0) {
          container.removeChild(wrapper);
        }
      }
    }
  });

  const info = document.createElement('p');
  info.innerHTML = `<strong>${title}</strong>`;
  wrapper.appendChild(info);

  if (allowFavorite) {
    const btn = document.createElement('button');
    btn.textContent = 'Add to Favorites';
    btn.addEventListener('click', () => {
      addToFavorites({ videoId, title, thumb });
    });
    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);
}

function addToFavorites(video) {
  if (!favorites.some(f => f.videoId === video.videoId)) {
    favorites.push(video);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
  }
}

function removeFromFavorites(videoId) {
  favorites = favorites.filter(v => v.videoId !== videoId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  favoritesSection.innerHTML = '';

  if (favorites.length === 0) {
    favoritesSection.innerHTML = '<p>No favorites saved yet.</p>';
    return;
  }

  favorites.forEach((fav, i) => {
    const wrapper = document.createElement('article');

    // ✅ Add thumbnail (stored already)
    const thumbnail = document.createElement('img');
    thumbnail.src = fav.thumb;
    thumbnail.alt = fav.title;
    thumbnail.style.width = '200px';
    wrapper.appendChild(thumbnail);

    // ✅ Add embedded video
    const iframe = document.createElement('iframe');
    iframe.width = '480';
    iframe.height = '270';
    iframe.src = `https://www.youtube.com/embed/${fav.videoId}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    wrapper.appendChild(iframe);

    const info = document.createElement('p');
    info.textContent = fav.title;
    wrapper.appendChild(info);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove from Favorites';
    removeBtn.addEventListener('click', () => {
      removeFromFavorites(fav.videoId);
    });

    wrapper.appendChild(removeBtn);
    favoritesSection.appendChild(wrapper);
  });
}
