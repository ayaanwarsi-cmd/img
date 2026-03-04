export default async function handler(req,res){

const token=process.env.GITHUB_TOKEN
const username="ayaanwarsi-cmd"
const repo="img"

const {url}=req.body

const path=url.split("/main/")[1]

let file=await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`)
let data=await file.json()

await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`,{
method:"DELETE",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"delete image",
sha:data.sha
})
})

res.json({success:true})

}
