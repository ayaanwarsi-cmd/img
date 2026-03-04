export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"})
}

const token=process.env.GITHUB_TOKEN
const username="ayaanwarsi-cmd"
const repo="img"
const folder="images"

let buffers=[]
for await (const chunk of req){
buffers.push(chunk)
}

let fileBuffer=Buffer.concat(buffers)

let fileName=Date.now()+".png"

let content=fileBuffer.toString("base64")

let url=`https://api.github.com/repos/${username}/${repo}/contents/${folder}/${fileName}`

await fetch(url,{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"upload image",
content:content
})
})

let imageUrl=`https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${fileName}`

res.status(200).json({url:imageUrl})

}
