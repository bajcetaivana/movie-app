const DISPLAY_PER_PAGE = 20;
let ALL_MOVIES = [];

const fetchMovies = async () => {
	try {
		const response = await fetch("http://localhost:3000/movies");
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
		const uniqueData = unique(data);
		const sortedData = sort(uniqueData);
		return sortedData;
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

	const ul = document.createElement("ul");
	ul.classList.add("movies-grid");

	const baseURL = "https://image.tmdb.org/t/p/";
	const fileSize = "w500";

	movies.forEach((movie) => {
		const li = document.createElement("li");
		let displayDate = "";
		displayDate = movie.release_date
			? formatDate(movie.release_date)
			: "Unknown";
		li.classList.add("movie-card");
		const favoriteButtonHTML = `
		<button class="favorite-button" data-id="${movie.id}" data-title="${
			movie.title
		}" onclick="toggleFavorite(this)">
			<svg class="favorite-heart${
				movie.favorite ? " heart-filled" : ""
			}" viewBox="0 0 24 24">
				<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
			</svg>
		</button>`;

		li.innerHTML = `
		<div class="img-container">
			<img src="${baseURL}${fileSize}${movie.poster_path}" alt="${movie.title}">
		</div>
		<div class="movie-info">
			<div class="title-wrapper">
				<h2 title="${movie.title}">${movie.title}</h2>
				<div>
					${favoriteButtonHTML}
				</div>
			</div>
			<p class="release-date"><span class="release-label">Release:</span> ${displayDate}</p>
		</div>`;

		ul.appendChild(li);
	});

	movieListDiv.appendChild(ul);
};

const renderDataByPage = async (currentPage = 0) => {
	const movieListDiv = document.getElementById("movieList");
	movieListDiv.innerHTML = "";

	if (!ALL_MOVIES) {
		ALL_MOVIES = await fetchMovies();
	}

	const startIndex = currentPage * DISPLAY_PER_PAGE;

	const endIndex = startIndex + DISPLAY_PER_PAGE;
	const displayedData = ALL_MOVIES.slice(startIndex, endIndex);

	const favoritesInStorage =
		JSON.parse(localStorage.getItem("favorites")) || [];

	displayedDataWithFavourite = displayedData.map((movie) => {
		const movieId = movie.id.toString();
		const isFavourited = favoritesInStorage.includes(movieId);
		return { ...movie, favorite: isFavourited };
	});

	renderMovies(displayedDataWithFavourite);
	renderPagination(ALL_MOVIES.length, DISPLAY_PER_PAGE, currentPage);
	navigation();
};

const renderPagination = (totalItems, itemsPerPage, currentPage) => {
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginationContainer = document.getElementById("pagination");
	paginationContainer.innerHTML = "";

	const displayRange = 2;
	const startPage = Math.max(0, currentPage - displayRange);
	const endPage = Math.min(totalPages - 1, currentPage + displayRange);

	const renderButton = (pageNumber) => {
		const button = document.createElement("button");
		button.textContent = pageNumber + 1;
		button.classList.add("pagination-button");
		if (pageNumber === currentPage) {
			button.classList.add("active");
		}
		button.addEventListener("click", () => {
			renderDataByPage(pageNumber);
		});
		paginationContainer.appendChild(button);
	};

	if (startPage > 0) {
		renderButton(0);
		if (startPage > 1) {
			const ellipsis = document.createElement("span");
			ellipsis.textContent = "...";
			paginationContainer.appendChild(ellipsis);
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		renderButton(i);
	}

	if (endPage < totalPages - 1) {
		if (endPage < totalPages - 2) {
			const ellipsis = document.createElement("span");
			ellipsis.textContent = "...";
			paginationContainer.appendChild(ellipsis);
		}
		renderButton(totalPages - 1);
	}
};

const formatDate = (dateString) => {
	const [year, month, day] = dateString.split("-").map(Number);
	const newDate = new Date(year, month - 1, day);

	const localeDateFormatter = new Intl.DateTimeFormat("sr-RS", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	return localeDateFormatter.format(newDate);
};

const createToast = (message, type) => {
	const toastContainer = document.getElementById("toast-container");

	const toastMessage = document.createElement("div");
	toastMessage.classList.add("toast-message", type);
	toastMessage.textContent = message;

	toastContainer.appendChild(toastMessage);

	setTimeout(() => {
		toastMessage.classList.add("show");
	}, 100);

	setTimeout(() => {
		toastMessage.classList.remove("show");
		setTimeout(() => {
			toastMessage.remove();
		}, 300);
	}, 2000);
};

function toggleFavorite(button) {
	const heart = button.querySelector(".favorite-heart");
	const movieTitle = button.getAttribute("data-title");
	const movieId = button.getAttribute("data-id");

	heart.classList.toggle("heart-filled");

	const isFavorite = heart.classList.contains("heart-filled");

	const favoritesInStorage =
		JSON.parse(localStorage.getItem("favorites")) || [];

	if (isFavorite) {
		favoritesInStorage.push(movieId);
	} else {
		const index = favoritesInStorage.indexOf(movieId);
		if (index !== -1) {
			favoritesInStorage.splice(index, 1);
		}
	}

	localStorage.setItem("favorites", JSON.stringify(favoritesInStorage));

	const message = heart.classList.contains("heart-filled")
		? `Movie "${movieTitle}" added to favorites!`
		: `Movie "${movieTitle}" removed from favorites!`;
	const type = heart.classList.contains("heart-filled")
		? "toast-add"
		: "toast-remove";

	createToast(message, type);
}

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
			const index = Array.from(movieCards).indexOf(focusedCard);
			if (index !== -1) {
				movieCards[selectedIndex].classList.remove("highlighted");
				selectedIndex = index;
				focusedCard.classList.add("highlighted");
			}
		}
	};

	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("focusin", handleFocusIn);

	movieCards[selectedIndex].classList.add("highlighted");
	movieCards[selectedIndex].querySelector("button").focus();
};

const fetchAndRenderData = async () => {
	ALL_MOVIES = await fetchMovies();
	renderDataByPage();
};

fetchAndRenderData();
