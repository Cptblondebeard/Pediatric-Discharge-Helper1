import { useRoute, Link } from "wouter";
import { useDischarge } from "@/hooks/use-discharges";
import { Layout } from "@/components/Layout";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  User, 
  Stethoscope 
} from "lucide-react";
import { api, buildUrl } from "@shared/routes";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function DischargeDetails() {
  const [match, params] = useRoute("/discharge/:id");
  const id = parseInt(params?.id || "0");
  const { data, isLoading, error } = useDischarge(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading summary...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Summary</h2>
          <p className="text-muted-foreground mt-2">The requested discharge summary could not be found.</p>
          <Link href="/">
            <button className="btn-primary mt-6">Go Back Home</button>
          </Link>
        </div>
      </Layout>
    );
  }

  const pdfUrl = buildUrl(api.discharges.downloadPdf.path, { id });
  const docxUrl = buildUrl(api.discharges.downloadDocx.path, { id });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
        
        <div className="flex gap-3">
          <a href={docxUrl} download>
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4 text-blue-600" />
              Word
            </button>
          </a>
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            <button className="btn-primary gap-2 h-10 px-4">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Summary Document Preview */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-border overflow-hidden min-h-[800px]"
          >
            {/* Header Strip */}
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            
            <div className="p-8 md:p-12 font-serif">
              {/* Document Header */}
              <div className="text-center mb-12 border-b-2 border-slate-100 pb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">ESIC MEDICAL COLLEGE & HOSPITAL</h1>
                <p className="text-sm text-slate-600 uppercase tracking-widest font-sans font-medium">Department of Pediatrics</p>
                <p className="text-sm text-slate-500 mt-1 font-sans">KK Nagar, Chennai - 600078</p>
                <div className="mt-8 inline-block px-6 py-2 border border-slate-200 rounded-full bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Discharge Summary</h2>
                </div>
              </div>

              {/* Patient Demographics Grid */}
              <div className="bg-slate-50 rounded-xl p-6 mb-8 font-sans text-sm border border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Name</span>
                    <span className="font-medium text-slate-900">{data.patientName}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Age / Gender</span>
                    <span className="font-medium text-slate-900">{data.age}Y / {data.gender}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">IP Number</span>
                    <span className="font-medium text-slate-900">{data.ipNumber}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Unit</span>
                    <span className="font-medium text-slate-900">{data.unitOfAdmission}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Admission Date</span>
                    <span className="font-medium text-slate-900">{format(new Date(data.admissionDate), "dd MMM yyyy")}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Discharge Date</span>
                    <span className="font-medium text-slate-900">{format(new Date(data.dischargeDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-semibold text-muted-foreground uppercase">Consultant</span>
                    <span className="font-medium text-slate-900">{data.consultantName}</span>
                  </div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="prose prose-slate max-w-none font-sans prose-headings:text-primary prose-headings:font-bold prose-h3:text-lg prose-h3:uppercase prose-h3:tracking-wide prose-h3:border-b prose-h3:pb-2 prose-h3:mt-8">
                {/* 
                   Displaying the generated summary text.
                   Since backend generates text, we display it inside whitespace-pre-wrap 
                   or handle simplified markdown if AI produces that. 
                   For now assuming plain text/markdown mix.
                */}
                <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                  {data.generatedSummary || "Summary generation pending..."}
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between items-end font-sans">
                <div className="text-center">
                  <div className="w-32 h-px bg-slate-300 mb-2"></div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Resident Doctor</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-px bg-slate-300 mb-2"></div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Consultant Signature</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Actions & Metadata */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-slate-50 hover:text-primary transition-colors text-sm font-medium text-slate-600"
              >
                <Printer className="w-4 h-4" />
                Print Summary
              </button>
              {/* Future feature placeholders */}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-slate-50 hover:text-primary transition-colors text-sm font-medium text-slate-600 opacity-50 cursor-not-allowed">
                <Share2 className="w-4 h-4" />
                Email to Patient
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-bold text-primary mb-2 text-sm uppercase tracking-wide">Diagnosis</h3>
            <p className="text-slate-800 font-medium">{data.dischargeDiagnosis}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Timeline</h3>
            <div className="space-y-6 relative pl-4 border-l-2 border-slate-100">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white" />
                <p className="text-xs text-muted-foreground font-medium mb-1">Admitted</p>
                <p className="text-sm font-medium text-slate-900">{format(new Date(data.admissionDate), "MMM d, yyyy")}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white" />
                <p className="text-xs text-muted-foreground font-medium mb-1">Discharged</p>
                <p className="text-sm font-medium text-slate-900">{format(new Date(data.dischargeDate), "MMM d, yyyy")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
