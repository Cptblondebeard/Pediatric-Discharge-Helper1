import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertDischargeSummary, type DischargeSummary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDischarges() {
  return useQuery<DischargeSummary[]>({
    queryKey: [api.discharges.list.path],
    queryFn: async () => {
      const res = await fetch(api.discharges.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch discharge summaries");
      const data = await res.json();
      return api.discharges.list.responses[200].parse(data);
    },
  });
}

export function useDischarge(id: number) {
  return useQuery<DischargeSummary>({
    queryKey: [api.discharges.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.discharges.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch discharge summary");
      const data = await res.json();
      return api.discharges.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateDischarge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertDischargeSummary) => {
      const res = await fetch(api.discharges.create.path, {
        method: api.discharges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create discharge summary");
      }

      const responseData = await res.json();
      return api.discharges.create.responses[201].parse(responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.discharges.list.path] });
      toast({
        title: "Success",
        description: "Discharge summary created and generated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
