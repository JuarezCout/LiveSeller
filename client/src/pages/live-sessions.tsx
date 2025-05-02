import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Video, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import SessionForm from "@/components/live-sessions/session-form";

export default function LiveSessions() {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  // Fetch live sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/live-sessions'],
    select: (data) => {
      // Sort by date (newest first)
      return [...data].sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    }
  });
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Sessions</h1>
          <p className="text-sm text-gray-500">Manage your product live streaming sessions</p>
        </div>
        <div>
          <Button onClick={() => setIsCreateSessionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Live Session
          </Button>
        </div>
      </div>
      
      {/* Sessions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{session.title}</CardTitle>
                  <Badge variant={session.isActive ? "default" : "secondary"}>
                    {session.isActive ? "Active" : "Ended"}
                  </Badge>
                </div>
                <CardDescription>
                  {session.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(session.startedAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {session.isActive 
                        ? `Started ${formatTimeAgo(session.startedAt)}`
                        : `Ended ${formatTimeAgo(session.endedAt)}`}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {formatTime(session.startedAt)}
                </span>
                <Button 
                  variant={session.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocation(`/live-sessions/${session.id}`)}
                >
                  {session.isActive ? "Manage Session" : "View Details"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Video className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No live sessions yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first live session to start selling products.
          </p>
          <Button onClick={() => setIsCreateSessionOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            New Live Session
          </Button>
        </div>
      )}
      
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
