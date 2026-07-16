import { useEffect, useRef } from "react";
import { useGetCorrelations, getGetCorrelationsQueryKey, useGetCorrelationGraph, getGetCorrelationGraphQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Activity } from "lucide-react";
import * as THREE from "three";

function Graph3D({ data }: { data: any }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !data) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 150;
    camera.position.y = 50;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Node colors by type
    const colorMap: Record<string, number> = {
      user: 0x00f5ff,      // cyan
      device: 0x0066ff,    // blue
      account: 0xffd60a,   // gold
      transaction: 0xff2d55, // red
      ip_address: 0xffffff, // white
      alert: 0xff4500      // orange-red
    };

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Create nodes
    const nodeMeshes: Record<string, THREE.Mesh> = {};
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    
    data.nodes.forEach((node: any) => {
      const material = new THREE.MeshBasicMaterial({ 
        color: colorMap[node.type] || 0x888888,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position - scale up the coordinates from the API for better spread
      mesh.position.set(node.x * 2, node.y * 2, node.z * 2);
      
      // Add a glow sprite or larger faint sphere
      const glowMat = new THREE.MeshBasicMaterial({
        color: colorMap[node.type] || 0x888888,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), glowMat);
      mesh.add(glow);

      nodeMeshes[node.id] = mesh;
      nodeGroup.add(mesh);
    });

    // Create edges
    const materialLine = new THREE.LineBasicMaterial({ 
      color: 0x00f5ff, 
      transparent: true, 
      opacity: 0.15 
    });

    const edgeGeometry = new THREE.BufferGeometry();
    const positions = [];
    
    data.edges.forEach((edge: any) => {
      const source = nodeMeshes[edge.source];
      const target = nodeMeshes[edge.target];
      if (source && target) {
        positions.push(
          source.position.x, source.position.y, source.position.z,
          target.position.x, target.position.y, target.position.z
        );
      }
    });

    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const lines = new THREE.LineSegments(edgeGeometry, materialLine);
    nodeGroup.add(lines);

    // Add some floating particles for atmosphere
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 300;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 1,
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.002;
      animationId = requestAnimationFrame(animate);
      
      // Auto rotate
      nodeGroup.rotation.y += 0.001;
      nodeGroup.rotation.x = Math.sin(time) * 0.1;
      
      particles.rotation.y -= 0.0005;

      // Pulse nodes based on risk score (mocked via sine wave)
      Object.values(nodeMeshes).forEach((mesh, i) => {
         const scale = 1 + Math.sin(time * 5 + i) * 0.1;
         mesh.scale.set(scale, scale, scale);
      });

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
  }, [data]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
}

export default function Correlations() {
  const { data: correlations, isLoading: listLoading } = useGetCorrelations(
    { limit: 20 },
    { query: { queryKey: getGetCorrelationsQueryKey({ limit: 20 }) } }
  );

  const { data: graphData, isLoading: graphLoading } = useGetCorrelationGraph({
    query: { queryKey: getGetCorrelationGraphQueryKey() }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">AI CORRELATION ENGINE</h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">Multi-vector threat topology</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="lg:col-span-2 relative overflow-hidden bg-black/50 border-primary/20">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Badge variant="cyan" className="bg-black/50 backdrop-blur">USER</Badge>
            <Badge variant="blue" className="bg-black/50 backdrop-blur">DEVICE</Badge>
            <Badge variant="gold" className="bg-black/50 backdrop-blur">ACCOUNT</Badge>
            <Badge variant="destructive" className="bg-black/50 backdrop-blur">TRANSACTION</Badge>
          </div>
          {graphLoading || !graphData ? (
             <div className="w-full h-full flex items-center justify-center font-mono text-primary animate-pulse">
               <Activity className="w-6 h-6 mr-2 animate-spin" /> RENDERING TOPOLOGY...
             </div>
          ) : (
             <Graph3D data={graphData} />
          )}
        </Card>

        <Card className="flex flex-col min-h-0 border-border bg-card/50 backdrop-blur">
          <div className="p-4 border-b border-border bg-black/20">
            <h3 className="font-bold font-mono text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-accent" /> DETECTED CLUSTERS
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {listLoading ? (
              <div className="text-center text-muted-foreground font-mono mt-10">LOADING...</div>
            ) : (
              correlations?.map(corr => (
                <div key={corr.id} className="p-4 rounded-lg bg-black/40 border border-border hover:border-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] text-accent border-accent/30 font-mono">
                      {corr.correlationType.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      STR: {(corr.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium mb-3">{corr.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {corr.involvedEntities.slice(0, 4).map((entity, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-muted-foreground font-mono">
                        {entity}
                      </span>
                    ))}
                    {corr.involvedEntities.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-muted-foreground font-mono">
                        +{corr.involvedEntities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}