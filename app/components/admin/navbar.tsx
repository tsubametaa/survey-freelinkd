"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  User,
  LayoutDashboard,
  Wrench,
  Bot,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
}

export default function AdminNavbar({
  onToggleSidebar,
  onToggleMobileSidebar,
}: AdminNavbarProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    // Load user from localStorage then fetch fresh data from server
    try {
      const raw = localStorage.getItem("adminUser");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const email = parsed?.email;
      if (!email) return;

      // fetch fresh user data
      (async () => {
        setUserEmail(email);
        try {
          const resp = await fetch("/api/auth/admin/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!resp.ok) return;
          const json = await resp.json();
          const user = json?.user;
          if (user) {
            setUserName(user.username || user.name || user.email);
          }
        } catch {
          // ignore fetch errors for navbar
        }
      })();
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-indigo-100/50 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Toggle button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                onToggleMobileSidebar?.();
              } else {
                onToggleSidebar?.();
              }
            }}
            className="cursor-pointer p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb or Page Title Placeholder (Optional) */}
          <div className="hidden md:block h-6 w-[1px] bg-slate-200 mx-2"></div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications (Demo) */}
          <button className="cursor-pointer relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className={`cursor-pointer flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-200 group ${
                isProfileDropdownOpen
                  ? "bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50"
                  : "bg-white/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>

              <div className="hidden md:flex flex-col items-start mr-1">
                <span className="text-xs font-bold text-slate-700 leading-none mb-1">
                  {userName || "Administrator"}
                </span>
                <span className="text-[10px] text-slate-400 leading-none">
                  Admin Access
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180 text-indigo-500" : ""}`}
              />
            </button>

            {/* Glass Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 ring-1 ring-slate-200/50 z-50 transform origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col p-2">
                  <div className="px-4 py-3 border-b border-slate-100 mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {userEmail || "admin@example.com"}
                    </p>
                  </div>

                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 mr-3 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    Dashboard
                  </a>

                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 mr-3 transition-colors">
                      <Wrench className="w-4 h-4" />
                    </div>
                    Account settings
                  </a>

                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 mr-3 transition-colors">
                      <Bot className="w-4 h-4" />
                    </div>
                    Chatbot Assistant
                  </a>

                  <div className="border-t border-slate-100 my-2"></div>

                  <button
                    onClick={() => {
                      localStorage.removeItem("adminUser");
                      window.location.href = "/site/personal/admin/login";
                    }}
                    className="cursor-pointer w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 mr-3 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
