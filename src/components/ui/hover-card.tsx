import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  delay?: number; // Delay before showing the HoverCard
}

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, delay = 300, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-all duration-200 ease-in-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...props}
    >
      {/* Custom content inside the HoverCard */}
      <div>
        <h4 className="text-lg font-semibold">Interactive Content</h4>
        <p className="mt-2">You can add interactive elements here.</p>
        <button className="mt-2 p-2 bg-blue-500 text-white rounded">Click Me</button>
      </div>
    </HoverCardPrimitive.Content>
  );
});

HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
