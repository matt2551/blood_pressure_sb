import React from "react";
import {
  AreaChart as AreaChartComponent,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  registerComponent,
  Prop,
  Section,
  PropsCategory,
  type EditorConfig,
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
  createKeyMapping,
} from "./chart";

type ComponentProps = Omit<
  React.ComponentPropsWithoutRef<typeof ChartContainer>,
  "children" | "config"
> & {
  data?: any[];
  xAxisKey?: string;
  categories?: string[];
  seriesLabels?: Record<string, string>;
  colors?: string[];
  gridStyle?: "solid" | "dashed" | "hidden";
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  areaType?:
    | "monotone"
    | "linear"
    | "step"
    | "bump"
    | "basis"
    | "stepBefore"
    | "stepAfter"
    | "natural";
  useGradient?: boolean;
  fillOpacity?: number;
  strokeWidth?: number;
  connectNulls?: boolean;
  enableAnimation?: boolean;
  showDots?: boolean;
  onDataClick?: (data: any) => void;
};

const AreaChart = ({ className, ...props }: ComponentProps) => {
  const chartConfig: ChartConfig = React.useMemo(() => {
    const effectiveCategories =
      props.categories && props.categories.length > 0
        ? props.categories
        : props.data && props.data.length > 0
          ? Object.keys(props.data[0]).filter((key) => {
              if (key === props.xAxisKey) return false;
              const value = props.data![0][key];
              return typeof value === "number";
            })
          : [];

    if (!effectiveCategories.length) return {};

    const config: ChartConfig = {};
    effectiveCategories.forEach((key, index) => {
      const sanitizedKey = sanitizeForCssVar(key);
      const label = props.seriesLabels?.[key] || key;
      const color = fixColorFormat(
        props.colors?.[index] || `var(--chart-${(index % 5) + 1})`,
      );

      config[sanitizedKey] = {
        label,
        color,
      };
    });

    return config;
  }, [
    props.categories,
    props.seriesLabels,
    props.colors,
    props.data,
    props.xAxisKey,
  ]);

  const keyMapping = React.useMemo(() => {
    const effectiveCategories =
      props.categories && props.categories.length > 0
        ? props.categories
        : props.data && props.data.length > 0
          ? Object.keys(props.data[0]).filter((key) => {
              if (key === props.xAxisKey) return false;
              const value = props.data![0][key];
              return typeof value === "number";
            })
          : [];

    return effectiveCategories.length > 0
      ? createKeyMapping(
          Object.fromEntries(effectiveCategories.map((k) => [k, { label: k }])),
        )
      : new Map();
  }, [props.categories, props.data, props.xAxisKey]);

  const hasData = Array.isArray(props.data) && props.data?.length;

  const renderGradients = () => {
    if (!props.useGradient || !hasData) return null;

    return (
      <defs>
        {Object.keys(chartConfig).map((key) => {
          return (
            <linearGradient
              key={key}
              id={`${key}-gradient`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={chartConfig[key]?.color}
                stopOpacity={props.fillOpacity}
              />
              <stop
                offset="100%"
                stopColor={chartConfig[key]?.color}
                stopOpacity={0.05}
              />
            </linearGradient>
          );
        })}
      </defs>
    );
  };

  return (
    <ChartContainer
      className={cn("h-full w-full pt-4 pb-4 pr-4", className)}
      {...props}
      config={chartConfig}
    >
      {hasData ? (
        <AreaChartComponent
          data={props.data}
          onClick={props.onDataClick}
          accessibilityLayer
        >
          {renderGradients()}

          {props.gridStyle !== "hidden" && (
            <CartesianGrid
              vertical={false}
              strokeDasharray={props.gridStyle === "dashed" ? "3 3" : "0"}
            />
          )}

          {props.showXAxis && (
            <XAxis
              dataKey={props.xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
          )}

          {props.showYAxis && (
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          )}

          {props.showTooltip && (
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          )}

          {props.showLegend && <ChartLegend content={<ChartLegendContent />} />}

          {Object.keys(chartConfig).map((key) => {
            // Use memoized mapping instead of O(n²) find operation
            const originalKey = keyMapping.get(key) || key;
            const effectiveFillOpacity = props.useGradient
              ? 1
              : props.fillOpacity;
            const wouldHideChart =
              props.fillOpacity === 0 && props.strokeWidth === 0;

            return (
              <Area
                key={key}
                dataKey={originalKey}
                type={props.areaType}
                fill={
                  props.useGradient
                    ? `url(#${key}-gradient)`
                    : `var(--color-${key})`
                }
                {...(!wouldHideChart && { fillOpacity: effectiveFillOpacity })}
                stroke={`var(--color-${key})`}
                {...(!wouldHideChart && { strokeWidth: props.strokeWidth })}
                connectNulls={props.connectNulls}
                isAnimationActive={props.enableAnimation}
                activeDot={{
                  fill: `var(--color-${key})`,
                  strokeWidth: 2,
                  r: 4,
                }}
                dot={
                  props.showDots
                    ? {
                        fill: `var(--color-${key})`,
                        strokeWidth: 2,
                        r: 2,
                      }
                    : false
                }
              />
            );
          })}
        </AreaChartComponent>
      ) : (
        <div className="flex items-center justify-center h-full w-full min-h-32 text-muted-foreground">
          No data available
        </div>
      )}
    </ChartContainer>
  );
};

const properties = {
  general: Section.category(PropsCategory.Content).children({
    data: Prop.array<any>().docs({
      description:
        "Array of objects where each object represents a data point with X-axis and Y-axis values. Each object should contain the xAxisKey property and properties for each data series defined in categories. Example: [{month: 'January', desktop: 186, mobile: 80}, {month: 'February', desktop: 305, mobile: 200}]. Multiple Y-value properties create multiple area series.",
    }),

    xAxisKey: Prop.string().docs({
      description:
        "The property name in your data objects that contains the X-axis values (categories, dates, or labels). This determines the horizontal positioning of data points. Should be consistent across all data objects.",
    }),

    categories: Prop.array<string>().docs({
      description:
        "Array of property names from your data objects to plot as separate area series. Example: ['desktop', 'mobile'] will create two area series. Each category should correspond to a numeric property in your data. If not provided, automatically detects all numeric properties (excluding xAxisKey) from the data.",
    }),

    seriesLabels: Prop.any<Record<string, string>>().docs({
      description:
        "Optional object mapping category keys to display labels. Example: {desktop: 'Desktop Users', mobile: 'Mobile Users'}. If not provided, the category keys are used as labels.",
    }),

    colors: Prop.array<string>().docs({
      description:
        "Optional array of color values to use for series in order. Can be hex codes, rgb values, or CSS variables like 'var(--chart-1)'. Falls back to theme colors if not provided.",
    }),
  }),
  appearance: Section.category(PropsCategory.Appearance).children({
    gridStyle: Prop.string<"solid" | "dashed" | "hidden">(),
    showXAxis: Prop.boolean(),
    showYAxis: Prop.boolean(),
    showTooltip: Prop.boolean(),
    showLegend: Prop.boolean(),
    fillOpacity: Prop.number(),
    strokeWidth: Prop.number(),
    useGradient: Prop.boolean(),
    showDots: Prop.boolean(),
    connectNulls: Prop.boolean(),
    areaType: Prop.string<
      | "linear"
      | "bump"
      | "step"
      | "basis"
      | "stepBefore"
      | "stepAfter"
      | "natural"
      | "monotone"
    >().docs({
      description:
        "Curve interpolation type for area paths. 'linear' creates straight lines, 'monotone' creates smooth curves that preserve monotonicity, 'natural' creates natural spline curves, 'step' creates step functions, 'basis' creates B-spline curves, 'bump' creates rounded bumps, 'stepBefore' steps before point, 'stepAfter' steps after point.",
    }),
  }),
  interaction: Section.category(PropsCategory.Interaction).children({
    enableAnimation: Prop.boolean(),
  }),
  events: Section.category(PropsCategory.EventHandlers).children({
    onDataClick: Prop.eventHandler(),
  }),
};

const editorConfig: EditorConfig = {
  icon: "chart",
};

registerComponent(AreaChart, properties).editorConfig(editorConfig);

export { AreaChart };
