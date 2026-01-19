"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  ChevronDown,
  ChevronRight,
  NotepadText,
  X,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/site/admin",
    hasSubmenu: false,
  },
  {
    id: "events",
    label: "Kuesioner",
    icon: NotepadText,
    href: "/site/admin",
    hasSubmenu: true,
    submenu: [{ label: "Manage Volunteer", href: "/site/admin/user" }],
  },
  {
    id: "settings",
    label: "Account Settings",
    icon: Wrench,
    href: "/site/personal/admin/settings",
    hasSubmenu: false,
  },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle swipe gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && onMobileClose) {
        const sidebar = document.getElementById("mobile-sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onMobileClose();
        }
      }
    };

    if (isMobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen, onMobileClose]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  // Highlight active menu based on current pathname
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // open the parent menu if a submenu matches the current path
    menuItems.forEach((item) => {
      if (item.hasSubmenu && item.submenu) {
        const match = item.submenu.some((si) => pathname.startsWith(si.href));
        if (match && !openMenus.includes(item.id)) {
          setOpenMenus((prev) => [...prev, item.id]);
        }
      }
    });
  }, [pathname, openMenus]);

  const renderMenuItem = (item: (typeof menuItems)[0]) => {
    const isOpen = openMenus.includes(item.id);
    const Icon = item.icon;
    const isActive = !item.hasSubmenu && pathname === item.href;

    return (
      <div key={item.id} className="mb-2 px-3">
        <div
          className={`group flex items-center ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          } py-3 rounded-xl cursor-pointer transition-all duration-300 ease-out border ${
            isActive
              ? "bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)_inset]"
              : "text-slate-300 border-transparent hover:bg-white/5 hover:text-white hover:border-white/5"
          }`}
          onClick={() => (item.hasSubmenu ? toggleMenu(item.id) : null)}
          title={isCollapsed ? item.label : undefined}
        >
          <Link
            href={item.hasSubmenu ? "#" : item.href}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "flex-1"
            }`}
            onClick={(e) => item.hasSubmenu && e.preventDefault()}
          >
            <Icon
              className={`w-5 h-5 transition-colors duration-300 ${
                isCollapsed ? "" : "mr-3"
              } ${isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-indigo-300"}`}
            />
            {!isCollapsed && (
              <span className="font-medium text-sm tracking-wide">
                {item.label}
              </span>
            )}
          </Link>
          {item.hasSubmenu && !isCollapsed && (
            <div className="ml-2 text-slate-400 group-hover:text-white transition-colors">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {item.hasSubmenu && isOpen && item.submenu && !isCollapsed && (
          <div className="mt-1 ml-4 border-l border-white/10 pl-3 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {item.submenu.map((subItem, index) => {
              const subActive = pathname === subItem.href;
              return (
                <Link
                  key={index}
                  href={subItem.href}
                  className={`block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    subActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* Sidebar Container */}
      <div
        id="mobile-sidebar"
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } h-screen bg-[#0B1F5C]/95 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out
        ${
          isMobileOpen
            ? "fixed left-0 top-0 z-50 md:relative md:z-auto"
            : "fixed -left-72 top-0 z-50 md:relative md:left-0 md:z-auto"
        } md:flex md:flex-col`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Decorative ambient light */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/20 blur-[80px] pointer-events-none" />

        {/* Mobile Header */}
        {isMobileOpen && (
          <div className="flex items-center justify-between p-6 border-b border-white/10 md:hidden relative z-10">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/assets/freelinkd.svg"
                alt="FreeLinkd Logo"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={onMobileClose}
              className="cursor-pointer p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Desktop Logo Section */}
        <div
          className={`hidden md:flex items-center justify-center relative z-10 transition-all duration-300 ${
            isCollapsed ? "py-6" : "py-8"
          } border-b border-white/5`}
        >
          <div
            className={`relative transition-all duration-500 ${
              isCollapsed ? "w-10 h-10" : "w-32 h-32"
            }`}
          >
            <Image
              src="/assets/freelinkd.svg"
              alt="FreeLinkd Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 relative z-10 scrollbar-hide">
          <div className="mb-2">
            {!isCollapsed && (
              <div className="px-7 mb-4">
                <h3 className="text-xs font-bold text-indigo-200/50 uppercase tracking-widest">
                  Menu
                </h3>
              </div>
            )}
            <div className="space-y-1">{menuItems.map(renderMenuItem)}</div>
          </div>
        </nav>

        {/* Logout / Footer Section (Optional Enhancement) */}
        {!isCollapsed && (
          <div className="p-6 border-t border-white/5 relative z-10">
            <button
              onClick={() => {
                localStorage.removeItem("adminUser");
                window.location.href = "/site/personal/admin/login";
              }}
              className="cursor-pointer flex items-center w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 hover:border hover:border-white/5 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        )}

        {/* Collapsed Footer Icon */}
        {isCollapsed && (
          <div className="p-4 border-t border-white/5 relative z-10 flex justify-center">
            <button
              onClick={() => {
                localStorage.removeItem("adminUser");
                window.location.href = "/site/personal/admin/login";
              }}
              className="cursor-pointer p-3 rounded-xl text-slate-300 hover:bg-white/5 transition-all text-slate-400 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
