import React from "react";

function SkeletonProduct() {
  return (
    <section className="flex gap-6 p-6 min-h-screen bg-gray-50">
      {/* Left Side (Image & Small boxes) */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="h-[300px] w-full bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-20 w-full bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-20 w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Right Side (Text placeholders) */}
      <div className="flex-2 flex flex-col gap-4 w-full">
        <div className="h-8 w-3/4 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-1/2 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-2/5 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-3/5 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-1/3 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-10 w-1/3 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </section>
  );
}

export default SkeletonProduct;
