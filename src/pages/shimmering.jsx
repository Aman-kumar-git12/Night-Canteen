import React from 'react';

// Shimmer component for profile page
export const ShimmerProfile = () => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
      {/* Avatar placeholder */}
      <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 border-4 border-orange-200 shimmer-effect"></div>
      
      {/* Name placeholder */}
      <div className="h-8 bg-gray-200 rounded-md w-1/2 mx-auto mt-4 mb-2 shimmer-effect"></div>
      
      {/* Email placeholder */}
      <div className="h-5 bg-gray-200 rounded-md w-3/4 mx-auto mb-6 shimmer-effect"></div>
      
      {/* Profile details grid */}
      <div className="grid grid-cols-2 gap-4 text-left mt-6">
        {Array(6).fill().map((_, index) => (
          <div key={index}>
            <div className="h-3 bg-gray-200 rounded-md w-1/3 mb-2 shimmer-effect"></div>
            <div className="h-5 bg-gray-200 rounded-md w-2/3 shimmer-effect"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Shimmer component for food item cards
export const ShimmerItemCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full h-[300px] overflow-hidden relative">
      {/* Image placeholder */}
      <div className="w-full h-40 bg-gray-200 rounded-md mb-4 shimmer-effect"></div>
      
      {/* Title placeholder */}
      <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2 shimmer-effect"></div>
      
      {/* Price placeholder */}
      <div className="h-5 bg-gray-200 rounded-md w-1/4 mb-3 shimmer-effect"></div>
      
      {/* Description placeholder */}
      <div className="h-4 bg-gray-200 rounded-md w-full mb-2 shimmer-effect"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6 shimmer-effect"></div>
    </div>
  );
};

// Shimmer component for the item grid
export const ShimmerItemGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {Array(count).fill().map((_, index) => (
        <ShimmerItemCard key={index} />
      ))}
    </div>
  );
};

// Shimmer component for the navigation bar
export const ShimmerNavBar = () => {
  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo placeholder */}
      <div className="h-10 w-32 bg-gray-200 rounded-md shimmer-effect"></div>
      
      {/* Navigation items placeholder */}
      <div className="flex space-x-4">
        <div className="h-8 w-20 bg-gray-200 rounded-md shimmer-effect"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-md shimmer-effect"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-md shimmer-effect"></div>
      </div>
    </div>
  );
};

// Shimmer component for category buttons
export const ShimmerCategories = () => {
  return (
    <div className="flex overflow-x-auto py-4 space-x-4 px-6">
      {Array(6).fill().map((_, index) => (
        <div key={index} className="h-10 w-28 bg-gray-200 rounded-full flex-shrink-0 shimmer-effect"></div>
      ))}
    </div>
  );
};

// Main shimmer page component that combines all shimmer elements
const ShimmerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShimmerNavBar />
      <div className="container mx-auto">
        <ShimmerCategories />
        <ShimmerItemGrid />
      </div>
      
      {/* CSS for shimmer effect */}
      <style jsx="true">{`
        .shimmer-effect {
          position: relative;
          overflow: hidden;
          background: #f6f7f8;
        }
        
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ShimmerPage;