const form = document.querySelector('form');
const movieGrid = document.querySelector('.movie-grid');
const seenMovies = new Set(); // Keep track of movies we've already displayed

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = form.querySelector('input').value.trim();
    if (query) {
        seenMovies.clear(); // Clear the set when making a new search
        movieGrid.innerHTML = ''; // Clear previous results
        fetchMovies(query);
    }
});

async function fetchMovies(query) {
    try {
        const loading = showLoading();
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
        const movies = await response.json();
        hideLoading(loading);
        displayMovies(movies);
    } catch (error) {
        showError('Failed to fetch movies. Please try again.');
    }
}

function displayMovies(movies) {
    if (!movies.length) {
        showError('No movies found. Try a different search term.');
        return;
    }

    movies.forEach(movie => {
        const show = movie.show;
        // Skip if we've already displayed this movie or if it has no image
        if (seenMovies.has(show.id) || !show.image) return;
        
        seenMovies.add(show.id); // Mark this movie as displayed
        
        const movieCard = createMovieCard(show);
        movieGrid.appendChild(movieCard);
    });
}

function createMovieCard(show) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const image = document.createElement('img');
    image.src = show.image?.medium || 'placeholder-image.jpg';
    image.alt = show.name;
    image.loading = 'lazy'; // Enable lazy loading for better performance

    const info = document.createElement('div');
    info.className = 'movie-info';

    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = show.name;

    const year = document.createElement('div');
    year.className = 'movie-year';
    year.textContent = show.premiered ? new Date(show.premiered).getFullYear() : 'N/A';

    info.appendChild(title);
    info.appendChild(year);
    card.appendChild(image);
    card.appendChild(info);

    // Add click event to show more details
    card.addEventListener('click', () => {
        if (show.url) {
            window.open(show.url, '_blank');
        }
    });

    return card;
}

function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Searching for movies';
    movieGrid.appendChild(loading);
    return loading;
}

function hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    movieGrid.appendChild(error);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (error.parentNode) {
            error.parentNode.removeChild(error);
        }
    }, 5000);
}