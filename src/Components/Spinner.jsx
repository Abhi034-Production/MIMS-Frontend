import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center ">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 dark:border-white"></div>
    </div>
  );
};

export default Spinner;
