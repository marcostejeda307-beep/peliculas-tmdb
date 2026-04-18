const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearch = '';

const moviesGrid = document.getElementById('movies-grid');
const searchInput = document.getElementById('searchInput');
const autocompleteResults = document.getElementById('autocomplete-results');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageLabel = document.getElementById('currentPage');

// Función principal para obtener películas
async function fetchMovies(page = 1, query = '') {
    try {
        let url = query 
            ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}&page=${page}`
            : `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`;

        const response = await fetch(url);
        const data = await response.json();
        
        // El requerimiento pide 12 por página. TMDB devuelve 20. 
        // Vamos a mostrar solo las primeras 12 para cumplir con la consigna.
        renderMovies(data.results.slice(0, 12));
    } catch (error) {
        console.error("Error al cargar películas:", error);
    }
}

function renderMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" 
                         class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="rating-badge">★ ${movie.vote_average.toFixed(1)}</span>
                        </div>
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.overview || 'Sin descripción disponible.'}</p>
                    </div>
                </div>
            </div>
        `;
        moviesGrid.innerHTML += movieCard;
    });
}

// Búsqueda Dinámica (Autodesplegable)
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`);
        const data = await res.json();
        showAutocomplete(data.results.slice(0, 5));
    } else {
        autocompleteResults.innerHTML = '';
        if (query.length === 0) {
            currentSearch = '';
            fetchMovies(1);
        }
    }
});

function showAutocomplete(results) {
    autocompleteResults.innerHTML = '';
    results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');
        div.innerHTML = movie.title;
        div.addEventListener('click', () => {
            searchInput.value = movie.title;
            currentSearch = movie.title;
            autocompleteResults.innerHTML = '';
            currentPage = 1;
            fetchMovies(1, movie.title);
        });
        autocompleteResults.appendChild(div);
    });
}

// Paginación
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePage();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    updatePage();
});

function updatePage() {
    fetchMovies(currentPage, currentSearch);
    currentPageLabel.innerText = `Página ${currentPage}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicialización
fetchMovies();