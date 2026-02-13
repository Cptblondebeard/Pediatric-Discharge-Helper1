import { Layout } from "@/components/Layout";
import { useDischarges } from "@/hooks/use-discharges";
import { Link } from "wouter";
import { Plus, FileText, Calendar, Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { data: discharges, isLoading } = useDischarges();

  // Sort by date created desc
  const sortedDischarges = discharges?.sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Dr. Resident</p>
        </div>
        <Link href="/new">
          <button className="btn-primary gap-2">
            <Plus className="w-5 h-5" />
            New Discharge
          </button>
        </Link>
      </div>

      {/* Stats Cards - Placeholder data for visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Summaries</p>
              <h3 className="text-2xl font-bold text-slate-900">{discharges?.length || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">This Month</p>
              <h3 className="text-2xl font-bold text-slate-900">{discharges?.length || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
              <h3 className="text-2xl font-bold text-slate-900">0</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Summaries List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Discharges</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search patients..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading records...</div>
        ) : sortedDischarges?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No records found</h3>
            <p className="text-muted-foreground mt-1 mb-6">Create your first discharge summary to get started.</p>
            <Link href="/new">
              <button className="btn-primary">Create Summary</button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedDischarges?.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {item.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.patientName}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>IP: {item.ipNumber}</span>
                      <span>•</span>
                      <span>{item.age}Y / {item.gender}</span>
                      <span>•</span>
                      <span>{format(new Date(item.dischargeDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Diagnosis</div>
                    <div className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{item.dischargeDiagnosis}</div>
                  </div>
                  
                  <Link href={`/discharge/${item.id}`}>
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
