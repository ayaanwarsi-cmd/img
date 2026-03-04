const gallery = document.getElementById("gallery")
const upload = document.getElementById("upload")
const uploadBtn = document.getElementById("uploadBtn")
const dropzone = document.getElementById("dropzone")
const progress = document.getElementById("progress")
const search = document.getElementById("search")

const lightbox = document.getElementById("lightbox")
const lightboxImg = document.getElementById("lightboxImg")
const toast = document.getElementById("toast")

const username = "ayaanwarsi-cmd"
const repo = "img"
const folder = "images"

let images = []
let page = 0
const perPage = 10

uploadBtn.onclick = () => upload.click()

upload.addEventListener("change",(e)=>{
handleFiles(e.target.files)
})

dropzone.addEventListener("dragover",(e)=>e.preventDefault())

dropzone.addEventListener("drop",(e)=>{
e.preventDefault()
handleFiles(e.dataTransfer.files)
})

/* CTRL+V screenshot paste */
document.addEventListener("paste", async (event)=>{

const items = event.clipboardData.items

for(let item of items){

if(item.type.indexOf("image") !== -1){

let file = item.getAsFile()

handleFiles([file])

}

}

})

async function handleFiles(files){

for(let file of files){

progress.innerText = "Processing " + file.name

try{

let compressedBlob = await compressImage(file)

progress.innerText = "Uploading..."

let formData = new FormData()
formData.append("file", compressedBlob, "image.jpg")

let res = await fetch("/api/upload",{
method:"POST",
body:formData
})

let data = await res.json()

if(data.url){
addImage(data.url)
}else{
alert("Upload failed")
}

}catch(err){
console.error(err)
alert("Upload failed")
}

}

progress.innerText = "Upload complete"

}

/* AUTO COMPRESS + CONVERT */
function compressImage(file){

return new Promise((resolve)=>{

let img = new Image()
let reader = new FileReader()

reader.onload = e=>{
img.src = e.target.result
}

reader.readAsDataURL(file)

img.onload = ()=>{

let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d")

let maxWidth = 1600

let scale = Math.min(1, maxWidth / img.width)

canvas.width = img.width * scale
canvas.height = img.height * scale

ctx.drawImage(img,0,0,canvas.width,canvas.height)

canvas.toBlob(
blob => resolve(blob),
"image/jpeg",
0.7
)

}

})

}

function addImage(url){

let div=document.createElement("div")
div.className="card"

div.innerHTML=` <img src="${url}" loading="lazy">

<div class="actions">
<button onclick="copyLink('${url}')">Copy</button>
<button onclick="deleteImage('${url}')">Delete</button>
</div>
`

div.querySelector("img").onclick=()=>{
lightboxImg.src=url
lightbox.style.display="flex"
}

gallery.prepend(div)

}

function copyLink(url){

navigator.clipboard.writeText(url)

toast.style.opacity=1

setTimeout(()=>{
toast.style.opacity=0
},1500)

}

async function deleteImage(url){

if(!confirm("Delete image?")) return

await fetch("/api/delete",{
method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({url})
})

location.reload()

}

lightbox.onclick=()=>{
lightbox.style.display="none"
}

/* SEARCH */
search.addEventListener("input",()=>{

let value=search.value.toLowerCase()

document.querySelectorAll(".card").forEach(card=>{

let img=card.querySelector("img").src

card.style.display=img.toLowerCase().includes(value)
?"block":"none"

})

})

/* LOAD IMAGES */
loadImages()

async function loadImages(){

gallery.innerHTML="Loading..."

let api=`https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let res=await fetch(api)
let data=await res.json()

gallery.innerHTML=""

images=data.reverse()

renderNext()

}

function renderNext(){

let start=page*perPage
let end=start+perPage

let slice=images.slice(start,end)

slice.forEach(file=>{

let url=`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${file.name}`

addImage(url)

})

page++

}

window.addEventListener("scroll",()=>{

if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){

renderNext()

}

})
