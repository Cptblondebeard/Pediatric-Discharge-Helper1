import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import esicLogo from "@assets/Employee_State_Insurance_Corporation_Logo-1_1770966726583.png";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/new", icon: FilePlus, label: "New Summary" },
    { href: "/history", icon: History, label: "History" },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-border flex flex-col fixed left-0 top-0 z-10 shadow-xl shadow-black/5 lg:translate-x-0 -translate-x-full transition-transform duration-300 peer-data-[state=open]:translate-x-0">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 text-primary">
          <img src={esicLogo} alt="ESIC Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-lg tracking-tight">ESIC Pediatrics</h1>
            <p className="text-xs text-muted-foreground font-medium">Discharge System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-4 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold opacity-90">System Online</span>
          </div>
          <p className="text-xs opacity-75">v4.2.0 • ESIC Chennai</p>
        </div>
        
        {/* Placeholder for settings/logout - strictly visual for now */}
        <div className="mt-4 flex items-center justify-between px-2 text-muted-foreground">
          <button className="hover:text-primary transition-colors"><Settings className="w-5 h-5" /></button>
          <button className="hover:text-destructive transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
