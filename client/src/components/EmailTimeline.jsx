import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const EmailTimeline = ({ emails }) => {
  const [chartData, setChartData] = useState(null)
  const [hasDateData, setHasDateData] = useState(false)

  useEffect(() => {
    if (!emails || emails.length === 0) {
      return
    }

    // Check if we have date information
    const emailsWithDates = emails.filter((email) => email.date)

    if (emailsWithDates.length === 0) {
      setHasDateData(false)
      return
    }

    setHasDateData(true)

    // Group emails by date
    const emailsByDate = emailsWithDates.reduce((acc, email) => {
      const date = new Date(email.date).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(email)
      return acc
    }, {})

    // Calculate sentiment scores by date
    const sentimentByDate = Object.entries(emailsByDate).map(([date, dateEmails]) => {
      // Only use emails with sentiment data
      const emailsWithSentiment = dateEmails.filter((email) => email.sentiment)

      if (emailsWithSentiment.length === 0) {
        return { date, sentiment: 0, count: dateEmails.length }
      }

      // Map sentiment words to scores
      const sentiments = emailsWithSentiment.map((email) => {
        const sentiment = email.sentiment.toLowerCase()
        if (sentiment.includes("stress") || sentiment.includes("anxiety")) return -0.7
        if (sentiment.includes("joy") || sentiment.includes("happy")) return 0.8
        if (sentiment.includes("neutral")) return 0
        if (sentiment.includes("calm")) return 0.5
        if (sentiment.includes("frustration")) return -0.5
        return 0 // Default to neutral if sentiment can't be categorized
      })

      // Average sentiment for the day
      const avgSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length

      return {
        date,
        sentiment: avgSentiment,
        count: dateEmails.length,
      }
    })

    // Sort by date
    sentimentByDate.sort((a, b) => new Date(a.date) - new Date(b.date))

    const labels = sentimentByDate.map((item) => item.date)
    const sentimentData = sentimentByDate.map((item) => (item.sentiment + 1) * 50) // Convert -1 to 1 scale to 0 to 100
    const countData = sentimentByDate.map((item) => item.count)

    setChartData({
      labels,
      datasets: [
        {
          label: "Sentiment Score",
          data: sentimentData,
          borderColor: "rgba(139, 92, 246, 1)",
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          yAxisID: "y",
          tension: 0.4,
        },
        {
          label: "Email Count",
          data: countData,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          yAxisID: "y1",
          tension: 0.4,
        },
      ],
    })
  }, [emails])

  if (!emails || emails.length === 0) {
    return <div className="text-center py-8 text-gray-500">No email data available</div>
  }

  if (!hasDateData) {
    return <div className="text-center py-8 text-gray-500">Email date information not available</div>
  }

  if (!chartData) {
    return <div className="text-center py-8 text-gray-500">Processing timeline data...</div>
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            if (label === "Sentiment Score") {
              const value = context.raw
              const sentiment = value < 30 ? "Negative" : value > 70 ? "Positive" : "Neutral"
              return `${label}: ${sentiment} (${Math.round(value)}%)`
            }
            return `${label}: ${context.raw}`
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Sentiment Score",
        },
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Email Count",
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default EmailTimeline
