import React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Mail, Brain, LayoutDashboard, LogOut, Menu, X } from "lucide-react"

const Navbar = ({
  userProfile,
  onLogout,
  viewMode,
  setViewMode,
  timeRange,
  setTimeRange,
  emailCount,
  setEmailCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600" />
                <Brain className="h-4 w-4 text-indigo-500 -ml-2" />
              </div>
              <span className="ml-2 text-xl font-bold gradient-text">Inbox Therapist</span>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/dashboard")
                    ? "border-purple-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Link>

              <div className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500">
                <span className="mr-2">View:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="table">Table</option>
                </select>
              </div>

              <div className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500">
                <span className="mr-2">Time:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500">
                <span className="mr-2">Count:</span>
                <select
                  value={emailCount}
                  onChange={(e) => setEmailCount(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {userProfile && (
              <div className="flex items-center">
                {userProfile.picture ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={userProfile.picture || "/placeholder.svg"}
                    alt={userProfile.name || "User"}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {(userProfile.name || "U").charAt(0)}
                  </div>
                )}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {userProfile.name || userProfile.email || "User"}
                </span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive("/dashboard")
                  ? "border-purple-500 text-purple-700 bg-purple-50"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </div>
            </Link>

            <div className="block pl-3 pr-4 py-2 border-transparent text-base font-medium text-gray-600">
              <div className="flex items-center justify-between">
                <span>View Mode:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="ml-2 bg-white border border-gray-300 rounded-md text-sm"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="table">Table</option>
                </select>
              </div>
            </div>

            <div className="block pl-3 pr-4 py-2 border-transparent text-base font-medium text-gray-600">
              <div className="flex items-center justify-between">
                <span>Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="ml-2 bg-white border border-gray-300 rounded-md text-sm"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            <div className="block pl-3 pr-4 py-2 border-transparent text-base font-medium text-gray-600">
              <div className="flex items-center justify-between">
                <span>Email Count:</span>
                <select
                  value={emailCount}
                  onChange={(e) => setEmailCount(Number(e.target.value))}
                  className="ml-2 bg-white border border-gray-300 rounded-md text-sm"
                >
                  <option value="5">5 emails</option>
                  <option value="10">10 emails</option>
                  <option value="20">20 emails</option>
                  <option value="50">50 emails</option>
                </select>
              </div>
            </div>

            {userProfile && (
              <div className="block pl-3 pr-4 py-2 border-l-4 border-transparent">
                <div className="flex items-center">
                  {userProfile.picture ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={userProfile.picture || "/placeholder.svg"}
                      alt={userProfile.name || "User"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      {(userProfile.name || "U").charAt(0)}
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {userProfile.name || userProfile.email || "User"}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            >
              <div className="flex items-center">
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
