import * as React from "react"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200 ${className || ''}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
});

Progress.displayName = "Progress"

export { Progress }