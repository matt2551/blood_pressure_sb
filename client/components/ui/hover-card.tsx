import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import React from "react";

import {
  Prop,
  Section,
  PropsCategory,
  registerComponent,
  type PropertiesPanelDefinition,
  type EditorConfig,
} from "@superblocksteam/library";

import { cn } from "@/lib/utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

// Properties Definition for HoverCard (root)
const hoverCardPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof HoverCard>
> = {
  general: Section.category(PropsCategory.Content).children({
    open: Prop.boolean(),
    children: Prop.jsx(),
    openDelay: Prop.number(),
    closeDelay: Prop.number(),
  }),
  interaction: Section.category(PropsCategory.Interaction).children({
    defaultOpen: Prop.boolean(),
  }),
  events: Section.category(PropsCategory.EventHandlers).children({
    onOpenChange: Prop.eventHandler(),
  }),
};

const hoverCardEditorConfig: EditorConfig = {
  icon: "custom",
  isDetached: true,
  isDraggable: false,
  description:
    "A hover card component for displaying contextual information on hover",
};

// Properties Definition for HoverCardContent
const hoverCardContentPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof HoverCardContent>
> = {
  general: Section.category(PropsCategory.Content).children({
    children: Prop.jsx(),
  }),
  appearance: Section.category(PropsCategory.Appearance).children({
    side: Prop.string<"top" | "right" | "bottom" | "left">(),
    align: Prop.string<"start" | "center" | "end">(),
    sideOffset: Prop.number(),
    alignOffset: Prop.number(),
    avoidCollisions: Prop.boolean(),
  }),
};

const childrenPropertiesDefinition = {
  general: Section.category(PropsCategory.Content).children({
    children: Prop.jsx(),
  }),
};

// Register Components
registerComponent(HoverCard, hoverCardPropertiesDefinition).editorConfig(
  hoverCardEditorConfig,
);
registerComponent(HoverCardTrigger, childrenPropertiesDefinition);
registerComponent(HoverCardContent, hoverCardContentPropertiesDefinition);
