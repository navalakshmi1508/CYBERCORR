import { useState } from "react";
import { useGetUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, User, AlertTriangle, Smartphone, MapPin,
  ShieldAlert, Activity, ChevronRight, X,
  Fingerprint, Globe, Clock, TrendingUp,
  Lock, BrainCircuit, Network, Cpu
} from "lucide-react";

// Deterministic mock enrichment based on user ID
function getCustomerProfile(userId: number, name: string, email: string, department: string) {
  const riskSeeds = [91, 47, 78, 23, 65, 82, 34, 56];
  const alertSeeds = [5, 2, 4, 1, 3, 5, 1, 2];
  const deviceSeeds = [3, 2, 4, 1, 2, 3, 2, 2];
  const statusSeeds = ['CRITICAL', 'CLEAR', 'HIGH RISK', 'CLEAR', 'ELEVATED', 'HIGH RISK', 'CLEAR', 'ELEVATED'];
  const locationSeeds = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
  const lastTxSeeds = ['₹48,500', '₹2,200', '₹15,999', '₹890', '₹25,000', '₹67,200', '₹320', '₹1,500'];
  const threatSeeds = ['Account Takeover', 'None', 'Data Exfil', 'None', 'Structuring', 'Wire Fraud', 'None', 'Crypto Risk'];

  const i = (userId - 1) % 8;
  return {
    customerId: `IND${10000 + userId * 37}`,
    riskScore: riskSeeds[i],
    alertCount: alertSeeds[i],
    deviceCount: deviceSeeds[i],
    status: statusSeeds[i],
    lastLogin: locationSeeds[i],
    lastTransaction: lastTxSeeds[i],
    currentThreat: threatSeeds[i],
    department,
  };
}

function getRiskColor(score: number) {
  if (score >= 75) return 'text-destructive border-destructive/50 bg-destructive/10';
  if (score >= 50) return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
  if (score >= 30) return 'text-[#FFB300] border-[#FFB300]/50 bg-[#FFB300]/10';
  return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
}

function getStatusColor(status: string) {
  if (status === 'CRITICAL') return 'bg-destructive/20 text-destructive border-destructive/50';
  if (status === 'HIGH RISK') return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  if (status === 'ELEVATED') return 'bg-[#FFB300]/20 text-[#FFB300] border-[#FFB300]/50';
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
}

function InvestigationPanel({ user, profile, onClose }: {
  user: any; profile: ReturnType<typeof getCustomerProfile>; onClose: () => void;
}) {
  const riskBarWidth = `${profile.riskScore}%`;
  const mitreMap: Record<string, string[]> = {
    'Account Takeover': ['T1078 - Valid Accounts', 'T1110 - Brute Force', 'T1539 - Steal Session Cookie'],
    'Data Exfil': ['T1041 - Exfiltration Over C2', 'T1567 - Exfil to Cloud', 'T1083 - File Discovery'],
    'Structuring': ['T1036 - Masquerading', 'T1078 - Valid Accounts'],
    'Wire Fraud': ['T1657 - Financial Theft', 'T1078 - Valid Accounts', 'T1534 - Internal Spearphishing'],
    'Crypto Risk': ['T1657 - Financial Theft', 'T1041 - C2 Channel'],
    'None': [],
  };
  const mitre = mitreMap[profile.currentThreat] || [];

  const behaviors = [
    { time: '14:27', event: 'Login from Lagos, NG (impossible travel)', type: 'critical' },
    { time: '14:23', event: 'Login from London, UK — session active', type: 'normal' },
    { time: '12:15', event: `Transaction ₹48,500 — wire transfer initiated`, type: 'warning' },
    { time: '09:30', event: 'Standard login from home IP', type: 'normal' },
    { time: '08:45', event: 'Password change requested', type: 'warning' },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l border-primary/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-black/40 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg font-mono">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white font-mono">{user.name}</div>
            <div className="text-xs text-muted-foreground">{profile.customerId} · {user.department}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Risk Meter */}
        <div className="p-4 rounded-xl border border-border bg-black/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-muted-foreground">RISK SCORE</span>
            <span className={`text-2xl font-bold font-mono ${profile.riskScore >= 75 ? 'text-destructive' : profile.riskScore >= 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {profile.riskScore}<span className="text-sm text-muted-foreground">/100</span>
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${profile.riskScore >= 75 ? 'bg-destructive' : profile.riskScore >= 50 ? 'bg-orange-400' : 'bg-emerald-400'}`}
              style={{ width: riskBarWidth }}
            />
          </div>
        </div>

        {/* AI Explanation */}
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono text-primary">
            <BrainCircuit className="w-4 h-4" /> AI EXPLANATION
          </div>
          <div className="space-y-1.5">
            {profile.currentThreat !== 'None' && [
              'Login from unfamiliar device / IP',
              'Geographic impossibility detected',
              `High-value transaction above baseline`,
              'Behavioural deviation: 4.7σ',
              'Device cluster linked to fraud ring',
            ].map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80 font-mono">
                <span className="text-primary">✓</span> {reason}
              </div>
            ))}
            {profile.currentThreat === 'None' && (
              <div className="text-emerald-400 font-mono text-sm">✓ No anomalies detected — baseline behaviour</div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-primary/20 grid grid-cols-2 gap-3 text-xs font-mono">
            <div><span className="text-muted-foreground">AI Confidence:</span> <span className="text-white">{profile.riskScore > 50 ? '94%' : '89%'}</span></div>
            <div><span className="text-muted-foreground">Prediction:</span> <span className={profile.riskScore > 75 ? 'text-destructive' : profile.riskScore > 50 ? 'text-orange-400' : 'text-emerald-400'}>{profile.currentThreat !== 'None' ? `Likely ${profile.currentThreat}` : 'Low Risk'}</span></div>
          </div>
        </div>

        {/* Behaviour Timeline */}
        <div className="p-4 rounded-xl border border-border bg-black/20">
          <div className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> BEHAVIOUR TIMELINE</div>
          <div className="space-y-2">
            {behaviors.map((b, i) => (
              <div key={i} className="flex gap-3 items-start text-xs font-mono">
                <span className="text-muted-foreground shrink-0">{b.time}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${b.type === 'critical' ? 'bg-destructive' : b.type === 'warning' ? 'bg-[#FFB300]' : 'bg-emerald-400'}`} />
                <span className={b.type === 'critical' ? 'text-destructive' : b.type === 'warning' ? 'text-[#FFB300]' : 'text-muted-foreground'}>{b.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-border bg-black/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">DEVICES</div>
            <div className="text-xl font-bold text-white font-mono mt-1">{profile.deviceCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-black/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">OPEN ALERTS</div>
            <div className={`text-xl font-bold font-mono mt-1 ${profile.alertCount > 3 ? 'text-destructive' : 'text-orange-400'}`}>{profile.alertCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-black/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">LAST LOGIN</div>
            <div className="text-sm font-bold text-white font-mono mt-1">{profile.lastLogin}</div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-black/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">LAST TX</div>
            <div className="text-sm font-bold text-white font-mono mt-1">{profile.lastTransaction}</div>
          </div>
        </div>

        {/* MITRE ATT&CK */}
        {mitre.length > 0 && (
          <div className="p-4 rounded-xl border border-[#7C4DFF]/30 bg-[#7C4DFF]/5">
            <div className="text-xs font-mono text-[#7C4DFF] mb-3 flex items-center gap-2"><Network className="w-3.5 h-3.5" /> MITRE ATT&CK MAPPING</div>
            <div className="space-y-1.5">
              {mitre.map((t, i) => (
                <div key={i} className="text-xs font-mono text-white/70 flex items-center gap-2">
                  <span className="text-[#7C4DFF]">›</span> {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        <div className={`p-4 rounded-xl border ${profile.riskScore >= 75 ? 'border-destructive/30 bg-destructive/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
          <div className={`text-xs font-mono font-bold mb-2 flex items-center gap-2 ${profile.riskScore >= 75 ? 'text-destructive' : 'text-emerald-400'}`}>
            <ShieldAlert className="w-4 h-4" /> RECOMMENDED ACTION
          </div>
          <div className="text-white font-mono text-sm">
            {profile.riskScore >= 75
              ? 'Freeze account immediately. Escalate to Tier-2 SOC. Initiate forensic data hold. Contact customer via verified secondary channel.'
              : profile.riskScore >= 50
              ? 'Flag account for enhanced monitoring. Request step-up authentication on next login. Review last 30 days of transactions.'
              : 'No immediate action required. Continue standard monitoring cycle.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, isLoading } = useGetUsers({ query: { queryKey: ['users'] } });

  const filtered = users?.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border">
      {/* Left: Customer List */}
      <div className={`flex flex-col min-h-0 ${selectedUser ? 'hidden lg:flex lg:w-1/2' : 'w-full'} border-r border-border`}>
        {/* Search Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm space-y-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold font-mono text-white">CUSTOMER INVESTIGATION PANEL</h2>
            <p className="text-xs text-muted-foreground font-mono">Select a customer to open investigation view</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-black/30 border-border font-mono text-sm"
              placeholder="Search by name, email, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-primary font-mono animate-pulse"><Activity className="inline mr-2 animate-spin" /> LOADING CUSTOMERS...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono">NO CUSTOMERS FOUND</div>
          ) : (
            filtered.map(u => {
              const profile = getCustomerProfile(u.id, u.name, u.email, u.department ?? 'Unknown');
              const isSelected = selectedUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : profile.riskScore >= 75
                      ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/60'
                      : profile.riskScore >= 50
                      ? 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50'
                      : 'border-border bg-black/20 hover:border-primary/40'
                  }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold font-mono text-primary">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{profile.customerId} · {u.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-[10px] font-mono ${getStatusColor(profile.status)}`}>
                        {profile.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div className="text-center">
                      <div className={`text-lg font-bold font-mono ${profile.riskScore >= 75 ? 'text-destructive' : profile.riskScore >= 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {profile.riskScore}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono">RISK</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono text-white">{profile.deviceCount}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">DEVICES</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold font-mono ${profile.alertCount >= 4 ? 'text-destructive' : 'text-[#FFB300]'}`}>{profile.alertCount}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">ALERTS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold font-mono text-white truncate">{profile.lastLogin}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">LOCATION</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      Threat: <span className={profile.currentThreat !== 'None' ? 'text-destructive' : 'text-emerald-400'}>{profile.currentThreat}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs font-mono border-primary/30 text-primary hover:bg-primary/10 gap-1">
                      INVESTIGATE <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Investigation Panel */}
      {selectedUser ? (
        <div className="w-full lg:w-1/2 flex flex-col">
          <InvestigationPanel
            user={selectedUser}
            profile={getCustomerProfile(selectedUser.id, selectedUser.name, selectedUser.email, selectedUser.department ?? 'Unknown')}
            onClose={() => setSelectedUser(null)}
          />
        </div>
      ) : (
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center text-center p-8 bg-black/10">
          <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-4">
            <Fingerprint className="w-10 h-10 text-primary/40" />
          </div>
          <div className="text-muted-foreground font-mono text-sm">Select a customer to open<br />the investigation panel</div>
        </div>
      )}
    </div>
  );
}
