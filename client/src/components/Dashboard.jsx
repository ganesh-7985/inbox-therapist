import { useState, useEffect } from "react"
import EmailChart from "./EmailChart"
import { Mail, Share2, Download, LogOut, RefreshCw } from "lucide-react"

const Dashboard = ({ token, setLoading }) => {
  const [emailData, setEmailData] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEmails = async () => {
    setLoading(true)
    setRefreshing(true)
    try {
      const response = await fetch("http://localhost:5050/api/fetch-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }

      const data = await response.json()
      setEmailData(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching emails:", err)
      setError("Failed to analyze emails. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchEmails()
    }
  }, [token])

  const handleLogout = () => {
    window.location.href = "/"
  }

  const handleShare = () => {
    if (emailData && emailData.summary) {
      navigator.clipboard
        .writeText(emailData.summary)
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold gradient-text">Inbox Therapist</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchEmails}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh Analysis"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {emailData ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Email Analysis</h2>
              <p className="text-gray-700 whitespace-pre-line">{emailData.summary}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Emotional Breakdown</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <EmailChart emotions={emailData.emotions} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Analyzed Emails</h2>
              <div className="space-y-4">
                {emailData.emails.map((email, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <h3 className="font-medium">{email.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{email.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Dashboard
