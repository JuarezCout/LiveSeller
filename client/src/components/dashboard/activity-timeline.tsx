import { Check, Plus, DollarSign } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

type ActivityType = "payment" | "product" | "session";

interface Activity {
  id: number;
  type: ActivityType;
  text: string;
  timestamp: Date | string;
  highlightedText?: string;
}

interface ActivityItemProps {
  activity: Activity;
}

function ActivityIcon({ type }: { type: ActivityType }) {
  switch (type) {
    case "payment":
      return (
        <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      );
    case "product":
      return (
        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
          <Plus className="h-3 w-3 text-white" />
        </div>
      );
    case "session":
      return (
        <div className="h-6 w-6 rounded-full bg-warning-500 flex items-center justify-center">
          <DollarSign className="h-3 w-3 text-white" />
        </div>
      );
    default:
      return (
        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      );
  }
}

function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <li className="relative flex gap-4">
      <div className="absolute left-0 top-0 flex w-6 justify-center">
        <ActivityIcon type={activity.type} />
      </div>
      <div className="ml-6 flex-1">
        <p className="text-sm text-gray-900">
          {activity.text}
          {activity.highlightedText && (
            <span className="font-medium"> {activity.highlightedText}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {formatTimeAgo(activity.timestamp)}
        </p>
      </div>
    </li>
  );
}

export function ActivityTimeline() {
  // Sample data - would be replaced with actual data from API
  const activities: Activity[] = [
    {
      id: 1,
      type: "payment",
      text: "New payment confirmed from",
      highlightedText: "Maria Alvarez",
      timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    },
    {
      id: 2,
      type: "product",
      text: "New product added:",
      highlightedText: "Summer Dress - Floral",
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    },
    {
      id: 3,
      type: "session",
      text: "Started live session",
      highlightedText: "Summer Collection 2023",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ];

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        <ol className="space-y-6">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </ol>
      </div>
    </div>
  );
}

export default ActivityTimeline;
