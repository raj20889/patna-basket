import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <span className="text-5xl">🛒</span>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-white opacity-20 rounded-full animate-ping"></div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
          Patna Basket
        </h1>

        {/* Loading Spinner */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-white text-lg font-medium">
          Loading fresh deals...
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-white rounded-full animate-progress"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
