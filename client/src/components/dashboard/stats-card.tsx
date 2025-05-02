import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  iconBgColor = "bg-primary-50",
  iconColor = "text-primary-600"
}: StatsCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", iconBgColor, iconColor)}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {trend && (
        <div className="mt-2">
          <span className={cn(
            "text-xs font-medium",
            trendUp ? "text-success-500" : "text-danger-500"
          )}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

export default StatsCard;
