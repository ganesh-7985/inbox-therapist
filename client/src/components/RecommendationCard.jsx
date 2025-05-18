import { useState, useEffect } from "react"
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react"

const RecommendationCard = ({ emotions }) => {
  const [expanded, setExpanded] = useState(false)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (!emotions || Object.keys(emotions).length === 0) {
      return
    }

    // Determine dominant emotions
    const sortedEmotions = Object.entries(emotions)
      .filter(([_, value]) => typeof value === "number" && !isNaN(value) && value > 0)
      .sort((a, b) => b[1] - a[1])

    if (sortedEmotions.length === 0) {
      setRecommendations(getDefaultRecommendations())
      return
    }

    const dominantEmotion = sortedEmotions[0][0].toLowerCase()

    // Generate recommendations based on dominant emotion
    if (
      dominantEmotion.includes("stress") ||
      dominantEmotion.includes("anxiety") ||
      dominantEmotion.includes("worry")
    ) {
      setRecommendations([
        "Try a 5-minute breathing exercise before checking emails",
        "Set specific times for email checking rather than constant monitoring",
        "Use email filters to prioritize important messages",
        "Consider a digital detox for at least 1 hour each day",
        "Practice mindfulness meditation to reduce email-induced stress",
      ])
    } else if (dominantEmotion.includes("frustration") || dominantEmotion.includes("anger")) {
      setRecommendations([
        "Wait 10 minutes before responding to frustrating emails",
        "Use templates for common responses to save energy",
        "Try the 'empty inbox' approach to reduce email clutter",
        "Schedule difficult email conversations rather than using email",
        "Use a voice recorder to verbalize thoughts before writing them down",
      ])
    } else if (
      dominantEmotion.includes("joy") ||
      dominantEmotion.includes("happy") ||
      dominantEmotion.includes("excitement")
    ) {
      setRecommendations([
        "Share your positive energy by recognizing others' contributions",
        "Use your positive momentum to tackle challenging communications",
        "Document what's working well in your communication style",
        "Maintain balance by setting boundaries even when feeling positive",
        "Consider mentoring others who struggle with email anxiety",
      ])
    } else {
      setRecommendations(getDefaultRecommendations())
    }
  }, [emotions])

  const getDefaultRecommendations = () => [
    "Establish a consistent email routine to maintain balance",
    "Try the 2-minute rule: if it takes less than 2 minutes, do it now",
    "Experiment with email batching to improve productivity",
    "Use email analytics to understand your communication patterns",
    "Practice gratitude by sending one positive email each day",
  ]

  if (!emotions || Object.keys(emotions).length === 0 || recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="font-medium text-purple-700">Recommendations</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-purple-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-600" />
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-600 mb-2">
            Based on your email analysis, here are some personalized recommendations:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RecommendationCard
