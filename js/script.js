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
const postHTML = posts => posts
  .sort((a, b) => b[$("#sort").value] - a[$("#sort").value])
  .map(({permalink, score, title, subreddit,
      author, created_utc, num_comments}) => `
    <a href="http://reddit.com${permalink}" class="list-group-item">
      <span class="badge">${score}</span>
      <h4 class="list-group-item-heading">${title}</h4>
      <p class="list-group-item-text">
        submitted to <b>/r/${subreddit}</b> by <i>${author}</i>
        ${moment.unix(created_utc).fromNow()} [${num_comments} comments]
      </p>
    </a>`)
  .join('')

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

  const redditURL = "http://www.reddit.com/api/info.json?url="
  const results = urls.map(u => fetch(redditURL + u).then(x => x.json()))
  Promise.all(results).then(json => {
    posts = json.reduce((all, one) => all.concat(one.data.children), [])
    if (posts.length) {
      $("#resultHeader").style.display = "flex"
      $("#numResults").innerHTML = posts.length
      $("#results").innerHTML = postHTML(posts.map(x => x.data))
    } else {
      $("#noLuck").style.display = "block"
    }
    spinner.stop()
  })
}
