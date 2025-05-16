import React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import Loading from "./components/Loading"
import "./index.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get("token")

    if (accessToken) {
      setToken(accessToken)
      setIsAuthenticated(true)

      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {loading && <Loading />}
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setLoading={setLoading} />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard token={token} setLoading={setLoading} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>

  )
}

export default App
