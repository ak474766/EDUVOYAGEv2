"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "../../../lib/utils";

export const GetStartedInput = ({
  placeholder = "Get Started",
  className,
  onSubmit,
  buttonText = "Get Started",
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(inputValue);
    }
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full max-w-md", className)}>
      <div className="relative flex items-center">
        {/* Gradient Button */}
        <button
          type="submit"
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <Send className="h-5 w-5 text-white" />
        </button>

        {/* White Input Area */}
        <div className="relative -ml-2 flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="h-12 w-full rounded-r-full bg-white px-6 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-lg"
            {...props}
          />
        </div>
      </div>
    </form>
  );
};

export default GetStartedInput;
