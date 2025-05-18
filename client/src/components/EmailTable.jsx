import { useState, useEffect } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

const EmailTable = ({ emails }) => {
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc") // asc or desc
  const [sortedEmails, setSortedEmails] = useState([])
  const [availableFields, setAvailableFields] = useState({
    date: false,
    sentiment: false,
    sentimentScore: false,
  })

  useEffect(() => {
    if (!emails || emails.length === 0) {
      return
    }

    // Check which fields are available in the data
    const fields = {
      date: emails.some((email) => email.date),
      sentiment: emails.some((email) => email.sentiment),
      sentimentScore: emails.some((email) => email.sentimentScore !== undefined),
    }
    setAvailableFields(fields)

    // Sort emails
    const sorted = [...emails].sort((a, b) => {
      if (sortField === "date") {
        if (!a.date || !b.date) return 0
        return sortDirection === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
      }

      if (sortField === "subject") {
        return sortDirection === "asc" ? a.subject.localeCompare(b.subject) : b.subject.localeCompare(a.subject)
      }

      if (sortField === "sentiment") {
        if (!a.sentiment || !b.sentiment) return 0
        return sortDirection === "asc" ? a.sentiment.localeCompare(b.sentiment) : b.sentiment.localeCompare(a.sentiment)
      }

      if (sortField === "sentimentScore") {
        if (a.sentimentScore === undefined || b.sentimentScore === undefined) return 0
        return sortDirection === "asc" ? a.sentimentScore - b.sentimentScore : b.sentimentScore - a.sentimentScore
      }

      return 0
    })

    setSortedEmails(sorted)
  }, [emails, sortField, sortDirection])

  if (!emails || emails.length === 0) {
    return <div className="text-center py-8 text-gray-500">No email data available</div>
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Helper function to get the appropriate CSS class for a sentiment
  const getSentimentClass = (sentiment) => {
    if (!sentiment) return ""

    const sentimentLower = sentiment.toLowerCase()
    if (sentimentLower.includes("stress") || sentimentLower.includes("negative")) return "bg-red-100 text-red-800"
    if (sentimentLower.includes("anxiety") || sentimentLower.includes("worried")) return "bg-orange-100 text-orange-800"
    if (sentimentLower.includes("joy") || sentimentLower.includes("happy") || sentimentLower.includes("positive"))
      return "bg-green-100 text-green-800"
    if (sentimentLower.includes("neutral")) return "bg-gray-100 text-gray-800"
    if (sentimentLower.includes("calm")) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {availableFields.date && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">Date {getSortIcon("date")}</div>
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("subject")}
            >
              <div className="flex items-center">Subject {getSortIcon("subject")}</div>
            </th>
            {availableFields.sentiment && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("sentiment")}
              >
                <div className="flex items-center">Sentiment {getSortIcon("sentiment")}</div>
              </th>
            )}
            {availableFields.sentimentScore && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("sentimentScore")}
              >
                <div className="flex items-center">Score {getSortIcon("sentimentScore")}</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEmails.map((email, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {availableFields.date && email.date && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(email.date).toLocaleDateString()}
                </td>
              )}
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{email.subject}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">{email.snippet}</div>
              </td>
              {availableFields.sentiment && email.sentiment && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentClass(email.sentiment)}`}>
                    {email.sentiment}
                  </span>
                </td>
              )}
              {availableFields.sentimentScore && email.sentimentScore !== undefined && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${email.sentimentScore}%`,
                        backgroundColor: getSentimentColor(email.sentimentScore),
                      }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-center">{Math.round(email.sentimentScore)}%</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Helper function to get color based on sentiment score
const getSentimentColor = (score) => {
  if (score < 30) return "#ef4444" // red
  if (score < 50) return "#f97316" // orange
  if (score < 70) return "#facc15" // yellow
  return "#10b981" // green
}

export default EmailTable
