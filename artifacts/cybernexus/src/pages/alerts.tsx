import { useState } from "react";
import { useGetAlerts, getGetAlertsQueryKey, useGetAlert, getGetAlertQueryKey, useSubmitAlertFeedback, AlertSeverity, AlertStatus } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ShieldAlert, Crosshair, X, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const { isAnalyst } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");

  const { data: alerts, isLoading } = useGetAlerts(
    { 
      status: statusFilter !== 'all' ? statusFilter as AlertStatus : undefined,
      severity: severityFilter !== 'all' ? severityFilter as AlertSeverity : undefined,
      limit: 50 
    },
    { 
      query: { 
        queryKey: getGetAlertsQueryKey({ 
          status: statusFilter !== 'all' ? statusFilter as AlertStatus : undefined,
          severity: severityFilter !== 'all' ? severityFilter as AlertSeverity : undefined,
          limit: 50 
        }),
        refetchInterval: 15000
      } 
    }
  );

  const { data: detail, isLoading: detailLoading } = useGetAlert(
    selectedId!,
    { query: { enabled: !!selectedId, queryKey: getGetAlertQueryKey(selectedId!) } }
  );

  const feedbackMut = useSubmitAlertFeedback();

  const handleFeedback = (status: 'true_positive' | 'false_positive' | 'resolved') => {
    if (!selectedId) return;
    feedbackMut.mutate({
      id: selectedId,
      data: { status, note: feedbackNote }
    }, {
      onSuccess: () => {
        toast({ title: "Feedback Submitted", description: "Alert status updated successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        setSelectedId(null);
        setFeedbackNote("");
      }
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Alert List */}
      <div className={`flex-1 flex flex-col min-h-0 space-y-4 ${selectedId ? 'hidden lg:flex lg:w-1/2' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border">
          <div>
            <h2 className="text-xl font-bold font-mono text-white tracking-tight">THREAT ALERTS</h2>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[130px] font-mono text-xs">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="open">OPEN</SelectItem>
                <SelectItem value="resolved">RESOLVED</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[130px] font-mono text-xs">
                <SelectValue placeholder="SEVERITY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL SEV</SelectItem>
                <SelectItem value="critical">CRITICAL</SelectItem>
                <SelectItem value="high">HIGH</SelectItem>
                <SelectItem value="medium">MEDIUM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center font-mono text-muted-foreground mt-10">LOADING...</div>
          ) : alerts?.length === 0 ? (
            <div className="text-center font-mono text-muted-foreground mt-10">NO ALERTS FOUND</div>
          ) : (
            alerts?.map(alert => (
              <div 
                key={alert.id} 
                onClick={() => setSelectedId(alert.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                  selectedId === alert.id 
                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,245,255,0.1)]' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                {alert.severity === 'critical' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive shadow-[0_0_10px_rgba(255,45,85,1)]" />
                )}
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'gold' : 'blue'}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">{alert.category.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{format(new Date(alert.createdAt), "MMM dd, HH:mm")}</div>
                </div>
                <div className="pl-2">
                  <h3 className="font-bold text-white mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs font-mono flex items-center gap-2">
                      <span className="text-muted-foreground">RISK:</span>
                      <span className={`font-bold ${alert.riskScore > 80 ? 'text-destructive' : 'text-primary'}`}>{alert.riskScore}</span>
                    </div>
                    {alert.status !== 'open' && (
                      <Badge variant="secondary" className="bg-white/10 text-white text-[10px]">{alert.status.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedId && (
        <div className="w-full lg:w-1/2 flex flex-col h-full bg-card rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(0,245,255,0.05)] overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-black/40">
            <h3 className="font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" /> ALERT INTELLIGENCE
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {detailLoading || !detail ? (
              <div className="text-center font-mono text-primary animate-pulse mt-10">ANALYZING THREAT...</div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{detail.alert.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{detail.alert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-border">
                    <div className="text-xs text-muted-foreground font-mono mb-1">RISK SCORE</div>
                    <div className="text-3xl font-mono text-destructive font-bold">{detail.alert.riskScore}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-border">
                    <div className="text-xs text-muted-foreground font-mono mb-1">AI CONFIDENCE</div>
                    <div className="text-3xl font-mono text-primary font-bold">{Math.round(detail.xaiExplanation.confidence * 100)}%</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-mono text-primary mb-3 uppercase tracking-wider">AI Analysis</div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm leading-relaxed text-white">
                    {detail.xaiExplanation.summary}
                  </div>
                </div>

                {detail.correlationPath && detail.correlationPath.length > 0 && (
                  <div>
                    <div className="text-sm font-mono text-accent mb-3 uppercase tracking-wider">Attack Path</div>
                    <div className="space-y-2">
                      {detail.correlationPath.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-xs font-mono text-accent z-10 relative">
                            {idx + 1}
                          </div>
                          <div className="flex-1 bg-black/40 p-2 rounded border border-border/50 text-sm font-mono text-muted-foreground">
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAnalyst && detail.alert.status === 'open' && (
                  <div className="pt-6 border-t border-border mt-auto">
                    <div className="text-sm font-mono text-white mb-3">ANALYST ACTION</div>
                    <textarea 
                      className="w-full bg-black/50 border border-border rounded-md p-3 text-sm font-mono focus:outline-none focus:border-primary text-white mb-4 resize-none h-24"
                      placeholder="Add investigation notes..."
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => handleFeedback('true_positive')} disabled={feedbackMut.isPending}>
                        <CheckCircle className="w-4 h-4 mr-2" /> TRUE POS
                      </Button>
                      <Button variant="outline" className="border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-white" onClick={() => handleFeedback('false_positive')} disabled={feedbackMut.isPending}>
                        <XCircle className="w-4 h-4 mr-2" /> FALSE POS
                      </Button>
                      <Button variant="default" className="bg-primary hover:bg-primary/80 text-black" onClick={() => handleFeedback('resolved')} disabled={feedbackMut.isPending}>
                        MARK RESOLVED
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}