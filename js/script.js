// Tidder ====================================================================
//
// by James Vaughan
"use strict";

// Templates =================================================================

const linkTemplate = function (postData) {
	return `
		<a href="http://reddit.com${postData.permalink}"
				class="list-group-item" target="_blank">
			<span class="badge">${postData.score}</span>
			<h4 class="list-group-item-heading">${postData.title}</h4>
			<p class="list-group-item-text">submitted to <b>/r/${postData.subreddit}</b> by <i>${postData.author}</i> ${moment.unix(postData.created_utc).fromNow()} [${postData.num_comments} comments]</p>
		</a>`;
};


// Functions =================================================================

const getURLs = function (url) {
	if (url.includes('youtube.com') || url.includes('youtu.be')) {
		let video_id = url.split('v=')[1].split('&')[0];
		let urls = [];
		let prefixes = [
			'http://www.youtube.com/watch?v=',
			'https://www.youtube.com/watch?v=',
			'http://www.youtu.be/',
			'https://www.youtu.be/'
		];
		if (url.includes('youtu.be'))
			video_id = url.split('be/')[1].split('&')[0];
		prefixes.forEach(prefix => urls.push(prefix + video_id));
		return urls;
	}
	return [url];
};

const sortPosts = function (posts, method) {
	return posts.sort((a, b) => {
		switch (method) {
			case "Score":
				a = a.data.score;
				b = b.data.score;
				break;
			case "Comments":
				a = a.data.num_comments;
				b = b.data.num_comments;
				break;
			case "Date":
				a = a.data.created_utc;
				b = b.data.created_utc;
				break;
		}
		return a < b ? 1
			: a > b ? -1
			: 0;
	});
};

var posts = [];
const showPosts = function () {
	let method = document.getElementById("sortMethod").value;
	let resultDiv = document.getElementById("results");
	resultDiv.innerHTML = "";
	sortPosts(posts, method)
		.forEach(post => resultDiv.innerHTML += linkTemplate(post.data));
};

const searchReddit = function () {
	let redditURL = "http://www.reddit.com/api/info.json?url=";
	let urlToSearch = document.getElementById("urlInput").value;
	let resultDiv = document.getElementById("results");
	let header = document.getElementById("resultHeader");
	let spinner = new Spinner();
	let promises = [];

	spinner.spin(document.getElementById("spinner"));
	posts = [];

	getURLs(urlToSearch).forEach(url => {
		promises.push(new Promise(resolve => {
			$.getJSON(redditURL + url)
				.done(result => resolve(result.data.children));
		}));
	});

	Promise.all(promises).then(results => {
		results.forEach(result => result.forEach(post => posts.push(post)));
		if (posts.length === 0) {
			resultDiv.innerHTML = `
				<div class="alert alert-info">
					That link hasn't been posted anywhere on Reddit yet!
				</div>`;
		} else {
			header.style.visibility = "visible";
			header.style.display = "flex";
			document.getElementById("numResults").innerHTML =
				posts.length + " results";
			showPosts(posts);
		}
		spinner.stop();
	});
};


// misc ======================================================================

// If the user presses [Enter], perform a search
document.getElementById("urlInput").onkeypress = e => {
	if (e.keyCode == 13) searchReddit();
};
document.getElementById("searchButton").onclick = e => searchReddit();
document.getElementById("sortMethod").onchange = e => showPosts();
