import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Crosshair, ShieldAlert, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function Dashboard() {
  const { isAnalyst } = useAuth();
  
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      refetchInterval: 15000,
    }
  });

  if (isLoading || !summary) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-primary animate-pulse">
        <Activity className="w-6 h-6 mr-2 animate-spin" /> FETCHING TELEMETRY...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-mono text-muted-foreground tracking-wider">TOTAL ALERTS</div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-bold font-mono text-white">{summary.totalAlerts}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-accent">{summary.openAlerts}</span> open
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-mono text-muted-foreground tracking-wider">CRITICAL ALERTS</div>
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-4xl font-bold font-mono text-destructive drop-shadow-[0_0_8px_rgba(255,45,85,0.8)]">{summary.criticalAlerts}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Requires immediate action
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-mono text-muted-foreground tracking-wider">RISK SCORE</div>
              <Crosshair className="w-5 h-5 text-accent" />
            </div>
            <div className="text-4xl font-bold font-mono text-white">{summary.riskScore.toFixed(1)}<span className="text-lg text-muted-foreground">/100</span></div>
            <div className="mt-2 text-sm text-muted-foreground">
              Organization wide index
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#ffd60a]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-mono text-muted-foreground tracking-wider">QUANTUM RISK</div>
              <ShieldAlert className="w-5 h-5 text-[#ffd60a]" />
            </div>
            <div className="text-2xl font-bold font-mono uppercase text-[#ffd60a] drop-shadow-[0_0_8px_rgba(255,214,10,0.8)] mt-2">
              {summary.quantumRiskLevel}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Threat posture level
            </div>
          </CardContent>
        </Card>
      </div>

      {isAnalyst && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-primary mb-1">FALSE POSITIVE RATE</div>
                <div className="text-2xl font-mono text-white">{(summary.falsePositiveRate * 100).toFixed(1)}%</div>
              </div>
              <Activity className="w-8 h-8 text-primary opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-accent mb-1">AVG RESOLUTION TIME</div>
                <div className="text-2xl font-mono text-white">{summary.avgResolutionMinutes} <span className="text-sm text-muted-foreground">min</span></div>
              </div>
              <Clock className="w-8 h-8 text-accent opacity-50" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>THREAT VOLUME TREND</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.alertTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="alerts" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>THREAT VECTORS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={summary.threatsByCategory}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'transparent' }} axisLine={false} />
                  <Radar name="Threats" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--primary))', fontFamily: 'monospace' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ACTIVE TOP THREATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.topThreats.map(threat => (
              <div key={threat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-black/20 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${
                    threat.severity === 'critical' ? 'bg-destructive text-destructive' :
                    threat.severity === 'high' ? 'bg-orange-500 text-orange-500' :
                    threat.severity === 'medium' ? 'bg-[#ffd60a] text-[#ffd60a]' : 'bg-primary text-primary'
                  }`} />
                  <div>
                    <div className="font-bold text-white mb-1">{threat.title}</div>
                    <div className="text-sm text-muted-foreground max-w-2xl">{threat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <Badge variant="outline" className="font-mono">{threat.category.replace('_', ' ')}</Badge>
                  <div className="text-right">
                    <div className="text-xs font-mono text-muted-foreground">RISK</div>
                    <div className="font-bold font-mono text-accent">{threat.riskScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}