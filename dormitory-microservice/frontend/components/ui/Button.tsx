import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--color-ptit-red)] text-white hover:bg-[var(--color-ptit-red-hover)] focus:ring-[var(--color-ptit-red)]",
    secondary: "bg-[var(--color-ptit-yellow)] text-slate-900 hover:bg-[var(--color-ptit-yellow-hover)] focus:ring-[var(--color-ptit-yellow)]",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-900 focus:ring-slate-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`;

  return <button className={combinedClassName} {...props} />;
}
