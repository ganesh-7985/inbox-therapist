const express = require("express")
const cors = require("cors")
const { google } = require("googleapis")
const fetch = require("node-fetch")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5050

// Middleware
app.use(cors())
app.use(express.json())

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
)

const scopes = ["https://www.googleapis.com/auth/gmail.readonly"]

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
  res.redirect(url)
})

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    res.redirect(`${process.env.FRONTEND_URI}?token=${tokens.access_token}`)
  } catch (error) {
    console.error("Error getting tokens:", error)
    res.redirect(`${process.env.FRONTEND_URI}?error=auth_failed`)
  }
})

app.post("/api/fetch-emails", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: "Token is required" })
  }

  try {
    oauth2Client.setCredentials({ access_token: token })
    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    })

    const messages = response.data.messages || []
    const emails = []

    for (const message of messages) {
      const emailData = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      })

      const headers = emailData.data.payload.headers
      const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject"
      const snippet = emailData.data.snippet || ""

      emails.push({
        id: message.id,
        subject,
        snippet,
      })
    }

    const analysis = await analyzeEmails(emails)

    res.json({
      emails,
      ...analysis,
    })
  } catch (error) {
    console.error("Error fetching emails:", error)
    res.status(500).json({ error: "Failed to fetch and analyze emails" })
  }
})

// async function analyzeEmails(emails) {
//   try {
//     const emailText = emails.map((email) => `Subject: ${email.subject}\nSnippet: ${email.snippet}`).join("\n\n")

//     const prompt = `Analyze the following email snippets for mood and stress level. Give a professional but concise emotional summary of the week, and include percentage breakdown of emotions (stress anxiety frustration worry joy happiness excitement neutral calm satisfaction). Respond in JSON format with two fields: "summary" (string) and "emotions" (object with emotion names as keys and percentage values). Snippets:\n\n${emailText}`

//     const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "llama3-8b-8192",
//         messages: [
//           {
//             role: "system",
//             content: "You are a professional psychological analyzer specializing in email communication patterns.",
//           },
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//       }),
//     })

//     const data = await groqRes.json()
//     const raw = data.choices?.[0]?.message?.content

//     const parsed = JSON.parse(raw)

//     return {
//       summary: parsed.summary,
//       emotions: parsed.emotions,
//     }
//   } catch (error) {
//     console.error("Error analyzing emails with Groq:", error)
//     return {
//       summary: "We couldn't analyze your emails at this time. Please try again later.",
//       emotions: {},
//     }
//   }
// }

async function analyzeEmails(emails) {
    try {
      const emailText = emails.map((email) => `Subject: ${email.subject}\nSnippet: ${email.snippet}`).join("\n\n")
  
      const prompt = `You are an expert psychological analyzer. Analyze the following email snippets for mood and stress level. 
  Give a professional but concise emotional summary of the week, and include percentage breakdown of emotions:
  (stress, anxiety, frustration, worry, joy, happiness, excitement, neutral, calm, satisfaction). 
  
  Respond strictly in the following JSON format only:
  {
    "summary": "string",
    "emotions": {
      "stress": 0,
      "anxiety": 0,
      ...
    }
  }
  
  Snippets:\n\n${emailText}`
  
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a psychological AI that outputs strictly valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      })
  
      const data = await groqRes.json()
      const raw = data.choices?.[0]?.message?.content?.trim()
  
      // Defensive: Extract JSON block from possibly verbose response
      const jsonStart = raw.indexOf("{")
      const jsonEnd = raw.lastIndexOf("}")
      const jsonText = raw.substring(jsonStart, jsonEnd + 1)
  
      const parsed = JSON.parse(jsonText)
  
      return {
        summary: parsed.summary,
        emotions: parsed.emotions,
      }
    } catch (error) {
      console.error("Error analyzing emails with Groq:", error)
      return {
        summary: "We couldn't analyze your emails at this time. Please try again later.",
        emotions: {},
      }
    }
  }

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})