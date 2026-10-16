import type * as React from "react";

import { registerComponent } from "@superblocksteam/library";
import {
  Prop,
  Section,
  PropsCategory,
  type PropertiesPanelDefinition,
} from "@superblocksteam/library";
import { type EditorConfig } from "@superblocksteam/library";

import { cn } from "@/lib/utils";

// Main Component
function Textarea({
  className,
  style,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      data-slot="textarea"
      style={style}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
    />
  );
}

// Types
type TextareaProps = React.ComponentProps<"textarea">;

// Properties Definition
const propertiesDefinition: PropertiesPanelDefinition<TextareaProps> = {
  general: Section.category(PropsCategory.Content).children({
    value: Prop.string(),
    defaultValue: Prop.string(),
    placeholder: Prop.string(),
    rows: Prop.number(),
  }),

  interaction: Section.category(PropsCategory.Interaction).children({
    disabled: Prop.boolean(),
    readOnly: Prop.boolean(),
    autoFocus: Prop.boolean(),
    minLength: Prop.number(),
    maxLength: Prop.number(),
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
  description:
    "A multi-line textarea component for collecting longer text input",
};

// Registration
registerComponent(Textarea, propertiesDefinition).editorConfig(editorConfig);

export { Textarea };
