fetch('http://localhost:3000/movies')
  .then((response) => {

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {


	let uniqueData = unique(data);	
	let sortedData = sort(uniqueData);

	const movieListDiv = document.getElementById('movieList');
	const count = document.createElement('p');

	count.textContent = sortedData.length;
	movieListDiv.appendChild(count);

	const ul = document.createElement('ul');
	ul.classList.add('movies-grid');

	const baseURL = "https://image.tmdb.org/t/p/";
    const fileSize = "w500";

	sortedData.forEach((movie) => {
		const li = document.createElement('li');
		li.classList.add('movie-card');

		const img = document.createElement('img');
		img.src = `${baseURL}${fileSize}${movie.poster_path}`;
		img.alt = movie.title;
  
		const movieInfo = document.createElement('div');
		movieInfo.classList.add('movie-info');

		const titleWrapper = document.createElement('div');
		titleWrapper.classList.add('title-wrapper');

  
		const title = document.createElement('h3');
		title.textContent = movie.title;  

		const releaseDate = document.createElement('p');
		releaseDate.classList.add('release-date');
		releaseDate.textContent = `Release Date: ${movie.release_date}`;
  
		const favoriteStatus = document.createElement('div');
		favoriteStatus.classList.add('favorite-status');


//cover adding to favorites logic
//add star
//remove from favorites

		const favoriteButton = document.createElement('button');
		favoriteButton.textContent = 'Add to Favorites';
		favoriteButton.addEventListener('click', () => {
		  alert(`${movie.title} added to favorites!`);
		});

		favoriteStatus.appendChild(favoriteButton);
		titleWrapper.appendChild(title)
		movieInfo.appendChild(titleWrapper);

		movieInfo.appendChild(releaseDate);
		movieInfo.appendChild(favoriteStatus);
  
		li.appendChild(img);
		li.appendChild(movieInfo);
		
		ul.appendChild(li);
	});
	movieListDiv.appendChild(ul);
  })
  .catch((error) => {
    console.error('Error fetching movies:', error);
  });


const unique = (data) => {
	const setObj = new Set(data.map(JSON.stringify));
	return Array.from(setObj).map(JSON.parse);	
}

const sort = (movies) => {
	return movies.sort((a, b) => {
		const imdbRatingA = a.ratings.find(rating => rating.id === "imdb").rating;
		const imdbRatingB = b.ratings.find(rating => rating.id === "imdb").rating;
		return imdbRatingB - imdbRatingA;
	  });
}
