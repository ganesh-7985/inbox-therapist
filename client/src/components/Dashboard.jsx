import { useState, useEffect } from "react"
import EmailChart from "./EmailChart"
import EmailTimeline from "./EmailTimeline"
import EmailTable from "./EmailTable"
import Navbar from "./Navbar"
import RecommendationCard from "./RecommendationCard"
import StressScoreGauge from "./StressScoreGauge"
import { Share2, Download, RefreshCw } from "lucide-react"

const Dashboard = ({ token, setLoading, userProfile, onLogout }) => {
  const [emailData, setEmailData] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("week") // week, month, all
  const [emailCount, setEmailCount] = useState(10)
  const [viewMode, setViewMode] = useState("summary") // summary, detailed, table

  const fetchEmails = async () => {
    setLoading(true)
    setRefreshing(true)
    try {
      const response = await fetch("http://localhost:5050/api/fetch-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          count: emailCount,
          timeRange,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }

      const data = await response.json()

      // Validate and process the data
      const processedData = {
        ...data,
        emotions: processEmotions(data.emotions),
        stressScore: processStressScore(data.stressScore),
        emails: processEmails(data.emails),
      }

      setEmailData(processedData)
      setError(null)
    } catch (err) {
      console.error("Error fetching emails:", err)
      setError("Failed to analyze emails. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Process emotions to ensure they're valid numbers
  const processEmotions = (emotions) => {
    if (!emotions || typeof emotions !== "object") {
      return { Neutral: 100 }
    }

    const processed = {}
    let totalPercentage = 0

    // Convert any string values to numbers and filter out invalid entries
    Object.entries(emotions).forEach(([emotion, value]) => {
      const numValue = typeof value === "string" ? Number.parseFloat(value.replace("%", "")) : value
      if (!isNaN(numValue) && numValue > 0) {
        processed[emotion] = numValue
        totalPercentage += numValue
      }
    })

    // If no valid emotions or total is way off, return default
    if (Object.keys(processed).length === 0 || Math.abs(totalPercentage - 100) > 30) {
      return { Neutral: 100 }
    }

    // Normalize to 100% if needed
    if (Math.abs(totalPercentage - 100) > 5) {
      const factor = 100 / totalPercentage
      Object.keys(processed).forEach((emotion) => {
        processed[emotion] = Math.round(processed[emotion] * factor)
      })
    }

    return processed
  }

  // Process stress score to ensure it's a valid number
  const processStressScore = (score) => {
    if (typeof score === "string") {
      score = Number.parseFloat(score.replace("%", ""))
    }

    if (isNaN(score) || score < 0 || score > 100) {
      return 50 // Default value
    }

    return Math.round(score)
  }

  // Process emails to ensure they have required fields
  const processEmails = (emails) => {
    if (!Array.isArray(emails) || emails.length === 0) {
      return []
    }

    return emails.map((email) => ({
      ...email,
      sentiment: email.sentiment || "Neutral",
      sentimentScore: processStressScore(email.sentimentScore || 50),
    }))
  }

  const calculateStressScore = (emotions) => {
    // Calculate a stress score from 0-100 based on emotions
    if (!emotions || Object.keys(emotions).length === 0) return 50

    const stressFactors = {
      stress: 1,
      anxiety: 0.8,
      frustration: 0.7,
      worry: 0.6,
      neutral: 0,
      calm: -0.5,
      joy: -0.7,
      happiness: -0.8,
      excitement: -0.3,
      satisfaction: -0.6,
    }

    let score = 50 // Start at neutral
    let totalWeight = 0

    Object.entries(emotions).forEach(([emotion, percentage]) => {
      // Find the closest matching emotion in our factors
      const matchingEmotion =
        Object.keys(stressFactors).find((key) => emotion.toLowerCase().includes(key.toLowerCase())) || "neutral"

      const factor = stressFactors[matchingEmotion] || 0
      score += factor * percentage
      totalWeight += percentage
    })

    // Normalize score to 0-100 range
    score = Math.max(0, Math.min(100, score))
    return Math.round(score)
  }

  useEffect(() => {
    if (token) {
      fetchEmails()
    }
  }, [token, emailCount, timeRange])

  const handleShare = () => {
    if (emailData && emailData.summary) {
      const stressScore = emailData.stressScore || calculateStressScore(emailData.emotions)
      const shareText = `My Inbox Therapist Analysis:\n\n${emailData.summary}\n\nStress Score: ${stressScore}/100`

      navigator.clipboard
        .writeText(shareText)
        .then(() => alert("Summary copied to clipboard!"))
        .catch((err) => console.error("Failed to copy:", err))
    }
  }

  const handleExport = () => {
    if (emailData) {
      const dataStr = JSON.stringify(emailData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = "email-analysis.json"

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userProfile={userProfile}
        onLogout={onLogout}
        viewMode={viewMode}
        setViewMode={setViewMode}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        emailCount={emailCount}
        setEmailCount={setEmailCount}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Email Analysis Dashboard</h1>
            <p className="text-gray-600">Insights from your {emailCount} most recent emails</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchEmails}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Analysis</span>
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {emailData ? (
          <>
            {viewMode === "summary" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Email Sentiment Summary</h2>
                  <p className="text-gray-700 whitespace-pre-line">{emailData.summary}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(emailData.emotions || {}).map(([emotion, value], index) => (
                      <span key={index} className={`emotion-tag ${getEmotionClass(emotion)}`}>
                        {emotion}: {typeof value === "number" ? Math.round(value) : value}%
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Stress Score</h2>
                  <StressScoreGauge score={emailData.stressScore || calculateStressScore(emailData.emotions)} />
                  <div className="mt-4">
                    <RecommendationCard emotions={emailData.emotions} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Emotional Breakdown</h2>
                <EmailChart emotions={emailData.emotions} />
              </div>

              {viewMode !== "table" && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Email Timeline</h2>
                  <EmailTimeline emails={emailData.emails} />
                </div>
              )}
            </div>

            {viewMode === "table" && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Email Analysis Table</h2>
                <EmailTable emails={emailData.emails} />
              </div>
            )}

            {viewMode === "detailed" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Analyzed Emails</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {emailData.emails.map((email, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-800">{email.subject}</h3>
                        {email.date && (
                          <span className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{email.snippet}</p>

                      {email.sentiment && (
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-gray-500 mr-2">Sentiment:</span>
                          <span className={`emotion-tag ${getEmotionClass(email.sentiment)}`}>{email.sentiment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : !error ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// Helper function to get the appropriate CSS class for an emotion
const getEmotionClass = (emotion) => {
  const emotionLower = emotion.toLowerCase()
  if (emotionLower.includes("stress")) return "emotion-stress"
  if (emotionLower.includes("anxiety") || emotionLower.includes("worried")) return "emotion-anxiety"
  if (emotionLower.includes("joy") || emotionLower.includes("happy")) return "emotion-joy"
  if (emotionLower.includes("neutral")) return "emotion-neutral"
  if (emotionLower.includes("calm")) return "emotion-calm"
  if (emotionLower.includes("frustration") || emotionLower.includes("angry")) return "emotion-frustration"
  if (emotionLower.includes("excitement")) return "emotion-excitement"
  if (emotionLower.includes("satisfaction")) return "emotion-satisfaction"
  return "emotion-neutral"
}

export default Dashboard
