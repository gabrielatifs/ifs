import * as React from "react"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-purple-600' : 'bg-slate-200'
      } ${className || ''}`}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      ref={ref}
      id={id}
      {...props}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
});

Switch.displayName = "Switch"

export { Switch }