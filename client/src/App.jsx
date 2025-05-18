"use client"

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
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Check for token in URL (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get("token")
    const userData = urlParams.get("user")

    if (accessToken) {
      setToken(accessToken)
      setIsAuthenticated(true)

      // Parse user data if available
      if (userData) {
        try {
          setUserProfile(JSON.parse(decodeURIComponent(userData)))
        } catch (e) {
          console.error("Failed to parse user data", e)
        }
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)

      // Store token in localStorage for persistence
      localStorage.setItem("emailToken", accessToken)
      if (userData) {
        localStorage.setItem("userProfile", userData)
      }
    } else {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem("emailToken")
      const storedProfile = localStorage.getItem("userProfile")

      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)

        if (storedProfile) {
          try {
            setUserProfile(JSON.parse(decodeURIComponent(storedProfile)))
          } catch (e) {
            console.error("Failed to parse stored user data", e)
          }
        }
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("emailToken")
    localStorage.removeItem("userProfile")
    setToken("")
    setUserProfile(null)
    setIsAuthenticated(false)
  }

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
            element={
              isAuthenticated ? (
                <Dashboard token={token} setLoading={setLoading} userProfile={userProfile} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
