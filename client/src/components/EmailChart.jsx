import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const EmailChart = ({ emotions }) => {
  if (!emotions || Object.keys(emotions).length === 0) {
    return <div className="text-center py-8 text-gray-500">No emotion data available</div>
  }

  // Sort emotions by percentage (descending)
  const sortedEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})

  const labels = Object.keys(sortedEmotions)
  const data = Object.values(sortedEmotions)

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

  const chartData = {
    labels,
    datasets: [
      {
        label: "Percentage",
        data,
        backgroundColor: labels.map((emotion) => getColorForEmotion(emotion)),
        borderWidth: 1,
      },
    ],
  }

  const options = {
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

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default EmailChart
