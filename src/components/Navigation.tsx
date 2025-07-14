import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Scan, Recycle,TicketPlus , User, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AnimatedLogo } from "./ui/AnimatedLogo";
import { supabase } from "../lib/supabase";
import { path } from "framer-motion/client";

export function Navigation() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [co2Saved, setCo2Saved] = useState(0);
  const location = useLocation();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart3, requiresAuth: true },
    { name: "Tracker", path: "/tracker", icon: BarChart3, requiresAuth: true },
    { name: "Scanner", path: "/scan", icon: Scan, requiresAuth: true },
    { name: "Recycle", path: "/recycle", icon: Recycle, requiresAuth: true },
    {name: "Reuse" ,path: "/reuse", icon: TicketPlus, requiresAuth: true},
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  // Memoized wakeNavbar function with 8 second timeout
  

  // Auto-hide logic with improved scroll handling
 useEffect(() => {
  let scrollTimeout: NodeJS.Timeout | null = null;
  let lastScrollPos = window.scrollY;

  const handleScroll = () => {
    const currentScroll = window.scrollY;
    const scrollingDown = currentScroll > lastScrollPos;

    // Always show if near top
    if (currentScroll < 100) {
      setIsHidden(false);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    } else if (scrollingDown) {
      // Scroll down — hide
      setIsHidden(true);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    } else {
      // Scroll up — show and then auto-hide after 4s if stationary
      setIsHidden(false);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        if (window.scrollY > 100) {
          setIsHidden(true);
        }
      }, 4000); // 4 seconds
    }

    lastScrollPos = currentScroll;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      lastScrollPos = window.scrollY;
    }, 100);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (scrollTimeout) clearTimeout(scrollTimeout);
  };
}, []);


  // Fetch CO2 savings
  useEffect(() => {
    const fetchCO2Savings = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("user_scores")
          .select("co2_saved")
          .eq("user_id", user.id)
          .single();

        if (data) setCo2Saved(Math.round(data.co2_saved || 0));
      } catch (error) {
        console.error("Error fetching CO2 data:", error);
      }
    };

    fetchCO2Savings();
    const interval = setInterval(fetchCO2Savings, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50"
      animate={{ y: isHidden ? -100 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <AnimatedLogo />
            <motion.div 
              className="flex flex-col"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-xl font-bold text-white">GreenGARV</span>
              {user && co2Saved > 0 && (
                <motion.div
                  className="text-xs text-green-400 font-medium px-2 py-1 rounded bg-green-900/20"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Saved {co2Saved}g CO₂
                </motion.div>
              )}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              const Icon = item.icon;

              return (
                <motion.div 
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "text-green-400 bg-green-900/20"
                        : "text-gray-300 hover:text-green-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {isActive(item.path) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full"
                        layoutId="navIndicator"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <motion.div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 group"
                >
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring" }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.span 
                    className="text-sm font-medium text-gray-300 group-hover:text-green-400 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    {user.user_metadata?.name || "User"}
                  </motion.span>
                </Link>
                <motion.button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-400"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-green-400 font-medium relative overflow-hidden"
                  >
                    <span className="relative z-10">Sign In</span>
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-green-400 w-full"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/auth"
                    className="px-4 py-2 border border-green-400 text-green-400 rounded-lg font-medium relative overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <motion.div
                      className="absolute inset-0 bg-green-400/10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-green-400"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col py-4 space-y-2">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                return (
                  <motion.div
                    key={item.name}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                        isActive(item.path)
                          ? "bg-green-900/30 text-green-400"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {user ? (
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center text-green-400 hover:bg-green-900/20 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center border border-green-400 text-green-400 rounded-lg hover:bg-green-900/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}