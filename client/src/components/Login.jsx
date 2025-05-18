import React from "react"
import { Mail, Brain, Sparkles } from "lucide-react"

const Login = ({ setLoading }) => {
  const handleLogin = () => {
    setLoading(true)
    window.location.href = "http://localhost:5050/auth/google"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="w-16 h-16 text-purple-600" />
              <Brain className="absolute w-8 h-8 text-indigo-500 -right-1 -bottom-1" />
              <Sparkles className="absolute w-6 h-6 text-yellow-400 -left-1 -top-1 animate-pulse-slow" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Inbox Therapist</h1>
          <p className="mt-2 text-gray-600">AI-Powered Gmail Mental Health Analyzer</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-700 mb-2">Discover Your Email Psychology</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Analyze email sentiment patterns
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Track stress levels over time
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Get personalized wellness insights
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Visualize your communication health
              </li>
            </ul>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </button>

          <div className="text-xs text-gray-400 text-center space-y-2">
            <p>We only analyze your recent emails and never store your personal data.</p>
            <p>Your data is processed securely and never shared with third parties.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-md">
        <h3 className="text-lg font-medium text-gray-700 mb-2">How It Works</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="flex justify-center mb-2">
              <Mail className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-xs text-gray-600">Connect your Gmail</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="flex justify-center mb-2">
              <Brain className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-xs text-gray-600">AI analyzes emotions</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="flex justify-center mb-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-600">Get personalized insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
