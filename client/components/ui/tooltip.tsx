import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

import {
  registerComponent,
  Prop,
  Section,
  PropsCategory,
  type PropertiesPanelDefinition,
  type EditorConfig,
} from "@superblocksteam/library";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

// Properties Definition for Tooltip (root)
const tooltipPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof Tooltip>
> = {
  general: Section.category(PropsCategory.Content).children({
    open: Prop.boolean(),
    children: Prop.jsx(),
  }),
  interaction: Section.category(PropsCategory.Interaction).children({
    defaultOpen: Prop.boolean(),
    delayDuration: Prop.number(),
    disableHoverableContent: Prop.boolean(),
  }),
  events: Section.category(PropsCategory.EventHandlers).children({
    onOpenChange: Prop.eventHandler(),
  }),
};

const tooltipEditorConfig: EditorConfig = {
  icon: "modal",
  isDetached: true,
  isDraggable: false,
  description:
    "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
};

// Properties Definition for TooltipContent
const tooltipContentPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof TooltipContent>
> = {
  general: Section.category(PropsCategory.Content).children({
    children: Prop.jsx(),
  }),
  appearance: Section.category(PropsCategory.Appearance).children({
    side: Prop.string<"top" | "right" | "bottom" | "left">(),
    align: Prop.string<"start" | "center" | "end">(),
    sideOffset: Prop.number(),
    avoidCollisions: Prop.boolean(),
  }),
};

const childrenPropertiesDefinition = {
  general: Section.category(PropsCategory.Content).children({
    children: Prop.jsx(),
  }),
};

// Register Components
registerComponent(Tooltip, tooltipPropertiesDefinition).editorConfig(
  tooltipEditorConfig,
);
registerComponent(TooltipTrigger, childrenPropertiesDefinition);
registerComponent(TooltipContent, tooltipContentPropertiesDefinition);
