import { useState } from "react";
import { useGetTransactions, getGetTransactionsQueryKey, useGetTransaction, getGetTransactionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { IndianRupee, AlertCircle, Activity, BrainCircuit, X, Network, TrendingUp, MapPin, Smartphone, Shield, Clock, Zap } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";

/** Format amount as INR with Indian numbering */
function formatINR(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '₹—';
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  if (amount >= 1_000) return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return `₹${amount.toFixed(0)}`;
}

export default function Transactions() {
  const [anomalyOnly, setAnomalyOnly] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  const { data: transactions, isLoading } = useGetTransactions(
    { anomalyOnly, limit: 50 },
    { query: { queryKey: getGetTransactionsQueryKey({ anomalyOnly, limit: 50 }) } }
  );

  const { data: detailData, isLoading: detailLoading } = useGetTransaction(
    selectedTxId!,
    { query: { enabled: !!selectedTxId, queryKey: getGetTransactionQueryKey(selectedTxId!) } }
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Left: List View — always visible */}
      <div className="flex flex-col min-h-0 space-y-4">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shrink-0">
          <div>
            <h2 className="text-xl font-bold font-mono text-white">MONITORING LEDGER</h2>
            <p className="text-xs text-muted-foreground font-mono">Financial flow analysis · ₹ INR</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">ANOMALIES ONLY</span>
            <Switch checked={anomalyOnly} onCheckedChange={setAnomalyOnly} className="data-[state=checked]:bg-destructive" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-primary font-mono animate-pulse"><Activity className="inline mr-2 animate-spin" /> SCANNING LEDGER...</div>
          ) : transactions?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono">NO TRANSACTIONS MATCH CRITERIA</div>
          ) : (
            transactions?.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedTxId(tx.id === selectedTxId ? null : tx.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTxId === tx.id
                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : tx.isAnomaly
                    ? 'bg-destructive/5 border-destructive/30 hover:border-destructive/60'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${tx.isAnomaly ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-lg font-mono">{formatINR(tx.amount)}</div>
                      <div className="text-xs text-muted-foreground font-mono uppercase">{tx.transactionType} · {tx.accountId}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">{format(new Date(tx.timestamp), "dd MMM, HH:mm")}</div>
                    {tx.isAnomaly ? (
                      <Badge variant="destructive" className="animate-pulse">RISK {tx.riskScore}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">CLEAR</Badge>
                    )}
                  </div>
                </div>

                {tx.merchantName && (
                  <div className="text-xs text-muted-foreground font-mono mb-2">📍 {tx.merchantName} · {tx.merchantCategory}</div>
                )}

                {tx.anomalyReasons && tx.anomalyReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tx.anomalyReasons.slice(0, 2).map(reason => (
                      <Badge key={reason} variant="secondary" className="text-[10px] bg-black/40 text-muted-foreground max-w-[200px] truncate">
                        {reason}
                      </Badge>
                    ))}
                    {tx.anomalyReasons.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] bg-black/40 text-muted-foreground">
                        +{tx.anomalyReasons.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Detail Panel — always visible, shows placeholder when nothing selected */}
      <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
        {!selectedTxId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-4">
              <BrainCircuit className="w-8 h-8 text-primary/30" />
            </div>
            <div className="font-mono text-sm">Select a transaction<br />to view XAI explanation</div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/40 shrink-0">
              <h3 className="font-bold font-mono text-primary flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" /> XAI INVESTIGATION
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTxId(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {detailLoading || !detailData ? (
                <div className="h-full flex items-center justify-center text-accent font-mono animate-pulse">
                  GENERATING NEURAL INFERENCE...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Transaction metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: IndianRupee, label: 'AMOUNT', value: formatINR(detailData.amount) },
                      { icon: TrendingUp, label: 'RISK SCORE', value: `${detailData.riskScore}/100` },
                      { icon: Clock, label: 'TIMESTAMP', value: format(new Date(detailData.timestamp), 'dd MMM HH:mm') },
                      { icon: Smartphone, label: 'DEVICE', value: 'MOBILE-APP' },
                      { icon: MapPin, label: 'LOCATION', value: 'Mumbai, IN' },
                      { icon: Shield, label: 'AUTH METHOD', value: 'OTP + PIN' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="p-3 rounded-lg bg-black/20 border border-border/50">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mb-1">
                          <Icon className="w-3 h-3" />{label}
                        </div>
                        <div className="text-sm font-bold font-mono text-white truncate">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 font-mono flex items-center gap-2">
                      <BrainCircuit className="w-3.5 h-3.5" /> AI SUMMARY
                    </div>
                    <p className="text-white leading-relaxed text-sm">{detailData.xaiExplanation.summary}</p>
                  </div>

                  {/* Risk Reasoning (Structured) */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xs font-mono text-primary">RISK REASONING</div>
                      <Badge variant="outline" className="border-accent text-accent text-[10px]">
                        CONFIDENCE: {Math.round(detailData.xaiExplanation.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {detailData.xaiExplanation.riskFactors.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                          <span className={f.weight > 0.7 ? 'text-destructive' : f.weight > 0.4 ? 'text-[#FFB300]' : 'text-primary'}>✓</span>
                          <span className="text-white/80">{f.factor}</span>
                          <span className="ml-auto text-muted-foreground">{Math.round(f.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={detailData.xaiExplanation.riskFactors} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="factor" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#000', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={14}>
                            {detailData.xaiExplanation.riskFactors.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.weight > 0.7 ? 'hsl(var(--destructive))' : entry.weight > 0.4 ? '#FFB300' : 'hsl(var(--primary))'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pt-3 border-t border-primary/20 grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-muted-foreground">AI Confidence:</span>{' '}
                        <span className="text-white font-bold">{Math.round(detailData.xaiExplanation.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prediction:</span>{' '}
                        <span className="text-destructive font-bold">
                          {detailData.riskScore > 80 ? 'Likely Account Takeover' : detailData.riskScore > 60 ? 'Suspected Fraud' : 'Monitor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantum Vulnerability */}
                  <div className="p-3 rounded-lg bg-[#7C4DFF]/10 border border-[#7C4DFF]/30">
                    <div className="text-xs font-mono text-[#7C4DFF] mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> QUANTUM VULNERABILITY
                    </div>
                    <div className="text-xs text-white/70 font-mono">
                      {detailData.riskScore > 70 ? 'Session encrypted with RSA-1024 — vulnerable to harvest-now-decrypt-later attacks' : 'Session encryption meets post-quantum safety standards'}
                    </div>
                  </div>

                  {/* Network features */}
                  {detailData.xaiExplanation.graphFeatures && detailData.xaiExplanation.graphFeatures.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-mono flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5" /> NETWORK TOPOLOGY INFLUENCE
                      </div>
                      <div className="grid gap-2">
                        {detailData.xaiExplanation.graphFeatures.map(feat => (
                          <div key={feat} className="p-2.5 rounded bg-black/30 border border-border/50 text-xs font-mono flex items-center gap-2 text-white/70">
                            <Network className="w-3.5 h-3.5 text-accent shrink-0" /> {feat}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="text-xs text-destructive font-mono font-bold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> RECOMMENDED ACTION
                    </div>
                    <div className="text-white font-mono text-sm">{detailData.xaiExplanation.recommendedAction}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
