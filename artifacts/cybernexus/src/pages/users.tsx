import { useGetUsers, getGetUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, Zap } from "lucide-react";
import { format } from "date-fns";

export default function Users() {
  const { data: users, isLoading } = useGetUsers({
    query: { queryKey: getGetUsersQueryKey() }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">OPERATOR REGISTRY</h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">Platform access control and monitoring</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-mono text-primary bg-primary/5 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Operator Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Clearance Level</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Added</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono">LOADING ROSTER...</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono">NO OPERATORS FOUND</td>
                </tr>
              ) : (
                users?.map((u, i) => (
                  <tr key={u.id} className={`border-b border-border/50 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-mono text-primary border border-primary/30">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' && <Badge variant="destructive"><ShieldAlert className="w-3 h-3 mr-1"/> ADMIN</Badge>}
                      {u.role === 'analyst' && <Badge variant="cyan"><Shield className="w-3 h-3 mr-1"/> ANALYST</Badge>}
                      {u.role === 'user' && <Badge variant="outline"><Zap className="w-3 h-3 mr-1"/> STANDARD</Badge>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs uppercase">{u.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{format(new Date(u.createdAt), "yyyy-MM-dd")}</td>
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