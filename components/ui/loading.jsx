import React from "react";

function LoadingSpinner({ message = "Loading...", size = "large" }) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-500 mx-auto mb-4`}
        ></div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
