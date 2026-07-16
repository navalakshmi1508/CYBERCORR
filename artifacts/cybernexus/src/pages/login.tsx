import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { setAuthUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label"; // We can just use standard labels
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticleBackground } from "@/components/particle-background";
import { ShieldAlert, Zap } from "lucide-react";
import { CyberCorrLogo } from "@/components/cybercorr-logo";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMut = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        setAuthUser({
          name: data.user.name,
          role: data.user.role,
          token: data.token
        });
        setLocation("/");
      },
      onError: (err) => {
        toast({
          title: "Authentication Failed",
          description: err.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    });
  };

  const fillDemo = (role: 'analyst' | 'user') => {
    if (role === 'analyst') {
      setEmail("analyst@cybernexus.ai");
      setPassword("password123");
    } else {
      setEmail("user@bank.com");
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-background">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1)_0,transparent_50%)] pointer-events-none" />

      <div className="z-10 w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CyberCorrLogo className="w-14 h-14 relative z-10" />
              <div className="absolute inset-0 bg-primary blur-[20px] opacity-30" />
            </div>
            <h1 className="text-4xl font-bold font-mono tracking-tighter text-white">CYBER<span className="text-primary">CORR</span></h1>
          </div>
        </div>

        <Card className="border-primary/30 shadow-[0_0_50px_rgba(0,245,255,0.1)] bg-background/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">SECURE TERMINAL</CardTitle>
            <CardDescription className="text-muted-foreground font-mono mt-2">
              Awaiting authentication credentials...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary uppercase tracking-widest">Operator ID</label>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-black/50 border-primary/20 focus-visible:ring-primary/50 font-mono" 
                  placeholder="name@domain.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary uppercase tracking-widest">Passcode</label>
                <Input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-black/50 border-primary/20 focus-visible:ring-primary/50 font-mono" 
                  placeholder="••••••••"
                />
              </div>
              
              <Button type="submit" className="w-full font-bold tracking-widest h-12 mt-4" disabled={loginMut.isPending}>
                {loginMut.isPending ? "AUTHENTICATING..." : "INITIALIZE UPLINK"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs font-mono text-muted-foreground mb-4 text-center">DEMO CREDENTIALS</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={() => fillDemo('analyst')} className="text-xs h-16 flex flex-col gap-1 items-center justify-center border-primary/30 hover:border-primary">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  <span className="font-mono">ANALYST</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillDemo('user')} className="text-xs h-16 flex flex-col gap-1 items-center justify-center border-accent/30 hover:border-accent hover:text-accent">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="font-mono">USER</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm font-mono text-muted-foreground">
              No clearance? <Link href="/register"><span className="text-primary hover:underline cursor-pointer">Request Access</span></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}