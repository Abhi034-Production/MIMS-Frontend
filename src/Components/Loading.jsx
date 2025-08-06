import React from "react";

const Loading = () => {
  return (
    <div className="fixed  dark:bg-black  inset-0 flex items-center justify-center bg-transparent z-50">
      <div className="w-16 h-16 border-8 border-gray-200 dark:border-gray-700 border-t-blue-900 dark:border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
