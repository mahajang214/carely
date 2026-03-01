import React from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm p-6",
        className
      )}
      {...props}
    />
  );
}