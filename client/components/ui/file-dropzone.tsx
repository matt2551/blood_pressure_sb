import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Upload, Trash, File, Image } from "lucide-react";
import React from "react";
import { useEffect } from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";

import { registerComponent } from "@superblocksteam/library";
import {
  Prop,
  Section,
  PropsCategory,
  type PropertiesPanelDefinition,
  type EditorConfig,
} from "@superblocksteam/library";

import { cn } from "@/lib/utils";

import { Button } from "./button";

// Variants
const dropzoneVariants = cva(
  "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        idle: "",
        active: "border-primary bg-primary/5 border-solid",
        accept:
          "border-green-500 bg-green-50 border-solid dark:bg-green-950/20",
        reject: "border-destructive bg-destructive/5 border-solid",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  },
);

type DropzoneVariantProps = VariantProps<typeof dropzoneVariants>;

// Types
interface DropzoneProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop">,
    DropzoneVariantProps {
  onDrop?: (acceptedFiles: File[]) => void;
  onDropAccepted?: (files: File[]) => void;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
  onFileRemove?: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  showFileList?: boolean;
  placeholder?: string;
  files: File[];
}

// Utility Functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Sub-Components
const FilePreview = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove?: () => void;
}) => {
  const isImage = file.type.startsWith("image/");
  const preview = React.useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, isImage]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md">
      <div className="flex-shrink-0">
        {isImage && preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-8 h-8 object-cover rounded"
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
            {isImage ? (
              <Image className="w-4 h-4" />
            ) : (
              <File className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground cursor-pointer"
          onClick={onRemove}
        >
          <Trash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const DropArea = ({
  placeholder,
  acceptedFileTypes,
  maxSize,
}: Pick<DropzoneProps, "placeholder" | "acceptedFileTypes" | "maxSize">) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Upload className="w-6 h-6 mb-4 text-muted-foreground" />
      <div className="space-y-2">
        <p className="text-sm">{placeholder}</p>
        <p className="text-xs text-muted-foreground">
          {acceptedFileTypes
            ? `Accepted formats: ${acceptedFileTypes.join(", ")}`
            : "All file types accepted"}
        </p>
        {maxSize && (
          <p className="text-xs text-muted-foreground">
            Max. file size: {formatFileSize(maxSize)}
          </p>
        )}
      </div>
    </div>
  );
};

const FileListPreview = ({
  files,
  onFileRemove,
}: Pick<DropzoneProps, "files" | "onFileRemove">) => {
  return (
    <div className="space-y-2">
      <h4 className="text-xs">Uploads ({files.length})</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {files.map((file, index) => (
          <FilePreview
            key={`${file.name}-${index}`}
            file={file}
            onRemove={onFileRemove ? () => onFileRemove(file) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  function Dropzone(
    {
      className,
      onDrop,
      onDropAccepted,
      onDropRejected,
      onFileRemove,
      acceptedFileTypes,
      maxFiles,
      maxSize,
      minSize,
      multiple,
      disabled,
      showFileList = true,
      placeholder,
      files,
      ...props
    },
    ref,
  ) {
    const dropzoneOptions: DropzoneOptions = {
      onDrop: (acceptedFiles, fileRejections) => {
        onDrop?.(acceptedFiles);
        if (acceptedFiles.length > 0) {
          onDropAccepted?.(acceptedFiles);
        }
        if (fileRejections.length > 0) {
          onDropRejected?.(fileRejections);
        }
      },
      accept: acceptedFileTypes
        ? acceptedFileTypes.reduce(
            (acc, type) => {
              acc[type] = [];
              return acc;
            },
            {} as Record<string, string[]>,
          )
        : undefined,
      maxFiles,
      maxSize,
      minSize,
      multiple,
      disabled,
    };

    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject,
    } = useDropzone(dropzoneOptions);

    const getState = () => {
      if (isDragReject) return "reject";
      if (isDragAccept) return "accept";
      if (isDragActive) return "active";
      return "idle";
    };

    return (
      <div className={cn("w-full space-y-4", className)} {...props}>
        <div
          ref={ref}
          {...(getRootProps() as any)}
          className={cn(
            "p-8 min-h-[160px]",
            dropzoneVariants({ state: getState() }),
          )}
        >
          <input {...getInputProps()} />

          <DropArea
            placeholder={placeholder}
            acceptedFileTypes={acceptedFileTypes}
            maxSize={maxSize}
          />
        </div>
        {showFileList && files.length > 0 && (
          <FileListPreview files={files} onFileRemove={onFileRemove} />
        )}
      </div>
    );
  },
);

Dropzone.displayName = "Dropzone";

// Properties Definition
const propertiesDefinition: PropertiesPanelDefinition<DropzoneProps> = {
  general: Section.category(PropsCategory.Content).children({
    placeholder: Prop.string(),
    acceptedFileTypes: Prop.array<string>(),
    multiple: Prop.boolean(),
    maxFiles: Prop.number(),
  }),

  appearance: Section.category(PropsCategory.Appearance).children({
    showFileList: Prop.boolean(),
  }),

  interaction: Section.category(PropsCategory.Interaction).children({
    disabled: Prop.boolean(),
    maxSize: Prop.number(),
    minSize: Prop.number(),
  }),

  events: Section.category(PropsCategory.EventHandlers).children({
    onDrop: Prop.eventHandler(),
    onDropAccepted: Prop.eventHandler(),
    onDropRejected: Prop.eventHandler(),
    onFileRemove: Prop.eventHandler(),
  }),
};

// Editor Configuration
const editorConfig: EditorConfig = {
  icon: "file-picker",
  description: "A versatile file upload component with drag and drop support",
  hasExtendedClickArea: true,
};

// Registration
registerComponent(Dropzone, propertiesDefinition).editorConfig(editorConfig);

export { Dropzone };
