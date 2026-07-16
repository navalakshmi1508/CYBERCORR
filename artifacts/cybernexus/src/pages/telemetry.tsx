import { useState } from "react";
import { useGetTelemetryEvents, getGetTelemetryEventsQueryKey, TelemetryEventSeverity } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Network, Shield, AlertCircle, Activity, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Telemetry() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: events, isLoading } = useGetTelemetryEvents(
    { 
      limit: 100,
      severity: severityFilter !== 'all' ? severityFilter as TelemetryEventSeverity : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined
    },
    {
      query: {
        queryKey: getGetTelemetryEventsQueryKey({ 
          limit: 100,
          severity: severityFilter !== 'all' ? severityFilter as TelemetryEventSeverity : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined
        }),
        refetchInterval: 10000,
      }
    }
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">CRITICAL</Badge>;
      case 'high': return <Badge variant="gold">HIGH</Badge>;
      case 'medium': return <Badge variant="blue">MEDIUM</Badge>;
      default: return <Badge variant="cyan">LOW</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'network_anomaly': return <Network className="w-4 h-4 text-purple-400" />;
      case 'endpoint_alert': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'data_exfiltration': return <ShieldAlert className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">LIVE TELEMETRY FEED</h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">Real-time signal interception</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] bg-black/50 border-primary/30 font-mono text-xs">
              <SelectValue placeholder="SEVERITY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL SEVERITIES</SelectItem>
              <SelectItem value="critical">CRITICAL</SelectItem>
              <SelectItem value="high">HIGH</SelectItem>
              <SelectItem value="medium">MEDIUM</SelectItem>
              <SelectItem value="low">LOW</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-black/50 border-primary/30 font-mono text-xs">
              <SelectValue placeholder="EVENT TYPE" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL TYPES</SelectItem>
              <SelectItem value="login_attempt">LOGIN ATTEMPT</SelectItem>
              <SelectItem value="network_anomaly">NETWORK ANOMALY</SelectItem>
              <SelectItem value="data_exfiltration">DATA EXFILTRATION</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 border-primary/20 bg-card/50 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-mono text-primary bg-primary/5 uppercase sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Event Type</th>
                <th className="px-6 py-4 font-semibold">Source / Dest</th>
                <th className="px-6 py-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    DECRYPTING STREAM...
                  </td>
                </tr>
              ) : events?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono">
                    NO SIGNALS DETECTED
                  </td>
                </tr>
              ) : (
                events?.map((event, i) => (
                  <tr key={event.id} className={`border-b border-border/50 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.timestamp), "HH:mm:ss.SSS")}
                    </td>
                    <td className="px-6 py-3">
                      {getSeverityBadge(event.severity)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        {getEventIcon(event.eventType)}
                        <span className="uppercase">{event.eventType.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">
                      <div className="text-white">{event.sourceIp}</div>
                      {event.destinationIp && <div className="text-muted-foreground">→ {event.destinationIp}</div>}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {event.description}
                      {event.isCorrelated && (
                        <Badge variant="outline" className="ml-2 border-accent text-accent text-[10px] h-5">CORRELATED</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}