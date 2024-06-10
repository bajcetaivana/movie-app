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

const getItemsInFirstRow = (container) => {
	const items = container.children;
	if (items.length === 0) return 0;

	let itemsInRow = 0;
	const rowTopOffset = items[0].offsetTop;

	for (let i = 0; i < items.length; i++) {
		if (items[i].offsetTop === rowTopOffset) {
			itemsInRow++;
		} else {
			break;
		}
	}

	return itemsInRow;
};

const navigation = () => {
	const movieCards = document.querySelectorAll(".movie-card");
	const container = document.querySelector(".movies-grid");
	const itemsInRow = getItemsInFirstRow(container);
	const rowCount = Math.ceil(movieCards.length / itemsInRow);

	let selectedIndex = 0;

	movieCards[selectedIndex].classList.add("highlighted");
	movieCards[selectedIndex].querySelector("button").focus();

	const handleKeyDown = (event) => {
		const buttons = movieCards[selectedIndex].querySelectorAll("button");
		buttons[0].blur();
		movieCards[selectedIndex].classList.remove("highlighted");

		const currentRow = Math.floor(selectedIndex / itemsInRow);
		const currentCol = selectedIndex % itemsInRow;

		switch (event.key) {
			case "ArrowDown":
				if (
					currentRow < rowCount - 1 &&
					selectedIndex + itemsInRow < movieCards.length
				) {
					selectedIndex += itemsInRow;
				}
				break;
			case "ArrowUp":
				if (currentRow > 0) {
					selectedIndex -= itemsInRow;
				}
				break;
			case "ArrowLeft":
				if (selectedIndex > 0) {
					selectedIndex--;
				} else {
					selectedIndex = movieCards.length - 1;
				}
				break;
			case "ArrowRight":
				if (
					currentCol < itemsInRow - 1 &&
					selectedIndex + 1 < movieCards.length
				) {
					selectedIndex++;
				} else if (currentRow < rowCount - 1) {
					selectedIndex += itemsInRow - currentCol;
				}
				break;
		}

		movieCards[selectedIndex].classList.add("highlighted");
		const newButtons = movieCards[selectedIndex].querySelectorAll("button");
		newButtons[0].focus();
	};

	const handleFocusIn = (event) => {
		const focusedCard = event.target.closest(".movie-card");
		if (focusedCard) {
			movieCards[selectedIndex].classList.remove("highlighted");
			selectedIndex = Array.from(movieCards).indexOf(focusedCard);
			movieCards[selectedIndex].classList.add("highlighted");
		}
	};

	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("focusin", handleFocusIn);
};

fetchMovies();
