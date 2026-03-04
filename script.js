const gallery=document.getElementById("gallery")
const uploadInput=document.getElementById("upload")
const uploadBtn=document.getElementById("uploadBtn")
const dropzone=document.getElementById("dropzone")

const username="ayaanwarsi-cmd"
const repo="img"
const folder="images"

uploadBtn.onclick=()=>uploadInput.click()

uploadInput.addEventListener("change",uploadImage)

dropzone.addEventListener("dragover",(e)=>{
e.preventDefault()
})

dropzone.addEventListener("drop",(e)=>{
e.preventDefault()
let file=e.dataTransfer.files[0]
uploadFile(file)
})

async function uploadImage(e){
let file=e.target.files[0]
uploadFile(file)
}

async function uploadFile(file){

if(!file)return

let formData=new FormData()
formData.append("file",file)

let res=await fetch("/api/upload",{
method:"POST",
body:formData
})

let data=await res.json()

addImage(data.url)
}

function addImage(url){

let div=document.createElement("div")
div.className="card"

div.innerHTML=`
<img src="${url}">
<div class="card-actions">
<button onclick="copyLink('${url}')">Copy</button>
<button onclick="deleteImage('${url}')">Delete</button>
</div>
`

gallery.prepend(div)
}

function copyLink(url){

navigator.clipboard.writeText(url)

alert("Image link copied!")

}

async function deleteImage(url){

alert("Delete will remove image from GitHub soon (API step next).")

}

loadImages()

async function loadImages(){

let api=`https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let res=await fetch(api)
let data=await res.json()

data.reverse().forEach(file=>{

let url=file.download_url

addImage(url)

})

}
