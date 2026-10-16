import React from "react";
import { PieChart as PieChartComponent, Pie, LabelList } from "recharts";

import {
  registerComponent,
  Prop,
  Section,
  PropsCategory,
} from "@superblocksteam/library";

import { cn } from "@/lib/utils";

import type { ChartConfig } from "./chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  sanitizeForCssVar,
  fixColorFormat,
} from "./chart";

type ComponentProps = Omit<
  React.ComponentPropsWithoutRef<typeof ChartContainer>,
  "children" | "config"
> & {
  data?: any[];
  valueKey?: string;
  nameKey?: string;
  labelKey?: string;
  colorKey?: string;
  colors?: string[];
  startAngle?: number;
  endAngle?: number;
  enableAnimation?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  onDataClick?: (data: any) => void;
};

const PieChart = ({ className, ...props }: ComponentProps) => {
  const chartConfig: ChartConfig = React.useMemo(() => {
    if (!props.data || !Array.isArray(props.data)) return {};

    const config: ChartConfig = {};
    props.data.forEach((item, index) => {
      const nameValue = item[props.nameKey ?? "name"];
      const labelValue = props.labelKey ? item[props.labelKey] : nameValue;
      const sanitizedName = sanitizeForCssVar(nameValue);

      // Get color from: 1) data item colorKey, 2) colors array, 3) default theme color
      const itemColor = props.colorKey ? item[props.colorKey] : undefined;
      const color = fixColorFormat(
        itemColor || props.colors?.[index] || `var(--chart-${(index % 5) + 1})`,
      );

      config[sanitizedName] = {
        label: labelValue,
        color,
      };
    });
    return config;
  }, [props.data, props.nameKey, props.labelKey, props.colorKey, props.colors]);

  const chartData = React.useMemo(() => {
    return props.data?.map((item) => {
      const nameValue = item[props.nameKey ?? "name"];
      const sanitizedName = sanitizeForCssVar(nameValue);

      const fillColor = chartConfig[sanitizedName]
        ? `var(--color-${sanitizedName})`
        : "var(--chart-1)";

      return {
        ...item,
        fill: fillColor,
      };
    });
  }, [props.data, props.nameKey, chartConfig]);

  const hasData = Array.isArray(props.data) && props.data?.length;

  return (
    <ChartContainer
      className={cn(
        "h-full w-full",
        props.showLabels ? "[&_.recharts-pie-label-text]:fill-foreground" : "",
        className,
      )}
      {...props}
      config={chartConfig}
    >
      {hasData ? (
        <PieChartComponent accessibilityLayer>
          {props.showTooltip && (
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
          )}
          {props.showLegend && (
            <ChartLegend
              content={<ChartLegendContent nameKey={props.nameKey} />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          )}
          <Pie
            data={chartData}
            dataKey={props.valueKey ?? "value"}
            nameKey={props.nameKey}
            startAngle={props.startAngle}
            endAngle={props.endAngle}
            paddingAngle={0}
            isAnimationActive={props.enableAnimation}
            label={props.showLabels}
            onClick={props.onDataClick}
          >
            {props.showLabels && (
              <LabelList
                dataKey={props.nameKey}
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            )}
          </Pie>
        </PieChartComponent>
      ) : (
        <div className="flex items-center justify-center h-full w-full min-h-32 text-muted-foreground">
          No data available
        </div>
      )}
    </ChartContainer>
  );
};

registerComponent(PieChart, {
  general: Section.category(PropsCategory.Content).children({
    data: Prop.array<any>().docs({
      description:
        "Array of objects where each object represents a pie slice. Each object should have properties for the slice name/label and numeric value. Example: [{name: 'Chrome', value: 275, color: '#4285F4'}, {name: 'Safari', value: 200}]. The nameKey, valueKey, and colorKey props specify which properties to use.",
    }),
    nameKey: Prop.string().docs({
      description:
        "The property name in your data objects that contains unique identifiers for each slice. Used to generate consistent colors and match data across renders.",
    }),
    valueKey: Prop.string().docs({
      description:
        "The property name in your data objects that contains the numeric values for each slice. These values determine slice sizes and are used in calculations for percentages and display.",
    }),
    labelKey: Prop.string().docs({
      description:
        "Optional property name for human-readable labels shown in tooltips and legends. If not specified, the nameKey value is used as the label.",
    }),
    colorKey: Prop.string().docs({
      description:
        "Optional property name in your data objects that contains color values (hex, rgb, or CSS variable). If not specified, colors are auto-assigned from the theme.",
    }),
    colors: Prop.array<string>().docs({
      description:
        "Optional array of color values to use for slices in order. Can be hex codes, rgb values, or CSS variables like 'var(--chart-1)'. Falls back to theme colors if not provided.",
    }),
  }),
  appearance: Section.category(PropsCategory.Appearance).children({
    startAngle: Prop.number(),
    endAngle: Prop.number(),
    showTooltip: Prop.boolean(),
    showLegend: Prop.boolean(),
    showLabels: Prop.boolean(),
  }),
  interaction: Section.category(PropsCategory.Interaction).children({
    enableAnimation: Prop.boolean(),
  }),
  events: Section.category(PropsCategory.EventHandlers).children({
    onDataClick: Prop.eventHandler(),
  }),
}).editorConfig({ icon: "chart" });

export { PieChart };
