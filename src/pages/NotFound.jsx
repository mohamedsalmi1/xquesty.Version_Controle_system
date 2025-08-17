import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Page Not Available</h1>
        <p className="text-lg text-gray-700 mb-6">Sorry, the page you are looking for does not exist or is not available.</p>
        <a href="/" className="text-blue-600 hover:underline">Go to Home</a>
      </div>
    </div>
  );
}
