// public/js/script.js

let currentPage = 1;
let currentSearch = '';
let totalResults = 0;

// Get modal elements
const welcomeModalOverlay = document.getElementById('welcomeModalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalCloseX = document.querySelector('#welcomeModal .modal-close-button');

// No need to get mainTitle element here as we are using inline onclick

// Function to show the modal (as before)
function showWelcomeModal() {
    welcomeModalOverlay.classList.add('show');
}

// Function to hide the modal (as before)
function hideWelcomeModal() {
    welcomeModalOverlay.classList.remove('show');
    sessionStorage.setItem('welcomeModalShown', 'true');
}

// Function to clear and reset the page (as before, but now global/accessible)
function clearAndResetPage() {
    document.getElementById("searchInput").value = ''; // Clear search input
    document.getElementById("movieResultsContainer").innerHTML = ''; // Clear results area
    document.getElementById("paginationControls").innerHTML = ''; // Clear pagination
    currentPage = 1; // Reset current page
    currentSearch = ''; // Reset current search term
    totalResults = 0; // Reset total results
    document.getElementById("movieResultsContainer").innerHTML = '<p class="no-results">Start by searching for a movie title!</p>';
}

// NEW: Global function to be called by inline onclick on the H1
// This function must be defined globally (not inside an IIFE or strictly scoped)
// for the inline 'onclick' attribute to find it.
window.resetPageFromHeader = function() {
    clearAndResetPage();
};


// Event Listeners for search and history (existing)
document.getElementById("searchButton").addEventListener("click", () => {
    currentPage = 1;
    currentSearch = document.getElementById("searchInput").value;
    searchMovies();
});

document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        currentPage = 1;
        currentSearch = document.getElementById("searchInput").value;
        searchMovies();
    }
});

function changePage(page) {
    currentPage = page;
    searchMovies();
}

document.getElementById("historyButton").addEventListener("click", showHistory);

// Show the welcome modal when the page loads, but only if it hasn't been shown in this session
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('welcomeModalShown')) {
        showWelcomeModal();
    }
    // Also clear and reset the page initially (or add a default message)
    clearAndResetPage(); // Call this when the page first loads
});

// Add event listeners to close the modal (existing)
closeModalBtn.addEventListener('click', hideWelcomeModal);
modalCloseX.addEventListener('click', hideWelcomeModal);
welcomeModalOverlay.addEventListener('click', (event) => {
    if (event.target === welcomeModalOverlay) {
        hideWelcomeModal();
    }
});
async function searchMovies() {
    try {
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = '<div class="loading">Loading...</div>';

        // **CRITICAL CHANGE: Add /api prefix**
        const response = await fetch(`/api/movies/search?search=${encodeURIComponent(currentSearch)}&page=${currentPage}`);

        if (!response.ok) { // Check for HTTP errors
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch movies from server');
        }

        const data = await response.json();

        if (data.Response === "True") {
            totalResults = parseInt(data.totalResults);
            const movies = data.Search;

            movieContainer.innerHTML = `
                <div class="movie-grid">
                    ${movies.map(movie => `
                        <div class="movie-card" onclick="getMovieDetails('${movie.imdbID}')">
                            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}"
                                 alt="${movie.Title}"
                                 onerror="this.src='placeholder.jpg'">
                            <h3>${movie.Title}</h3>
                            <p>${movie.Year}</p>
                        </div>
                    `).join('')}
                </div>
            `;

            updatePagination();
        } else {
            movieContainer.innerHTML = `<p class="no-results">${data.Error || 'No movies found'}</p>`;
        }
    } catch (error) {
        console.error('Search error:', error);
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = `<p class="error">Error fetching movies: ${error.message}</p>`;
    }
}

function updatePagination() {
    const totalPages = Math.ceil(totalResults / 10);
    const pagination = document.getElementById("paginationControls"); // Updated ID

    let paginationHTML = '';

    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }

    // Adjust the loop to show more or fewer page numbers as desired
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}"
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

async function showHistory() {
    try {
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = '<div class="loading">Loading...</div>';
        document.getElementById("paginationControls").innerHTML = ''; // Hide pagination

        // **CRITICAL CHANGE: Add /api prefix**
        const response = await fetch('/api/movies/history/all');

        if (!response.ok) { // Check for HTTP errors
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch history from server');
        }

        const historyData = await response.json();

        if (historyData.length > 0) {
            movieContainer.innerHTML = `
                <h2>Recently Viewed Movies</h2>
                <div class="movie-grid">
                    ${historyData.map(movie => `
                        <div class="movie-card" onclick="getMovieDetails('${movie.imdbID}')">
                            <img src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}"
                                 alt="${movie.Title}"
                                 onerror="this.src='placeholder.jpg'">
                            <h3>${movie.Title}</h3>
                            <p>${movie.Year || 'N/A'}</p>
                            <p class="viewed-date">Viewed: ${new Date(movie.viewedAt).toLocaleDateString()}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            movieContainer.innerHTML = '<p class="no-results">No viewing history found</p>';
        }

    } catch (error) {
        console.error('History fetch error:', error);
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = `<p class="error">Error fetching history: ${error.message}</p>`;
    }
}

async function getMovieDetails(imdbID) {
    try {
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = '<div class="loading">Loading...</div>';
        document.getElementById("paginationControls").innerHTML = ''; // Hide pagination

        // **CRITICAL CHANGE: Add /api prefix**
        const response = await fetch(`/api/movies/${imdbID}`);

        if (!response.ok) { // Check for HTTP errors
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch movie details from server');
        }

        const movie = await response.json();

        // **CRITICAL CHANGE: Add saveToHistory call**
        // Send movie data to your backend to save to history
        // Only send necessary fields for history (imdbID, Title, Year, Poster)
        await fetch('/api/movies/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imdbID: movie.imdbID,
                Title: movie.Title,
                Year: movie.Year,
                Poster: movie.Poster
            }),
        });
        console.log(`Movie ${movie.Title} (${movie.imdbID}) added to history.`);


        movieContainer.innerHTML = `
            <div class="movie-detail-view">
                <div class="movie-poster">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}"
                         alt="${movie.Title}"
                         onerror="this.src='placeholder.jpg'">
                </div>
                <div class="movie-info">
                    <h2>${movie.Title}</h2>
                    <div class="movie-meta">
                        <span class="year">${movie.Year}</span>
                        <span class="rated">${movie.Rated}</span>
                        <span class="runtime">${movie.Runtime}</span>
                    </div>
                    <div class="genre-list">${movie.Genre}</div>
                    <div class="ratings-container">
                        <div class="rating">
                            <span class="rating-label">IMDb</span>
                            <span class="rating-value">${movie.imdbRating}/10</span>
                        </div>
                        <div class="rating">
                            <span class="rating-label">Metascore</span>
                            <span class="rating-value">${movie.Metascore !== 'N/A' ? movie.Metascore : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="plot-section">
                        <h3>Plot</h3>
                        <p>${movie.Plot}</p>
                    </div>
                    <div class="details-section">
                        <p><strong>Released:</strong> ${movie.Released}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Writers:</strong> ${movie.Writer}</p>
                        <p><strong>Cast:</strong> ${movie.Actors}</p>
                        <p><strong>Language:</strong> ${movie.Language}</p>
                        <p><strong>Country:</strong> ${movie.Country}</p>
                        <p><strong>Awards:</strong> ${movie.Awards}</p>
                        <p><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</p>
                    </div>
                    <button class="back-button" onclick="searchMovies()">Back to Search</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error in getMovieDetails:', error);
        const movieContainer = document.getElementById("movieResultsContainer"); // Updated ID
        movieContainer.innerHTML = `<p class="error">Error fetching movie details: ${error.message}</p>`;
    }
}