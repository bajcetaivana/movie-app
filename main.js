const fetchMovies = async () => {
	try {
		const response = await fetch("http://localhost:3000/movies");
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
		const uniqueData = unique(data);
		const sortedData = sort(uniqueData);
		renderMovies(sortedData);
		navigation();
	} catch (error) {
		console.error("Error fetching movies:", error);
	}
};

const unique = (data) => {
	const setObj = new Set(data.map(JSON.stringify));
	return Array.from(setObj).map(JSON.parse);
};

const sort = (movies) => {
	return movies.sort((a, b) => {
		const imdbRatingA = a.ratings.find(
			(rating) => rating.id === "imdb"
		).rating;
		const imdbRatingB = b.ratings.find(
			(rating) => rating.id === "imdb"
		).rating;
		return imdbRatingB - imdbRatingA;
	});
};

const renderMovies = (movies) => {
	const movieListDiv = document.getElementById("movieList");
	movieListDiv.innerHTML = `<p>${movies.length}</p>`;

	const ul = document.createElement("ul");
	ul.classList.add("movies-grid");

	const baseURL = "https://image.tmdb.org/t/p/";
	const fileSize = "w500";

	movies.forEach((movie) => {
		const li = document.createElement("li");
		li.classList.add("movie-card");

		li.innerHTML = `
		<img src="${baseURL}${fileSize}${movie.poster_path}" alt="${movie.title}">
		<div class="movie-info">
		  <div class="title-wrapper">
			<h3>${movie.title}</h3>
		  </div>
		  <p class="release-date">Release Date: ${movie.release_date}</p>
		  <div class="favorite-status">
			<button>Add to Favorites</button>
		  </div>
		</div>
	  `;

		li.querySelector("button").addEventListener("click", () => {
			alert(`${movie.title} added to favorites!`);
		});

		ul.appendChild(li);
	});

	movieListDiv.appendChild(ul);
};

fetchMovies();
