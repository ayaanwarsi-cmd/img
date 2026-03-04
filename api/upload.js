export const config = {
api: {
bodyParser: false
}
}

export default async function handler(req,res){

const token = process.env.GITHUB_TOKEN
const username = "ayaanwarsi-cmd"
const repo = "img"
const folder = "images"

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"})
}

try{

const chunks=[]
for await (const chunk of req){
chunks.push(chunk)
}

const buffer = Buffer.concat(chunks)

const boundary = req.headers["content-type"].split("boundary=")[1]

const parts = buffer.toString().split(boundary)

const filePart = parts.find(p=>p.includes("filename="))

const fileName = filePart.match(/filename="(.+?)"/)[1]

const fileData = filePart.split("\r\n\r\n")[1].split("\r\n")[0]

const base64 = Buffer.from(fileData,"binary").toString("base64")

const filename = Date.now()+"-"+fileName

const githubURL = `https://api.github.com/repos/${username}/${repo}/contents/${folder}/${filename}`

await fetch(githubURL,{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"upload image",
content:base64
})
})

const imageURL=`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${filename}`

res.json({url:imageURL})

}catch(err){

console.error(err)
res.status(500).json({error:"Upload failed"})

}

}
