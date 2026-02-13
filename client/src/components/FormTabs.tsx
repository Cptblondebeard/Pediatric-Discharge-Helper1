import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, ClipboardList, Pill } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: "patient", label: "Patient Details", icon: User },
  { id: "clinical", label: "Clinical Data", icon: ClipboardList },
  { id: "planning", label: "Discharge Planning", icon: Pill },
];

interface FormTabsProps {
  activeTab: string;
  onChange: (id: string) => void;
  errors?: Record<string, any>; // Used to show error indicators on tabs
}

export function FormTabs({ activeTab, onChange, errors = {} }: FormTabsProps) {
  return (
    <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-border/50 mb-8 sticky top-0 z-10 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        // Simple logic to guess if this tab has errors based on field names
        // In a real app, you'd map fields to tabs more robustly
        const hasError = false; 

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white shadow-md rounded-xl border border-border/50"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {tab.label}
              {hasError && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
