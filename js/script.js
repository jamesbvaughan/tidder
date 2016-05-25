// Tidder ===================================================================
// by James Vaughan

// State
let posts = []

// Get document elements easier
const $ = query => document.querySelector(query)

// Takes a youtube url and returns an array of urls for that video
const handleYoutubeURL = url => [
    'http://www.youtube.com/watch?v=', 'https://www.youtube.com/watch?v=',
    'http://www.youtu.be/', 'https://www.youtu.be/'
  ].map(prefix => prefix + url
    .split(url.includes('be/') ? 'be/' : 'v=')[1].split('&')[0])

// Takes an array of posts, sorts them, and returns them as an html string
const postHTML = posts =>
  posts.sort((a, b) =>
    b.data[$("#sort").value] - a.data[$("#sort").value])
      .reduce((html, post) => html + `
        <a href="http://reddit.com${post.data.permalink}"
            class="list-group-item" target="_blank">
          <span class="badge">${post.data.score}</span>
          <h4 class="list-group-item-heading">${post.data.title}</h4>
          <p class="list-group-item-text">
            submitted to <b>/r/${post.data.subreddit}</b>
            by <i>${post.data.author}</i>
            ${moment.unix(post.data.created_utc).fromNow()}
            [${post.data.num_comments} comments]
          </p>
        </a>`, "")

// Refresh the list of posts when the sorting method changes
$("#sort").onchange = () => $("#results").innerHTML = postHTML(posts)

// Search reddit for the given url
$("#search").onsubmit = e => {
  e.preventDefault()
	const spinner = new Spinner()
  const url = $("#urlInput").value
  const urls = (url.includes('youtube.com') || url.includes('youtu.be')) ?
    handleYoutubeURL(url) : [url]

	$("#resultHeader").style.display = "none"
	$("#noLuck").style.display = "none"
	$("#results").innerHTML = ""
	spinner.spin($("#spinner"))
	posts = []

	Promise.all(urls.map(url => new Promise(resolve =>
    fetch("http://www.reddit.com/api/info.json?url=" + url)
      .then(result => result.json())
      .then(json => resolve(json.data.children)))))
    .then(results => {
      posts = results.reduce((all, one) => all.concat(one), [])
      if (posts.length) {
        $("#resultHeader").style.display = "flex"
        $("#numResults").innerHTML = posts.length
        $("#results").innerHTML = postHTML(posts)
      } else {
        $("#noLuck").style.display = "block"
      }
      spinner.stop()
    })
}
