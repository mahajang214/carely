import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
        outline: "border border-gray-300 hover:bg-gray-100 cursor-pointer",
        ghost: "hover:bg-gray-100 cursor-pointer",
        danger: "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
        subDanger: "bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer",
        template:
          "bg-emerald-600 text-white  hover:scale-105 duration-300 cursor-pointer",
        // new
        primary: "...",
        secondary:
          "bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer",
        success: "...",
        warning:
          "cursor-pointer bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition disabled:opacity-50",
        subWarning:
          "cursor-pointer bg-yellow-100 text-yellow-800 py-2 rounded-lg font-medium hover:bg-yellow-200 transition disabled:opacity-50",
        link: "text-sm text-indigo-600 hover:underline  transition-all duration-200 cursor-pointer",
        subtle: "...",
        loading: "...",
        dashboardIcon:
          "hover:bg-black text-white shadow-lg bg-gray-600 text-gray-700 cursor-pointer",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
