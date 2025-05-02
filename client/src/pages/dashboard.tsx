import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileText, DollarSign, TruckIcon, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";
import RecentOrders from "@/components/dashboard/recent-orders";
import ActivityTimeline from "@/components/dashboard/activity-timeline";
import { formatCurrency } from "@/lib/utils";
import SessionForm from "@/components/live-sessions/session-form";
import { useState } from "react";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  
  // Fetch dashboard stats data
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/orders'],
    select: (orders) => {
      const totalOrders = orders.length;
      const pendingPayments = orders.filter(order => order.status === 'reserved').length;
      const awaitingShipment = orders.filter(order => order.status === 'paid').length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.status !== 'canceled' ? order.totalAmount : 0), 0);
      
      return {
        totalOrders,
        pendingPayments,
        awaitingShipment,
        totalRevenue
      };
    }
  });
  
  return (
    <div className="flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="text-sm">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="text-sm" onClick={() => setIsCreateSessionOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            New Live Session
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={isLoadingStats ? "..." : statsData?.totalOrders || 0}
          icon={<FileText className="h-6 w-6" />}
          trend="+12% from last week"
          trendUp={true}
        />
        
        <StatsCard
          title="Pending Payments"
          value={isLoadingStats ? "..." : statsData?.pendingPayments || 0}
          icon={<DollarSign className="h-6 w-6" />}
          trend={statsData?.pendingPayments > 0 ? `${statsData.pendingPayments} need attention` : "No pending payments"}
          trendUp={false}
          iconBgColor="bg-warning-500/10"
          iconColor="text-warning-500"
        />
        
        <StatsCard
          title="Awaiting Shipment"
          value={isLoadingStats ? "..." : statsData?.awaitingShipment || 0}
          icon={<TruckIcon className="h-6 w-6" />}
          trend="All on schedule"
          trendUp={true}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />
        
        <StatsCard
          title="Total Revenue"
          value={isLoadingStats ? "..." : formatCurrency(statsData?.totalRevenue || 0)}
          icon={<DollarSign className="h-6 w-6" />}
          trend="+8% from last month"
          trendUp={true}
          iconBgColor="bg-success-500/10"
          iconColor="text-success-500"
        />
      </div>
      
      {/* Recent Orders and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders />
        <ActivityTimeline />
      </div>
      
      {/* Session creation modal */}
      <SessionForm
        open={isCreateSessionOpen}
        onOpenChange={setIsCreateSessionOpen}
        onSuccess={(sessionId) => {
          setLocation(`/live-sessions/${sessionId}`);
        }}
      />
    </div>
  );
}
