import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
