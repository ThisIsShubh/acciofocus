"use client";
import { useEffect, useState } from "react";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleLoad = () => {
      // Simulate progress completion
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 300);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 border-8 border-green-100 rounded-full"></div>
        
        {/* Animated ring */}
        <div className="absolute inset-0 border-8 border-t-green-600 border-r-green-600 border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
        
        {/* Inner logo */}
        <div className="absolute inset-6 flex items-center justify-center">
          <div className="w-full h-full bg-green-600 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              className="w-12 h-12 text-white"
            >
              <path fill="currentColor" d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="w-64 h-2 bg-green-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Loading text */}
      <p className="mt-4 text-green-800 font-medium flex items-center">
        Loading your study space
        <span className="ml-2 flex">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </p>
    </div>
  );
}