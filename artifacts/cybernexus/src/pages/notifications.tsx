import { useGetNotifications, getGetNotificationsQueryKey, useMarkNotificationRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, ShieldAlert, Activity, Check } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey() }
  });
  
  const markReadMut = useMarkNotificationRead();

  const handleMarkRead = (id: number) => {
    markReadMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert_critical': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'alert_high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'quantum_risk': return <ShieldAlert className="w-5 h-5 text-[#ffd60a]" />;
      default: return <Activity className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-white" />
        <h2 className="text-2xl font-bold font-mono text-white tracking-tight">COMMUNICATIONS LINK</h2>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="p-0">
          {isLoading ? (
             <div className="p-8 text-center text-muted-foreground font-mono">SYNCING MESSAGES...</div>
          ) : notifications?.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground font-mono">NO NEW COMMUNICATIONS</div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications?.map(notif => (
                <div key={notif.id} className={`p-4 flex gap-4 transition-colors ${notif.isRead ? 'opacity-60 bg-transparent' : 'bg-primary/5 hover:bg-primary/10'}`}>
                  <div className="mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold ${notif.isRead ? 'text-muted-foreground' : 'text-white'}`}>{notif.title}</h4>
                      <span className="text-xs font-mono text-muted-foreground">{format(new Date(notif.createdAt), "MMM dd HH:mm")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkRead(notif.id)}
                      className="self-center p-2 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}