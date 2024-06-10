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

const renderMovies = (movies) => {
	const movieListDiv = document.getElementById("movieList");
	movieListDiv.innerHTML = `<p>${movies.length}</p>`;

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

		li.innerHTML = `
		<img src="${baseURL}${fileSize}${movie.poster_path}" alt="${movie.title}">
		<div class="movie-info">
			<div class="title-wrapper">
				<h2 title="${movie.title}">${movie.title}</h2>
				<div>
					<button onclick="toggleFavorite(this)">
						<svg class="favorite-heart" viewBox="0 0 24 24">
							<path
								d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
							/>
						</svg>
					</button>
				</div>
			</div>
			<p class="release-date">Release Date: ${displayDate}</p>
		</div>`;

		li.querySelector("button").addEventListener("click", () => {
			alert(`${movie.title} added to favorites!`);
		});

		ul.appendChild(li);
	});

	movieListDiv.appendChild(ul);
};

function toggleFavorite(button) {
	const heart = button.querySelector(".favorite-heart");
	heart.classList.toggle("heart-filled");
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
