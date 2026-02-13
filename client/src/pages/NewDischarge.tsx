import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDischargeSummarySchema, type InsertDischargeSummary } from "@shared/schema";
import { useCreateDischarge } from "@/hooks/use-discharges";
import { Layout } from "@/components/Layout";
import { FormTabs } from "@/components/FormTabs";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Sub-components for form sections
function PatientDetailsTab({ register, errors }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="md:col-span-3">
        <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Basic Information</h3>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Patient Name *</label>
        <input {...register("patientName")} className="input-field" placeholder="e.g. Baby of Geetha" />
        {errors.patientName && <span className="text-xs text-destructive">{errors.patientName.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Age (Years) *</label>
        <input 
          type="number" 
          {...register("age", { valueAsNumber: true })} 
          className="input-field" 
          placeholder="e.g. 5" 
        />
        {errors.age && <span className="text-xs text-destructive">{errors.age.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Gender *</label>
        <select {...register("gender")} className="input-field">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Father's Name</label>
        <input {...register("fatherName")} className="input-field" placeholder="Father's Name" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Mother's Name</label>
        <input {...register("motherName")} className="input-field" placeholder="Mother's Name" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">IP Number *</label>
        <input {...register("ipNumber")} className="input-field" placeholder="e.g. IP-2024-1234" />
        {errors.ipNumber && <span className="text-xs text-destructive">{errors.ipNumber.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Bed Number</label>
        <input {...register("bedNumber")} className="input-field" placeholder="e.g. 304-A" />
      </div>

      <div className="md:col-span-3 mt-4">
        <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Admission Details</h3>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Unit of Admission *</label>
        <select {...register("unitOfAdmission")} className="input-field">
          <option value="">Select Unit</option>
          <option value="Unit 1 - General Pediatrics">Unit 1 - General Pediatrics</option>
          <option value="Unit 2 - Respiratory">Unit 2 - Respiratory</option>
          <option value="Unit 3 - Neurology">Unit 3 - Neurology</option>
          <option value="NICU">NICU</option>
          <option value="PICU">PICU</option>
        </select>
        {errors.unitOfAdmission && <span className="text-xs text-destructive">{errors.unitOfAdmission.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Admission Date *</label>
        <input type="date" {...register("admissionDate")} className="input-field" />
        {errors.admissionDate && <span className="text-xs text-destructive">{errors.admissionDate.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Discharge Date *</label>
        <input type="date" {...register("dischargeDate")} className="input-field" />
        {errors.dischargeDate && <span className="text-xs text-destructive">{errors.dischargeDate.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Consultant Name *</label>
        <input {...register("consultantName")} className="input-field" placeholder="Dr. Name" />
        {errors.consultantName && <span className="text-xs text-destructive">{errors.consultantName.message}</span>}
      </div>
    </motion.div>
  );
}

function ClinicalDataTab({ register, errors }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Admitting Diagnosis *</label>
          <textarea 
            {...register("admittingDiagnosis")} 
            className="input-field min-h-[120px] py-3 resize-none" 
            placeholder="Enter diagnosis at time of admission..." 
          />
          {errors.admittingDiagnosis && <span className="text-xs text-destructive">{errors.admittingDiagnosis.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Discharge Diagnosis *</label>
          <textarea 
            {...register("dischargeDiagnosis")} 
            className="input-field min-h-[120px] py-3 resize-none" 
            placeholder="Final diagnosis..." 
          />
          {errors.dischargeDiagnosis && <span className="text-xs text-destructive">{errors.dischargeDiagnosis.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Comorbidities</label>
          <textarea 
            {...register("comorbidities")} 
            className="input-field min-h-[80px] py-3 resize-none" 
            placeholder="e.g. Asthma, Diabetes..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Complications</label>
          <textarea 
            {...register("complications")} 
            className="input-field min-h-[80px] py-3 resize-none" 
            placeholder="Any complications during stay..." 
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Investigations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Blood Reports</label>
            <textarea 
              {...register("bloodInvestigations")} 
              className="input-field min-h-[150px] py-3 resize-none font-mono text-xs" 
              placeholder="Hb: 12.5&#10;WBC: 11,000&#10;Plt: 2.5L" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Imaging Studies</label>
            <textarea 
              {...register("imagingInvestigations")} 
              className="input-field min-h-[150px] py-3 resize-none font-mono text-xs" 
              placeholder="CXR: Normal&#10;USG: Mild hepatomegaly" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Other Tests</label>
            <textarea 
              {...register("otherInvestigations")} 
              className="input-field min-h-[150px] py-3 resize-none font-mono text-xs" 
              placeholder="Urine Culture: Sterile&#10;Mantoux: Negative" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Hospital Course *</label>
        <textarea 
          {...register("hospitalCourse")} 
          className="input-field min-h-[150px] py-3 resize-none" 
          placeholder="Brief summary of clinical progress during hospital stay..." 
        />
        {errors.hospitalCourse && <span className="text-xs text-destructive">{errors.hospitalCourse.message}</span>}
      </div>
    </motion.div>
  );
}

function PlanningTab({ register, errors }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Medication & Plan</h3>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Discharge Medications *</label>
        <textarea 
          {...register("dischargeMedications")} 
          className="input-field min-h-[150px] py-3 resize-none" 
          placeholder="1. Syp. Paracetamol 5ml SOS&#10;2. Syp. Amoxicillin 5ml TDS x 5 days" 
        />
        {errors.dischargeMedications && <span className="text-xs text-destructive">{errors.dischargeMedications.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">IV Medications Given</label>
        <textarea 
          {...register("ivMedications")} 
          className="input-field min-h-[150px] py-3 resize-none" 
          placeholder="Inj. Ceftriaxone 1g IV BD x 3 days" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Follow-up Plan *</label>
        <textarea 
          {...register("followUpPlan")} 
          className="input-field min-h-[100px] py-3 resize-none" 
          placeholder="Review in OPD after 1 week (Date: ...)" 
        />
        {errors.followUpPlan && <span className="text-xs text-destructive">{errors.followUpPlan.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Special Instructions</label>
        <textarea 
          {...register("specialInstructions")} 
          className="input-field min-h-[100px] py-3 resize-none" 
          placeholder="Diet restrictions, warning signs..." 
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-slate-700">Discharge Condition *</label>
        <select {...register("dischargeCondition")} className="input-field max-w-xs">
          <option value="">Select Condition</option>
          <option value="Recovered">Recovered</option>
          <option value="Improved">Improved</option>
          <option value="Stable">Stable</option>
          <option value="Transferred">Transferred</option>
          <option value="LAMA">LAMA (Left Against Medical Advice)</option>
        </select>
        {errors.dischargeCondition && <span className="text-xs text-destructive">{errors.dischargeCondition.message}</span>}
      </div>
    </motion.div>
  );
}

export default function NewDischarge() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("patient");
  
  const { mutate, isPending } = useCreateDischarge();

  const { register, handleSubmit, formState: { errors } } = useForm<InsertDischargeSummary>({
    resolver: zodResolver(insertDischargeSummarySchema),
    defaultValues: {
      age: undefined,
    }
  });

  const onSubmit = (data: InsertDischargeSummary) => {
    mutate(data, {
      onSuccess: (response) => {
        setLocation(`/discharge/${response.id}`);
      },
      onError: () => {
        // Error toast handled in hook
      }
    });
  };

  // Function to navigate tabs on Enter key if desired, but here just basic navigation
  const nextTab = () => {
    if (activeTab === "patient") setActiveTab("clinical");
    else if (activeTab === "clinical") setActiveTab("planning");
  };

  const prevTab = () => {
    if (activeTab === "planning") setActiveTab("clinical");
    else if (activeTab === "clinical") setActiveTab("patient");
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => setLocation("/")} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Discharge Summary</h1>
          <p className="text-muted-foreground mt-1">Enter patient details to generate official summary</p>
        </div>
        
        {/* Progress indicator or simple status */}
        <div className="bg-blue-50 text-primary px-4 py-2 rounded-full text-sm font-medium">
          Step {activeTab === "patient" ? "1" : activeTab === "clinical" ? "2" : "3"} of 3
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormTabs activeTab={activeTab} onChange={setActiveTab} errors={errors} />

        <div className="bg-white rounded-3xl p-8 border border-border shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "patient" && <PatientDetailsTab key="patient" register={register} errors={errors} />}
            {activeTab === "clinical" && <ClinicalDataTab key="clinical" register={register} errors={errors} />}
            {activeTab === "planning" && <PlanningTab key="planning" register={register} errors={errors} />}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={prevTab}
            disabled={activeTab === "patient"}
            className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-all"
          >
            Previous
          </button>

          <div className="flex gap-4">
            {activeTab !== "planning" ? (
              <button
                type="button"
                onClick={nextTab}
                className="btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary min-w-[200px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </Layout>
  );
}
