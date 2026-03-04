export const config = {
  api: {
    bodyParser: false,
  },
};

import { Buffer } from "buffer";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  const username = "ayaanwarsi-cmd";
  const repo = "img";
  const folder = "images";

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");

  const filename = Date.now() + ".png";

  const githubURL =
    `https://api.github.com/repos/${username}/${repo}/contents/${folder}/${filename}`;

  const upload = await fetch(githubURL, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "upload image",
      content: base64,
    }),
  });

  if (!upload.ok) {
    return res.status(500).json({ error: "Upload failed" });
  }

  const imageURL =
    `https://raw.githubusercontent.com/${username}/${repo}/main/${folder}/${filename}`;

  res.status(200).json({ url: imageURL });
}
