export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {

  const token = process.env.GITHUB_TOKEN
  const username = "ayaanwarsi-cmd"
  const repo = "img"
  const folder = "images"

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    // Collect raw binary chunks
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // BUG FIX #1 & #2: Parse boundary correctly and work on raw Buffer (not string)
    // The Content-Type boundary does NOT have "--" prefix, but body boundaries DO
    const contentType = req.headers["content-type"]
    const boundaryMatch = contentType.match(/boundary=(.+)/)
    if (!boundaryMatch) return res.status(400).json({ error: "No boundary found" })

    const boundary = "--" + boundaryMatch[1].trim()
    const boundaryBuf = Buffer.from("\r\n" + boundary)

    // Split buffer by boundary
    const fullBuf = Buffer.concat([Buffer.from("\r\n"), buffer])
    const parts = splitBuffer(fullBuf, boundaryBuf)

    let fileBuffer = null
    let fileName = "image.jpg"

    for (const part of parts) {
      // Each part: headers\r\n\r\nbody
      const separatorIndex = part.indexOf("\r\n\r\n")
      if (separatorIndex === -1) continue

      const headerStr = part.slice(0, separatorIndex).toString()
      const body = part.slice(separatorIndex + 4)

      if (headerStr.includes("filename=")) {
        const nameMatch = headerStr.match(/filename="(.+?)"/)
        if (nameMatch) fileName = nameMatch[1]
        fileBuffer = body
        break
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: "No file found in upload" })
    }

    // BUG FIX #3: Convert raw buffer bytes directly to base64 (no string corruption)
    const base64 = fileBuffer.toString("base64")

    const uniqueFilename = Date.now() + "-" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "")

    const githubURL = `https://api.github.com/repos/${username}/${repo}/contents/${folder}/${uniqueFilename}`

    const githubRes = await fetch(githubURL, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "upload image",
        content: base64
      })
    })

    if (!githubRes.ok) {
      const err = await githubRes.json()
      console.error("GitHub error:", err)
      return res.status(500).json({ error: "GitHub upload failed", detail: err.message })
    }

    const imageURL = `https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${uniqueFilename}`

    res.json({ url: imageURL })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Upload failed", detail: err.message })
  }

}

// Helper: split a Buffer by a delimiter Buffer
function splitBuffer(buf, delimiter) {
  const parts = []
  let start = 0

  while (true) {
    const idx = buf.indexOf(delimiter, start)
    if (idx === -1) {
      parts.push(buf.slice(start))
      break
    }
    parts.push(buf.slice(start, idx))
    start = idx + delimiter.length
  }

  return parts.filter(p => p.length > 0)
}
