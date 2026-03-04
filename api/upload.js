export default async function handler(req,res){

const token=process.env.GITHUB_TOKEN
const username="ayaanwarsi-cmd"
const repo="img"
const folder="images"

const {name,data}=req.body

const filename=Date.now()+"-"+name

let url=`https://api.github.com/repos/${username}/${repo}/contents/${folder}/${filename}`

await fetch(url,{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"upload image",
content:data
})
})

let imageURL=`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${filename}`

res.json({url:imageURL})

}
