const gallery=document.getElementById("gallery")
const upload=document.getElementById("upload")
const uploadBtn=document.getElementById("uploadBtn")
const dropzone=document.getElementById("dropzone")
const progress=document.getElementById("progress")
const search=document.getElementById("search")

const lightbox=document.getElementById("lightbox")
const lightboxImg=document.getElementById("lightboxImg")
const toast=document.getElementById("toast")

const username="ayaanwarsi-cmd"
const repo="img"
const folder="images"

let images=[]
let page=0
const perPage=10

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

progress.innerText="Uploading "+file.name

let reader=new FileReader()

reader.onload=async function(){

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

let data=await res.json()

addImage(data.url)

}

reader.readAsDataURL(file)

}

progress.innerText="Upload complete"

}

function addImage(url){

let div=document.createElement("div")
div.className="card"
div.draggable=true

div.innerHTML=` <img src="\${url}" loading="lazy" onerror="this.parentElement.remove()">

<div class="actions">
<button onclick="copyLink('\${url}')">Copy</button>
<button onclick="renameImage('\${url}')">Rename</button>
<button onclick="deleteImage('\${url}')">Delete</button>
</div>
\`

div.querySelector("img").onclick=()=>{
lightboxImg.src=url
lightbox.style.display="flex"
}

/* drag start */
div.addEventListener("dragstart",()=>{
div.classList.add("dragging")
})

/* drag end */
div.addEventListener("dragend",()=>{
div.classList.remove("dragging")
})

gallery.prepend(div)

}

/* drag reorder */
gallery.addEventListener("dragover",(e)=>{
e.preventDefault()

const dragging=document.querySelector(".dragging")

const afterElement=getDragAfterElement(gallery,e.clientY)

if(afterElement==null){
gallery.appendChild(dragging)
}else{
gallery.insertBefore(dragging,afterElement)
}

})

function getDragAfterElement(container,y){

const draggableElements=[...container.querySelectorAll(".card:not(.dragging)")]

return draggableElements.reduce((closest,child)=>{

const box=child.getBoundingClientRect()
const offset=y-box.top-box.height/2

if(offset<0 && offset>closest.offset){
return {offset:offset,element:child}
}else{
return closest
}

},{offset:Number.NEGATIVE_INFINITY}).element

}

/* copy link */
function copyLink(url){

navigator.clipboard.writeText(url)

toast.style.opacity=1

setTimeout(()=>{
toast.style.opacity=0
},1500)

}

/* rename image */
async function renameImage(url){

let newName=prompt("Enter new filename (with extension)")

if(!newName) return

let res=await fetch("/api/rename",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
url:url,
newName:newName
})
})

let data=await res.json()

if(data.success){
location.reload()
}else{
alert("Rename failed")
}

}

/* delete image */
async function deleteImage(url){

if(!confirm("Delete image?")) return

await fetch("/api/delete",{
method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({url})
})

location.reload()

}

/* lightbox close */
lightbox.onclick=()=>{
lightbox.style.display="none"
}

/* search */
search.addEventListener("input",()=>{

let value=search.value.toLowerCase()

document.querySelectorAll(".card").forEach(card=>{

let img=card.querySelector("img").src

card.style.display=img.toLowerCase().includes(value)
?"block":"none"

})

})

/* load images */
loadImages()

async function loadImages(){

for(let i=0;i<6;i++){
let sk=document.createElement("div")
sk.className="skeleton"
gallery.appendChild(sk)
}

let api=`https://api.github.com/repos/\${username}/\${repo}/contents/\${folder}\`

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

let url=`https://raw.githubusercontent.com/\${username}/\${repo}/main/\${folder}/\${file.name}\`

addImage(url)

})

page++

}

/* infinite scroll */
window.addEventListener("scroll",()=>{

if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){

renderNext()

}

})
