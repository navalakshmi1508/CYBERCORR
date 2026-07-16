import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { setAuthUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticleBackground } from "@/components/particle-background";
import { Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const regMut = useRegister();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'analyst' | 'user'>("user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    regMut.mutate({ data: { email, password, name, role } }, {
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
          title: "Registration Failed",
          description: err.message || "An error occurred",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-background py-10">
      <ParticleBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1)_0,transparent_50%)] pointer-events-none" />

      <div className="z-10 w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Network className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
            <h1 className="text-3xl font-bold font-mono tracking-tighter text-white">CYBER<span className="text-primary">NEXUS</span></h1>
          </div>
        </div>

        <Card className="border-primary/30 shadow-[0_0_50px_rgba(0,245,255,0.1)] bg-background/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">NEW OPERATOR</CardTitle>
            <CardDescription className="text-muted-foreground font-mono mt-2">
              Request access to the intelligence network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary uppercase tracking-widest">Full Name</label>
                <Input 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-black/50 border-primary/20 font-mono" 
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary uppercase tracking-widest">Email Address</label>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-black/50 border-primary/20 font-mono" 
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
                  className="bg-black/50 border-primary/20 font-mono" 
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono text-primary uppercase tracking-widest">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setRole("user")}
                    className={`border rounded-md p-3 text-center cursor-pointer transition-all ${role === 'user' ? 'border-accent bg-accent/20 text-accent shadow-[0_0_15px_rgba(0,102,255,0.3)]' : 'border-border text-muted-foreground hover:border-accent/50'}`}
                  >
                    <span className="font-mono font-bold text-sm">STANDARD</span>
                  </div>
                  <div 
                    onClick={() => setRole("analyst")}
                    className={`border rounded-md p-3 text-center cursor-pointer transition-all ${role === 'analyst' ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,245,255,0.3)]' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                  >
                    <span className="font-mono font-bold text-sm">ANALYST</span>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full font-bold tracking-widest h-12 mt-6" disabled={regMut.isPending}>
                {regMut.isPending ? "PROCESSING..." : "REQUEST ACCESS"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm font-mono text-muted-foreground">
              Already cleared? <Link href="/login"><span className="text-primary hover:underline cursor-pointer">Initialize Uplink</span></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}