"use strict";

const handleYoutubeURL = function (url) {
	let video_id = '';
	let urls = [url];
	let prefixes = [
		'http://www.youtube.com/watch?v=',
		'https://www.youtube.com/watch?v=',
		'http://www.youtu.be/',
		'https://www.youtu.be/'
	];
	if (url.includes('v=')) {
		video_id = url.split('v=')[1];
		let ampersandPosition = video_id.indexOf('&');
		if (ampersandPosition != -1) {
			video_id = video_id.substring(0, ampersandPosition);
		}
		if (video_id !== "") {
			for (let prefix of prefixes)
				if (prefix + video_id != url)
					urls.push(prefix + video_id);
		}
	}
	return urls;
};

const handleYoutubeShortURL = function (url) {
	let video_id = '';
	let urls = [url];
	let prefixes = [
		'http://www.youtube.com/watch?v=',
		'https://www.youtube.com/watch?v=',
		'http://www.youtu.be/',
		'https://www.youtu.be/'
	];
	if (url.length > 24) {
		video_id = url.split('be/')[1];
		let ampersandPosition = video_id.indexOf('&');
		if (ampersandPosition != -1) {
			video_id = video_id.substring(0, ampersandPosition);
		}
		if (video_id !== "") {
			for (let prefix of prefixes)
				if (prefix + video_id != url)
					urls.push(prefix + video_id);
		}
	}
	return urls;
};

const getURLs = function (url) {
	if (!url.includes('http')) {
		console.log("Hey, that's not a URL.");
		return [];
	}
	let urls = [url];
	if (url.includes('youtube.com')) {
		urls = handleYoutubeURL(url);
	} else if (url.includes('youtu.be')) {
		urls = handleYoutubeShortURL(url);
	}
	return urls;
};

const linkTemplate = function (postData) {
	return `
	<a href="http://reddit.com${postData.permalink}" class="list-group-item" target="_blank">
		<span class="badge">${postData.score}</span>
		<h4 class="list-group-item-heading">${postData.title}</h4>
		<p class="list-group-item-text">submitted to <b>/r/${postData.subreddit}</b> by <i>${postData.author}</i> ${moment.unix(postData.created_utc).fromNow()} [${postData.num_comments} comments]</p>
	</a>`;
};

const spinDiv = document.getElementById("spinner");
const spinner = new Spinner().spin(spinDiv);

const searchReddit = function () {
	let redditURL = "http://www.reddit.com/api/info.json?url=";
	let urlToSearch = document.getElementById("urlInput").value;
	let resultDiv = document.getElementById("results");

	spinDiv.style.display = "block";
	resultDiv.innerHTML = "";

	getURLs(urlToSearch).forEach(url => {
		$.getJSON(redditURL + url, data => {
			data.data.children.forEach(post => {
				resultDiv.innerHTML += linkTemplate(post.data);
			});
		});
	});
	setTimeout(() => {
		spinDiv.style.display = "none";
		if (resultDiv.innerHTML === "") {
			resultDiv.innerHTML = `<div class="alert alert-info">It looks like that link hasn't been posted anywhere on Reddit yet.</div>`;
		}
	}, 3000);
};

$(document).ready(function () {
	spinDiv.style.display = "none";
	spinner.spin(spinDiv);
	$("#urlInput").keypress(e => {
		if (e.keyCode == 13)
			searchReddit();
	});
});
