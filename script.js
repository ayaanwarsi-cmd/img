const gallery=document.getElementById("gallery")
const upload=document.getElementById("upload")
const uploadBtn=document.getElementById("uploadBtn")
const dropzone=document.getElementById("dropzone")
const progress=document.getElementById("progress")
const search=document.getElementById("search")

const username="ayaanwarsi-cmd"
const repo="img"
const folder="images"

uploadBtn.onclick=()=>upload.click()

upload.addEventListener("change",(e)=>{
handleFiles(e.target.files)
})

dropzone.addEventListener("dragover",(e)=>e.preventDefault())

dropzone.addEventListener("drop",(e)=>{
e.preventDefault()
handleFiles(e.dataTransfer.files)
})

async function handleFiles(files){

for(let file of files){

let formData=new FormData()
formData.append("file",file)

progress.innerText="Uploading "+file.name

let res=await fetch("/api/upload",{
method:"POST",
body:formData
})

let data=await res.json()

addImage(data.url)

}

progress.innerText="Upload complete"
}

function addImage(url){

let div=document.createElement("div")
div.className="card"

div.innerHTML=`
<img src="${url}">
<div class="actions">
<button onclick="copyLink('${url}')">Copy</button>
<button onclick="renameImage('${url}')">Rename</button>
<button onclick="deleteImage('${url}')">Delete</button>
</div>
`

div.querySelector("img").onclick=()=>{
openModal(url)
}

gallery.prepend(div)

}

function copyLink(url){

navigator.clipboard.writeText(url)
alert("Copied!")

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

function renameImage(url){

let newName=prompt("New filename")

if(!newName) return

alert("Rename API can be added next.")

}

function openModal(url){

const modal=document.getElementById("modal")
const img=document.getElementById("modalImg")

img.src=url
modal.style.display="flex"

modal.onclick=()=>{
modal.style.display="none"
}

}

search.addEventListener("input",()=>{

let value=search.value.toLowerCase()

document.querySelectorAll(".card").forEach(card=>{

let img=card.querySelector("img").src

card.style.display=img.toLowerCase().includes(value)
?"block":"none"

})

})

loadImages()

async function loadImages(){

let api=`https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let res=await fetch(api)
let data=await res.json()

data.reverse().forEach(file=>{
addImage(file.download_url)
})

}
