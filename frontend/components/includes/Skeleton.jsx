"use client";

function WaitingSkeleton() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col items-center gap-4">
        {/* Circle avatar skeleton */}
        <div className="h-20 w-20 rounded-full bg-slate-200 animate-pulse" />

        {/* Title skeleton */}
        <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />

        {/* Subtitle skeleton */}
        <div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />

        {/* Buttons/rows skeleton */}
        <div className="flex flex-col gap-3 mt-4 w-72">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default  WaitingSkeleton;