const gallery=document.getElementById("gallery")

document.getElementById("upload").addEventListener("change",uploadImage)

async function uploadImage(e){

let file=e.target.files[0]

if(!file) return

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
<input value="${url}" onclick="this.select()">
`

gallery.prepend(div)

}
