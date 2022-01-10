'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const select = (par, child) => par.querySelector(child);
const selectAll = (par, child) => par.querySelectorAll(child);

const problemLink = 'https://codeforces.com/problemset/problem';

const toolItems = $$('.tool-item');
const contents = $$('.main-content');
const problemsetContainer = $('.main-content.problemset');

let listCnt = 0;
let newList = [];
let newListSize = 0;

const hideAll = (list) => list.forEach((item) => (item.style.display = 'none'));

const getList = (problems) => {
	const nameSearch = $('#nameSearch');
	const tagSearch = $('#tagSearch');
	const ratingFrom = $('#ratingFrom');
	const ratingTo = $('#ratingTo');
	const contestSearch = $('#contestSearch');

	const nameSearchValue = nameSearch.value.trim();
	const tagSearchValue = tagSearch.value.trim();
	const ratingFromValue = Number(ratingFrom.value.trim());
	const ratingToValue = Number(ratingTo.value.trim());
	const contestSearchValue = contestSearch.value.trim();

	let problemList = Array.from(problems);

	if (nameSearchValue)
		problemList = problemList.filter((item) =>
			item.name.includes(nameSearchValue)
		);

	if (tagSearchValue)
		problemList = problemList.filter((item) =>
			item.tags.some((tag) => tagSearchValue.includes(tag))
		);

	if (ratingFromValue || ratingToValue)
		problemList = problemList.filter((item) => {
			if (ratingFromValue && ratingToValue)
				return (
					ratingFromValue <= item.rating &&
					item.rating <= ratingToValue
				);
			if (ratingFromValue) return ratingFromValue <= item.rating;
			return item.rating <= ratingToValue;
		});

	if (contestSearchValue)
		problemList = problemList.filter(
			(item) => item.contestId == contestSearchValue
		);

	return problemList;
};
const getListHTMLS = (list, from = 0, to = 0) => {
	return list
		.slice(from, to)
		.map(
			(item) => `<a
							class="content-item" target="_blank" rel=”noopener”
							href="${problemLink}/${item.contestId}/${item.index}">
							<div class="content-item__info">
								<span class="content-item__info-index">
									${item.index + ' - '}
								</span>
								<span class="content-item__info-name">
									${item.name}
								</span>
							</div>

							<div class="content-item__tags">
								${item.tags.map((item) => item).join(', ')}
							</div>
							<div class="content-item__rating">
								<span class="label">Rating:</span>
								<span class="rating"> ${item.rating}</span>
							</div>
						</a>`
		)
		.join('');
};

const loadEvent = (e) => {
	e.target.style.display = 'none';
	const problemsetAllContent = select(problemsetContainer, '.all-content');
	problemsetAllContent.innerHTML += getListHTMLS(
		newList,
		listCnt,
		listCnt + 20
	);
	listCnt += 20;
	if (listCnt < newListSize)
		problemsetAllContent.innerHTML += `<button class="load-more" onclick="loadEvent(event)">Load More</button>`;
};

toolItems.forEach((item, index) => {
	item.onclick = (e) => {
		const lastToolActive = $('.tool-container .active');
		if (lastToolActive && lastToolActive !== e.currentTarget) {
			lastToolActive.className = lastToolActive.className.replace(
				' active',
				''
			);
		}
		e.currentTarget.classList.add('active');

		hideAll(contents);
		contents[index].style.display = 'flex';
	};
});

// Problemset Handle
(async () => {
	const response = await fetch(
		'https://codeforces.com/api/problemset.problems'
	);
	const data = await response.json();
	const { problemStatistics, problems } = data.result;

	problemsetContainer.innerHTML = `<div class="header"><span>Problemset</span></div>
									<form class="search-container">
										<input placeholder="Search by name" type="text" id="nameSearch">
										<input placeholder="Search by tags, split by space" type="text" id="tagSearch">
										<div class="search-by-rating">
											<input placeholder="Rating from" type="number" id="ratingFrom">
											<input placeholder="Rating to" type="number" id="ratingTo">
										</div>
										<input placeholder="Contest ID" type="number" id="contestSearch">
										<div class="all-btn">
											<button class="submit">Search</button>
											<button class="random">Random</button>
										</div>
									</form>
									<div class="all-content"></div>`;

	const problemsetAllContent = select(problemsetContainer, '.all-content');
	problemsetAllContent.innerHTML = getListHTMLS(problems);

	const submitBtn = select(problemsetContainer, '.search-container .submit');
	submitBtn.onclick = (e) => {
		e.preventDefault();

		newList = getList(problems);
		newListSize = newList.length;
		listCnt = newListSize <= 20 ? newListSize : 20;
		problemsetAllContent.innerHTML = getListHTMLS(newList, 0, listCnt);

		if (listCnt < newListSize)
			problemsetAllContent.innerHTML += `<button class="load-more" onclick="loadEvent(event)">Load More</button>`;
	};

	const randomBtn = select(problemsetContainer, '.search-container .random');
	randomBtn.onclick = (e) => {
		e.preventDefault();
		let newList = getList(problems);
		let listSize = newList.length;
		let randNum = Math.round(Math.random() * listSize);

		let newListHTMLS = getListHTMLS([newList[randNum]], 0, 1);
		problemsetAllContent.innerHTML = newListHTMLS;
	};
})();

// User Info Handle
(() => {
	const rankColor = {
		newbie: '#ccc',
		pupil: '#7f7',
		specialist: '#7db',
		expert: '#aaf',
		'candidate master': '#f8f',
		master: '#fc8',
		'international master': '#fb5',
		grandmaster: '#f77',
		'international grandmaster': '#f33',
	};

	const userContainer = $('.main-content.user');
	userContainer.innerHTML = `<div class="header"><span>User Info</span></div>
								<input placeholder="Search user by handle, split by ';'" type="text" id="handleSearch">
								<div class="all-content"></div>`;

	const allUserContent = select(userContainer, '.all-content');
	const renderUserInfo = (data) => {
		allUserContent.innerHTML = '';
		data.forEach(
			(user) =>
				(allUserContent.innerHTML += `
					<a
						class="user-item" target="_blank" rel=”noopener”
						href="https://codeforces.com/profile/${user.handle}"
						>
						<div class="left">
							<figure>
								<figcaption>
									<div class="rating-status">
										<span
											style="color: ${rankColor[user.maxRank]}"
											class="rank">${user.maxRank + ', '}
										</span>
										<span
											style="color: ${rankColor[user.maxRank]}"
											class="rating">${user.maxRating}
										</span>
									</div>
								</figcaption>
								<img src="${user.titlePhoto}" alt="${user.handle}">
							</figure>
						</div>
						<div class="right">
							<div class="rating-status">
								<span
									style="color: ${rankColor[user.rank]}"
									class="rank">
									${user.rank + ', '}
								</span>
								<span
									style="color: ${rankColor[user.rank]}"
									class="rating">${user.rating}
								</span>
							</div>
							${
								user.email
									? `
										<div class="email">
											<span>Email: </span>${user.email}
										</div>`
									: ''
							}
							<div class="friends">Friend of <b>${user.friendOfCount}</b> users</div>
						</div>
					</a>`)
		);
	};

	const handleSearch = $('#handleSearch');
	handleSearch.onkeydown = (e) => {
		if (e.keyCode !== 13) return;

		(async () => {
			const value = handleSearch.value.trim();
			const response = await fetch(
				`https://codeforces.com/api/user.info?handles=${value}`
			);
			const data = await response.json();
			renderUserInfo(data.result);
		})();
	};
})();

// User Rating Handle
(() => {
	const userRating = $('.main-content.rating');
	userRating.innerHTML = `<div class="header"><span>User Rating</span></div>
							<input placeholder="Show user's rating by handle" type="text" id="ratingHandleSearch">
							<div class="all-content"></div>`;

	const ratingContent = select(userRating, '.all-content');
	const renderUserInfo = (data) => {
		ratingContent.innerHTML = '';
		data.forEach(
			(contest) =>
				(ratingContent.innerHTML += `
					<div class="contest-item">
						<span class="contestId">#${contest.contestId}</span>
						<span class="contestName">${contest.contestName}</span>
						<span class="rank">No.${contest.rank}</span>
						<span class="ratingChange">${contest.oldRating} ${
					contest.oldRating < contest.newRating
						? `<i class="bi bi-arrow-up-right"></i>`
						: `<i class="bi bi-arrow-down-right"></i>`
				} ${contest.newRating}</span>
					</div>`)
		);
	};

	const ratingHandleSearch = $('#ratingHandleSearch');
	ratingHandleSearch.onkeydown = (e) => {
		if (e.keyCode !== 13) return;

		(async () => {
			const value = ratingHandleSearch.value.trim();
			const response = await fetch(
				`https://codeforces.com/api/user.rating?handle=${value}`
			);
			const data = await response.json();
			renderUserInfo(data.result);
		})();
	};
})();

// User Status Handle
(() => {
	const hello = '';
})();

// Menu Toggle Handle
(() => {
	const toolContainer = $('.tool-container');
	const toolMenu = $('.tool-btn');
	toolMenu.onclick = () => toolContainer.classList.toggle('active');
})();
