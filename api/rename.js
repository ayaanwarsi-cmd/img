export default async function handler(req,res){

const token=process.env.GITHUB_TOKEN
const username="ayaanwarsi-cmd"
const repo="img"

const {url,newName}=req.body

const path=url.split("/main/")[1]

let file=await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`)
let data=await file.json()

/* Get original file content */
let content=await fetch(data.download_url)
let buffer=await content.arrayBuffer()
let base64=Buffer.from(buffer).toString("base64")

/* Upload new file */
let newPath=path.split("/")
newPath[newPath.length-1]=newName
newPath=newPath.join("/")

await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${newPath}`,{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"rename image",
content:base64
})
})

/* Delete old file */
await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`,{
method:"DELETE",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"delete old image",
sha:data.sha
})
})

res.json({success:true})

}
