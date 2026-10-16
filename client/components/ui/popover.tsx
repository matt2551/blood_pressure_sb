import * as PopoverPrimitive from "@radix-ui/react-popover";
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

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

// Properties Definition for Popover (root)
const popoverPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof Popover>
> = {
  general: Section.category(PropsCategory.Content).children({
    open: Prop.boolean(),
    children: Prop.jsx(),
  }),
  interaction: Section.category(PropsCategory.Interaction).children({
    defaultOpen: Prop.boolean(),
    modal: Prop.boolean(),
  }),
  events: Section.category(PropsCategory.EventHandlers).children({
    onOpenChange: Prop.eventHandler(),
  }),
};

const popoverEditorConfig: EditorConfig = {
  icon: "modal",
  isDetached: true,
  isDraggable: false,
  description:
    "A modal popover that displays rich content in relation to a trigger element.",
};

// Properties Definition for PopoverContent
const popoverContentPropertiesDefinition: PropertiesPanelDefinition<
  React.ComponentPropsWithoutRef<typeof PopoverContent>
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
registerComponent(Popover, popoverPropertiesDefinition).editorConfig(
  popoverEditorConfig,
);
registerComponent(PopoverTrigger, childrenPropertiesDefinition);
registerComponent(PopoverContent, popoverContentPropertiesDefinition);
registerComponent(PopoverAnchor);
