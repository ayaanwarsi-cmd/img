const username = "YOUR_GITHUB_USERNAME"
const repo = "YOUR_REPO_NAME"
const folder = "images"
const token = "YOUR_GITHUB_TOKEN"

const gallery = document.getElementById("gallery")

async function loadImages(){

gallery.innerHTML="Loading..."

let url=`https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let res = await fetch(url)
let data = await res.json()

gallery.innerHTML=""

data.forEach(file=>{

if(file.type==="file"){

let div=document.createElement("div")
div.className="image-card"

div.innerHTML=`
<img src="${file.download_url}">
<p>${file.name}</p>
<button onclick="renameImage('${file.path}')">Rename</button>
`

gallery.appendChild(div)

}

})

}

loadImages()
