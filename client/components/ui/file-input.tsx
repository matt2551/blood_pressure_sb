import type { IconName } from "lucide-react/dynamic";
import React from "react";

import { registerComponent } from "@superblocksteam/library";
import {
  Prop,
  Section,
  PropsCategory,
  type PropertiesPanelDefinition,
  type EditorConfig,
} from "@superblocksteam/library";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types
type FileInputProps = React.ComponentPropsWithoutRef<typeof Input> & {
  acceptedFileTypes?: string[];
  icon?: string;
  iconPosition?: "left" | "right";
};

// Main Component
const FileInput = ({
  acceptedFileTypes,
  style,
  multiple,
  icon,
  iconPosition,
  children: _children,
  ...props
}: FileInputProps) => {
  const accept = React.useMemo(
    () => (acceptedFileTypes ? acceptedFileTypes.join(",") : undefined),
    [acceptedFileTypes],
  );

  if (icon) {
    const isLeft = iconPosition === "left";
    return (
      <div className={cn("relative", props.className)} style={style}>
        <Input
          className={cn(isLeft ? "pl-10" : "pr-10")}
          type="file"
          accept={accept}
          {...props}
        />
        <div
          className={cn(
            "absolute inset-y-0 flex items-center pointer-events-none",
            isLeft ? "left-0 pl-3" : "right-0 pr-3",
          )}
        >
          <Icon
            icon={icon as IconName}
            style={{
              width: 16,
              height: 16,
            }}
          />
        </div>
      </div>
    );
  }

  return <Input style={style} type="file" accept={accept} {...props} />;
};

// Properties Definition
const propertiesDefinition: PropertiesPanelDefinition<FileInputProps> = {
  general: Section.category(PropsCategory.Content).children({
    multiple: Prop.boolean(),
    acceptedFileTypes: Prop.array<string>(),
    icon: Prop.string<string>().docs({
      description:
        "The icon to display in the component. You can use the Lucide icon library to find the icon you want.",
    }),
    iconPosition: Prop.string<"left" | "right">(),
  }),

  interaction: Section.category(PropsCategory.Interaction).children({
    disabled: Prop.boolean(),
    required: Prop.boolean(),
    readOnly: Prop.boolean(),
    autoFocus: Prop.boolean(),
  }),

  events: Section.category(PropsCategory.EventHandlers).children({
    onChange: Prop.eventHandler(),
    onFocus: Prop.eventHandler(),
    onBlur: Prop.eventHandler(),
  }),
};

// Editor Configuration
const editorConfig: EditorConfig = {
  icon: "file-picker",
  description: "A file input component",
};

// Registration
registerComponent(FileInput, propertiesDefinition).editorConfig(editorConfig);

export { FileInput };
