import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-12 h-12 rounded-[1.25rem] bg-card border border-border/60 text-foreground flex items-center justify-center hover:shadow-soft hover:border-cyan-400/30 transition-all duration-300 group ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-cyan-600 transition-transform group-hover:-rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 transition-transform group-hover:rotate-45" />
      )}
    </button>
  );
};

export default ThemeToggle;
