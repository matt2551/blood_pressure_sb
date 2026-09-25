import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import React from "react";

import {
  registerComponent,
  Prop,
  Section,
  PropsCategory,
  type PropertiesPanelDefinition,
  type EditorConfig,
} from "@superblocksteam/library";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// Context
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

// ToggleGroup Component
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

// ToggleGroupItem Component
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupItem>;

// Simplified type for properties panel (avoids discriminated union issues)
interface ToggleGroupPropsForPanel {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  children?: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  onValueChange?: (value: string | string[]) => void;
}

// ToggleGroupItem Properties
const toggleGroupItemPropertiesDefinition: PropertiesPanelDefinition<ToggleGroupItemProps> =
  {
    general: Section.category(PropsCategory.Content).children({
      children: Prop.jsx(),
      value: Prop.string(),
    }),

    interaction: Section.category(PropsCategory.Interaction).children({
      disabled: Prop.boolean(),
    }),
  };

registerComponent(
  ToggleGroupItem,
  toggleGroupItemPropertiesDefinition,
).editorConfig({
  isDroppable: false,
  isDraggable: false,
});

// ToggleGroup Properties Definition
const propertiesDefinition: PropertiesPanelDefinition<ToggleGroupPropsForPanel> =
  {
    general: Section.category(PropsCategory.Content).children({
      value: Prop.any<string | string[]>(),
      type: Prop.string<"single" | "multiple">(),
      children: Prop.jsx(),
      defaultValue: Prop.any<string | string[]>(),
    }),

    appearance: Section.category(PropsCategory.Appearance).children({
      variant: Prop.string<"default" | "outline">(),
      size: Prop.string<"default" | "sm" | "lg">(),
    }),

    interaction: Section.category(PropsCategory.Interaction).children({
      disabled: Prop.boolean(),
    }),

    events: Section.category(PropsCategory.EventHandlers).children({
      onValueChange: Prop.eventHandler(),
    }),
  };

// Editor Configuration
const editorConfig: EditorConfig = {
  icon: "switch",
  description: "A group of toggle buttons for single or multiple selection",
  isDroppable: false,
};

// Registration
registerComponent(ToggleGroup, propertiesDefinition).editorConfig(editorConfig);

export { ToggleGroup, ToggleGroupItem };
