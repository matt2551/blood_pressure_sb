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

// Input Component
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

type InputProps = React.ComponentProps<typeof Input>;

// Properties Definition
const propertiesDefinition: PropertiesPanelDefinition<InputProps> = {
  general: Section.category(PropsCategory.Content).children({
    value: Prop.string(),
    defaultValue: Prop.string(),
    placeholder: Prop.string(),
    type: Prop.string<"text" | "email" | "password" | "number" | "url">(),
  }),
  appearance: Section.category(PropsCategory.Appearance).children({
    autoComplete: Prop.string(),
  }),

  interaction: Section.category(PropsCategory.Interaction)
    .children({
      disabled: Prop.boolean(),
      readOnly: Prop.boolean(),
      autoFocus: Prop.boolean(),
    })
    .add({
      minLength: Prop.number(),
      maxLength: Prop.number(),
    })
    .add({
      min: Prop.number(),
      max: Prop.number(),
      step: Prop.number(),
    }),

  events: Section.category(PropsCategory.EventHandlers).children({
    onChange: Prop.eventHandler(),
    onFocus: Prop.eventHandler(),
    onBlur: Prop.eventHandler(),
    onKeyDown: Prop.eventHandler(),
  }),
};

// Editor Configuration
const editorConfig: EditorConfig = {
  icon: "input",
  description: "A versatile input component for collecting user data",
};

// Registration
registerComponent(Input, propertiesDefinition).editorConfig(editorConfig);

export { Input };
