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

let reader=new FileReader()

progress.innerText="Uploading "+file.name

reader.onload=async function(){

try{

let base64=reader.result.split(",")[1]

let res=await fetch("/api/upload",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:file.name,
data:base64
})
})

if(!res.ok){
throw new Error("Upload failed")
}

let data=await res.json()

addImage(data.url)

}catch(err){

console.error(err)
alert("Upload failed")

}

}

reader.readAsDataURL(file)

}

progress.innerText="Upload complete"

}

function addImage(url){

let div=document.createElement("div")
div.className="card"

div.innerHTML=`
<img src="${url}" loading="lazy">
<div class="actions">
<button onclick="copyLink('${url}')">Copy</button>
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
alert("Copied")

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

try{

let api=`https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let res=await fetch(api)

if(!res.ok) return

let data=await res.json()

if(!Array.isArray(data)) return

gallery.innerHTML=""

data.reverse().forEach(file=>{

let url=`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${file.name}`

addImage(url)

})

}catch(err){

console.error("Gallery load failed",err)

}

}
