const express = require("express")
const cors = require("cors")
const { google } = require("googleapis")
const { Groq } = require("groq-sdk")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT

app.use(cors({
  origin: 'https://inbox-therapist.vercel.app',
  credentials: true
}));
app.use(express.json())

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI,
)

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]


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

    // Fetching the user profile
    const people = google.people({ version: "v1", auth: oauth2Client })
    const userInfo = await people.people.get({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos",
    })

    // Extracting the user data
    const userData = {
      name: userInfo.data.names ? userInfo.data.names[0].displayName : null,
      email: userInfo.data.emailAddresses ? userInfo.data.emailAddresses[0].value : null,
      picture: userInfo.data.photos ? userInfo.data.photos[0].url : null,
    }

    // Redirecting to frontend with access token and user data
    res.redirect(
      `${process.env.FRONTEND_URI}?token=${tokens.access_token}&user=${encodeURIComponent(JSON.stringify(userData))}`,
    )
  } catch (error) {
    console.error("Error getting tokens:", error)
    res.redirect(`${process.env.FRONTEND_URI}?error=auth_failed`)
  }
})

app.post("/api/fetch-emails", async (req, res) => {
  const { token, count = 10, timeRange = "week" } = req.body

  if (!token) {
    return res.status(400).json({ error: "Token is required" })
  }

  try {
    oauth2Client.setCredentials({ access_token: token })
    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    let dateFilter = ""
    const now = new Date()

    if (timeRange === "week") {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = `after:${lastWeek.getFullYear()}/${lastWeek.getMonth() + 1}/${lastWeek.getDate()}`
    } else if (timeRange === "month") {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = `after:${lastMonth.getFullYear()}/${lastMonth.getMonth() + 1}/${lastMonth.getDate()}`
    }

    // Fetch emails with date filter if applicable
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: count,
      q: dateFilter,
    })

    const messages = response.data.messages || []
    const emails = []

    // Fetch details for each email
    for (const message of messages) {
      const emailData = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      })

      const headers = emailData.data.payload.headers
      const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject"
      const from = headers.find((header) => header.name === "From")?.value || "Unknown Sender"
      const date = headers.find((header) => header.name === "Date")?.value
      const snippet = emailData.data.snippet || ""

      emails.push({
        id: message.id,
        subject,
        from,
        date,
        snippet,
      })
    }

    // Analyze emails with Groq
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

async function analyzeEmails(emails) {
  try {
    // Prepare email data for analysis
    const emailText = emails
      .map((email) => `Subject: ${email.subject}\nFrom: ${email.from}\nDate: ${email.date}\nSnippet: ${email.snippet}`)
      .join("\n\n")

    // Create prompt for Groq
    const prompt = `Analyze the following email snippets for mood and stress level. Give a professional but concise emotional summary of the week (about 3-4 paragraphs), and include percentage breakdown of emotions (stress, joy, neutrality, etc). Also include a stress score from 0-100 where 0 is completely calm and 100 is extremely stressed.

For each emotion in the breakdown, provide a percentage that represents how prevalent that emotion is in the emails. The percentages should add up to 100%. Make sure all percentage values are numbers between 0 and 100, not strings.

Also, analyze each individual email for its primary sentiment.

Respond in JSON format with these fields:
1. "summary" (string): A 3-4 paragraph analysis of the overall email sentiment
2. "emotions" (object): Emotion names as keys and percentage values (numbers, not strings)
3. "stressScore" (number): A score from 0-100 representing overall stress level
4. "emails" (array): The original emails with an added "sentiment" field for each

Here are the email snippets to analyze:

${emailText}`

    // Make request to Groq API using the SDK
    const chatCompletion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a professional psychological analyzer specializing in email communication patterns.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    const responseText = chatCompletion.choices[0].message.content

    let analysis
    try {
      analysis = JSON.parse(responseText)

      // Validate and fix emotions data
      if (analysis.emotions) {
        // Ensure all emotion values are numbers, not strings
        Object.entries(analysis.emotions).forEach(([emotion, value]) => {
          if (typeof value === "string") {
            analysis.emotions[emotion] = Number.parseFloat(value.replace("%", ""))
          }
        })

        // Normalize percentages if they don't add up to 100
        const totalPercentage = Object.values(analysis.emotions).reduce((sum, val) => sum + val, 0)
        if (Math.abs(totalPercentage - 100) > 5) {
          // Allow small deviation
          const factor = 100 / totalPercentage
          Object.keys(analysis.emotions).forEach((emotion) => {
            analysis.emotions[emotion] = Math.round(analysis.emotions[emotion] * factor)
          })
        }
      }

      // Ensure stressScore is a number between 0-100
      if (analysis.stressScore) {
        if (typeof analysis.stressScore === "string") {
          analysis.stressScore = Number.parseFloat(analysis.stressScore.replace("%", ""))
        }
        analysis.stressScore = Math.max(0, Math.min(100, analysis.stressScore))
      } else {
        analysis.stressScore = 50 // Default value
      }

      // Ensure emails have sentiment data
      if (analysis.emails && emails) {
        // Merge original email data with sentiment analysis
        const enhancedEmails = emails.map((originalEmail, index) => {
          const analyzedEmail = analysis.emails[index] || {}
          return {
            ...originalEmail,
            sentiment: analyzedEmail.sentiment || "Neutral",
            sentimentScore: analyzedEmail.sentimentScore || 50,
          }
        })
        analysis.emails = enhancedEmails
      } else {
        analysis.emails = emails.map((email) => ({
          ...email,
          sentiment: "Neutral",
          sentimentScore: 50,
        }))
      }
    } catch (e) {
      console.error("Error parsing Groq response:", e, "Response was:", responseText)
      // Fallback to a simpler analysis if JSON parsing fails
      return {
        summary: "We couldn't generate a detailed analysis of your emails at this time. Please try again later.",
        emotions: {
          Neutral: 50,
          Stress: 25,
          Joy: 25,
        },
        stressScore: 50,
        emails: emails.map((email) => ({
          ...email,
          sentiment: "Neutral",
          sentimentScore: 50,
        })),
      }
    }

    return {
      summary: analysis.summary,
      emotions: analysis.emotions,
      stressScore: analysis.stressScore,
      emails: analysis.emails,
    }
  } catch (error) {
    console.error("Error analyzing emails with Groq:", error)
    return {
      summary: "We couldn't analyze your emails at this time. Please try again later.",
      emotions: {
        Neutral: 50,
        Stress: 25,
        Joy: 25,
      },
      stressScore: 50,
      emails: emails.map((email) => ({
        ...email,
        sentiment: "Neutral",
        sentimentScore: 50,
      })),
    }
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
