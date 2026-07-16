import { useEffect, useRef } from "react";
import { useGetQuantumRisks, getGetQuantumRisksQueryKey, useGetQuantumSimulation, getGetQuantumSimulationQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Cpu, Activity, Database, Lock } from "lucide-react";
import * as THREE from "three";
import { format } from "date-fns";

function QuantumLattice() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // TorusKnot for quantum feel
    const geometry = new THREE.TorusKnotGeometry(8, 2.5, 128, 16);
    
    // Wireframe material
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffd60a, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Add a glowing core
    const coreGeo = new THREE.SphereGeometry(4, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff2d55,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      animationId = requestAnimationFrame(animate);
      
      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.01;
      
      const scale = 1 + Math.sin(time * 2) * 0.1;
      core.scale.set(scale, scale, scale);
      
      // Pulse wireframe color between gold and red
      const color1 = new THREE.Color(0xffd60a);
      const color2 = new THREE.Color(0xff2d55);
      material.color.lerpColors(color1, color2, (Math.sin(time) + 1) / 2);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

export default function Quantum() {
  const { data: risks, isLoading: risksLoading } = useGetQuantumRisks({
    query: { queryKey: getGetQuantumRisksQueryKey() }
  });

  const { data: sim, isLoading: simLoading } = useGetQuantumSimulation({
    query: { queryKey: getGetQuantumSimulationQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-mono text-[#ffd60a] tracking-tight drop-shadow-[0_0_8px_rgba(255,214,10,0.5)]">QUANTUM RISK MONITOR</h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">Post-quantum cryptography threat analysis</p>
        </div>
        <Button variant="outline" className="border-[#ffd60a]/50 text-[#ffd60a] hover:bg-[#ffd60a]/10 hover:text-[#ffd60a]">
          <Cpu className="w-4 h-4 mr-2" /> RUN SIMULATION
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-[#ffd60a]/30 bg-black/40 overflow-hidden relative">
           <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none">
             <QuantumLattice />
           </div>
           <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between min-h-[400px]">
             <div>
               <div className="text-sm font-mono text-[#ffd60a] mb-2">SYSTEM INTEGRITY</div>
               {simLoading ? (
                 <div className="text-4xl font-bold font-mono animate-pulse text-white">CALCULATING...</div>
               ) : (
                 <>
                   <div className="text-6xl font-bold font-mono text-white mb-2">{sim?.overallQuantumRiskScore.toFixed(0)}<span className="text-2xl text-muted-foreground">/100</span></div>
                   <Badge variant="destructive" className="font-mono text-sm px-3 py-1">CRITICAL EXPOSURE</Badge>
                 </>
               )}
             </div>
             
             {sim && (
               <div className="space-y-4 mt-8 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10">
                 <div className="flex justify-between items-center">
                   <div className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> VULNERABLE FLOWS</div>
                   <div className="font-mono text-white font-bold">{sim.vulnerableDataFlows}</div>
                 </div>
                 <div className="flex justify-between items-center">
                   <div className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4 text-destructive" /> EST. DECRYPTION</div>
                   <div className="font-mono text-destructive font-bold">{sim.estimatedDecryptionTime}</div>
                 </div>
               </div>
             )}
           </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col min-h-[500px]">
          <CardHeader className="border-b border-border bg-black/20">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" /> EXPOSURE VECTORS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar">
            {risksLoading ? (
              <div className="p-8 text-center text-muted-foreground font-mono">LOADING...</div>
            ) : (
              <div className="divide-y divide-border/50">
                {risks?.map(risk => (
                  <div key={risk.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={risk.severity === 'critical' ? 'destructive' : 'gold'}>{risk.severity}</Badge>
                        <span className="font-bold font-mono text-white tracking-wide uppercase">{risk.riskType.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{format(new Date(risk.detectedAt), "MMM dd yyyy")}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{risk.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/30 p-3 rounded border border-border/50">
                         <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">Affected System</div>
                         <div className="text-sm font-mono text-primary">{risk.affectedSystem}</div>
                      </div>
                      <div className="bg-primary/5 p-3 rounded border border-primary/20">
                         <div className="text-[10px] font-mono text-primary mb-1 uppercase">Mitigation</div>
                         <div className="text-sm font-mono text-white">{risk.mitigationRecommendation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}