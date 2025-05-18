import { useEffect, useRef } from "react"

const StressScoreGauge = ({ score }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Ensure score is a valid number between 0-100
    const validScore = typeof score === "number" && !isNaN(score) ? Math.max(0, Math.min(100, score)) : 50

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw gauge background
    const centerX = width / 2
    const centerY = height * 0.8
    const radius = Math.min(width, height) * 0.8

    // Draw gauge arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius / 2, Math.PI, 0, false)
    ctx.lineWidth = 20
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Calculate score position
    const scoreRatio = validScore / 100
    const startAngle = Math.PI
    const endAngle = startAngle - startAngle * scoreRatio * 2

    // Draw score arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius / 2, startAngle, endAngle, true)
    ctx.lineWidth = 20

    // Gradient based on score
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, "#10b981") // green
    gradient.addColorStop(0.5, "#facc15") // yellow
    gradient.addColorStop(1, "#ef4444") // red

    ctx.strokeStyle = gradient
    ctx.stroke()

    // Draw score text
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(validScore)}`, centerX, centerY - 20)

    // Draw label
    ctx.font = "14px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("Stress Score", centerX, centerY + 10)

    // Draw min/max labels
    ctx.font = "12px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.textAlign = "left"
    ctx.fillText("Low", 20, centerY)
    ctx.textAlign = "right"
    ctx.fillText("High", width - 20, centerY)

    // Draw stress level text
    let stressLevel = "Low"
    let stressColor = "#10b981"

    if (validScore > 30 && validScore <= 60) {
      stressLevel = "Moderate"
      stressColor = "#facc15"
    } else if (validScore > 60 && validScore <= 80) {
      stressLevel = "High"
      stressColor = "#f97316"
    } else if (validScore > 80) {
      stressLevel = "Very High"
      stressColor = "#ef4444"
    }

    ctx.font = "bold 16px Arial"
    ctx.fillStyle = stressColor
    ctx.textAlign = "center"
    ctx.fillText(stressLevel, centerX, centerY - 50)
  }, [score])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={300} height={200} className="w-full max-w-xs"></canvas>

      <div className="mt-4 w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Calm</span>
          <span>Moderate</span>
          <span>Stressed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: `${typeof score === "number" && !isNaN(score) ? Math.max(0, Math.min(100, score)) : 50}%`,
              background: `linear-gradient(90deg, #10b981 0%, #facc15 50%, #ef4444 100%)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default StressScoreGauge
