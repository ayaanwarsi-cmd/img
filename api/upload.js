export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"})
}

const token = process.env.GITHUB_TOKEN
const username = "ayaanwarsi-cmd"
const repo = "img"
const folder = "images"

const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body

const name = body.name
const data = body.data

const filename = Date.now()+"-"+name

const githubURL =
`https://api.github.com/repos/${username}/${repo}/contents/${folder}/${filename}`

const response = await fetch(githubURL,{
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

if(!response.ok){

const err = await response.text()

return res.status(500).json({
error:"GitHub upload failed",
details:err
})

}

const imageURL =
`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${filename}`

res.json({url:imageURL})

}
