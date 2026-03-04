export default async function handler(req, res) {

  const token = process.env.GITHUB_TOKEN
  const username = "ayaanwarsi-cmd"
  const repo = "img"

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // BUG FIX #1: req.body is undefined — bodyParser is off by default, parse manually
  let body = ""
  for await (const chunk of req) {
    body += chunk
  }

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" })
  }

  const { url, newName } = parsed

  if (!url || !newName) {
    return res.status(400).json({ error: "Missing url or newName" })
  }

  // BUG FIX #2: Sanitize name and ensure it has an image extension
  const safeName = newName.replace(/[^a-zA-Z0-9.\-_]/g, "")
  const hasExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(safeName)
  const finalName = hasExt ? safeName : safeName + ".jpg"

  const path = url.split("/main/")[1]

  if (!path) {
    return res.status(400).json({ error: "Could not parse path from URL" })
  }

  try {

    // Get current file SHA + download URL
    const fileRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${token}` }
    })
    const data = await fileRes.json()

    if (!data.sha) {
      return res.status(404).json({ error: "File not found on GitHub", detail: data.message })
    }

    // BUG FIX #3: Use arrayBuffer to get binary content, then convert to base64 correctly
    const contentRes = await fetch(data.download_url)
    const buffer = await contentRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // Build new path
    const pathParts = path.split("/")
    pathParts[pathParts.length - 1] = finalName
    const newPath = pathParts.join("/")

    // Upload under new filename
    const uploadRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${newPath}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "rename image",
        content: base64
      })
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.json()
      return res.status(500).json({ error: "Failed to upload renamed file", detail: err.message })
    }

    // Delete old file
    const deleteRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "delete old image after rename",
        sha: data.sha
      })
    })

    if (!deleteRes.ok) {
      const err = await deleteRes.json()
      return res.status(500).json({ error: "Renamed but failed to delete old file", detail: err.message })
    }

    const newURL = `https://raw.githubusercontent.com/${username}/${repo}/main/${newPath}`

    res.json({ success: true, newURL })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Rename failed", detail: err.message })
  }

}
