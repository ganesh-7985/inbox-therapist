import { useState, useEffect } from "react"
import { Bar, Pie, Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
)

const EmailChart = ({ emotions }) => {
  const [chartType, setChartType] = useState("bar") // bar, pie, radar
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (!emotions || Object.keys(emotions).length === 0) {
      return
    }

    // Validate and process emotions data
    const processedEmotions = {}

    // Convert any string values to numbers and filter out invalid entries
    Object.entries(emotions).forEach(([emotion, value]) => {
      const numValue = typeof value === "string" ? Number.parseFloat(value.replace("%", "")) : value
      if (!isNaN(numValue) && numValue > 0) {
        processedEmotions[emotion] = numValue
      }
    })

    // Sort emotions by percentage (descending)
    const sortedEmotions = Object.entries(processedEmotions)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})

    const labels = Object.keys(sortedEmotions)
    const data = Object.values(sortedEmotions)

    // Generate colors based on emotion types
    const backgroundColor = labels.map((emotion) => getColorForEmotion(emotion))
    const borderColor = backgroundColor.map((color) => color.replace("0.7", "1"))

    setChartData({
      labels,
      datasets: [
        {
          label: "Percentage",
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    })
  }, [emotions])

  if (!emotions || Object.keys(emotions).length === 0) {
    return <div className="text-center py-8 text-gray-500">No emotion data available</div>
  }

  if (!chartData) {
    return <div className="text-center py-8 text-gray-500">Processing chart data...</div>
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`,
        },
      },
    },
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}%`,
        },
      },
    },
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === "bar" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Bar
          </button>
          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`px-4 py-2 text-sm font-medium ${
              chartType === "pie" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Pie
          </button>
          <button
            type="button"
            onClick={() => setChartType("radar")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === "radar" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === "bar" && <Bar data={chartData} options={barOptions} />}
        {chartType === "pie" && <Pie data={chartData} options={pieOptions} />}
        {chartType === "radar" && <Radar data={chartData} options={radarOptions} />}
      </div>
    </div>
  )
}

// Generate colors based on emotion types
const getColorForEmotion = (emotion) => {
  const emotionColors = {
    stress: "rgba(239, 68, 68, 0.7)",
    anxiety: "rgba(249, 115, 22, 0.7)",
    frustration: "rgba(234, 88, 12, 0.7)",
    worry: "rgba(217, 119, 6, 0.7)",
    joy: "rgba(16, 185, 129, 0.7)",
    happiness: "rgba(5, 150, 105, 0.7)",
    excitement: "rgba(59, 130, 246, 0.7)",
    neutral: "rgba(107, 114, 128, 0.7)",
    calm: "rgba(79, 70, 229, 0.7)",
    satisfaction: "rgba(139, 92, 246, 0.7)",
  }

  // Default color for unknown emotions
  const defaultColor = "rgba(156, 163, 175, 0.7)"

  // Find the closest matching emotion
  const matchingEmotion = Object.keys(emotionColors).find((key) => emotion.toLowerCase().includes(key.toLowerCase()))

  return matchingEmotion ? emotionColors[matchingEmotion] : defaultColor
}

export default EmailChart
