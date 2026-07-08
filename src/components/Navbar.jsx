import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, GraduationCap, LogOut, User, Menu, X, CheckSquare } from "lucide-react";

export default function Navbar() {
  const { user, logout, notifications, markAllNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/10 text-rose-600 border-rose-200";
      case "INSTRUCTOR":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-sky-500/10 text-sky-600 border-sky-200";
    }
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6" id="nav-logo-icon" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-800 bg-clip-text">
                EduTrack
              </span>
            </Link>

            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === "STUDENT" && (
                  <Link
                    to="/dashboard?tab=all"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Browse Catalog
                  </Link>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  id="notifications-bell-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                      <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                              !notification.read ? "bg-indigo-50/20" : ""
                            }`}
                          >
                            <p className="text-xs font-semibold text-slate-700">{notification.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-all border border-slate-100"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner shadow-black/10">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 pr-2 hidden sm:inline-block">
                    {user.name}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className={`inline-block border rounded-full px-2 py-0.5 text-[10px] font-bold mt-2 uppercase ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 md:hidden"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {showMobileMenu && user && (
        <div className="border-b border-slate-100 md:hidden bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner">
          <Link
            to="/dashboard"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          {user.role === "STUDENT" && (
            <Link
              to="/dashboard?tab=all"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              Browse Catalog
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
