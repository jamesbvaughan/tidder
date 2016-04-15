"use strict";

const getURLs = function (url) {
	if (!url.includes('http')) {
		console.log("Hey, that's not a URL.");
		return [];
	}
	let urls = [url];
	if (url.includes('youtube.com')) {
		let video_id = '';
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
	}
	return urls;
};

const linkTemplate = function (postData) {
	console.log(postData);
	return `
	<a href="http://reddit.com${postData.permalink}" class="list-group-item" target="_blank">
		<span class="badge">${postData.score}</span>
		<h4 class="list-group-item-heading">${postData.title}</h4>
		<p class="list-group-item-text">submitted to <b>/r/${postData.subreddit}</b> by <i>${postData.author}</i> ${moment.unix(postData.created_utc).fromNow()}</p>
	</a>`;
};

const searchReddit = function () {
	let redditURL = "http://www.reddit.com/api/info.json?url=";
	let urlToSearch = document.getElementById("urlInput").value;
	document.getElementById("results").innerHTML = "";
	getURLs(urlToSearch).forEach(url => {
		$.getJSON(redditURL + url, data => {
			data.data.children.forEach(post => {
				document.getElementById("results").innerHTML += linkTemplate(post.data);
			});
		});
	});
};

$(document).ready(function () {
	$("#urlInput").keypress(e => {
		if (e.keyCode == 13)
			searchReddit();
	});
});