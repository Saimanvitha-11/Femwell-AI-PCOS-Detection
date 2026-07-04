import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, ClipboardList, CheckCircle, FlaskConical, Eye, ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveScreeningResult } from "@/lib/firestore";
import { toast } from "sonner";

// ---- Types ----
type SurveyData = {
  age: number; weight: number; height: number; bmi: number;
  irregularPeriods: "yes" | "no";
  periodFrequency: "monthly" | "every2to3months" | "rarely" | "none";
  excessiveHairGrowth: "yes" | "no";
  acneOrOilySkin: "yes" | "no";
  hairThinning: "yes" | "no";
  weightGain: "yes" | "no";
  skinDarkening: "yes" | "no";
  familyHistory: "yes" | "no";
  difficultyConceiving: "yes" | "no" | "na";
  moodChanges: "yes" | "no";
  lh: string; fsh: string; totalTestosterone: string; amh: string; fastingInsulin: string; fastingGlucose: string;
};

// ---- Score calc ----
function calculateScore(data: SurveyData) {
  let score = 0;
  if (data.irregularPeriods === "yes") score += 20;
  if (data.periodFrequency === "rarely" || data.periodFrequency === "none") score += 15;
  else if (data.periodFrequency === "every2to3months") score += 8;
  if (data.excessiveHairGrowth === "yes") score += 10;
  if (data.acneOrOilySkin === "yes") score += 8;
  if (data.hairThinning === "yes") score += 10;
  if (data.weightGain === "yes") score += 10;
  if (data.skinDarkening === "yes") score += 8;
  if (data.familyHistory === "yes") score += 12;
  if (data.difficultyConceiving === "yes") score += 10;
  if (data.moodChanges === "yes") score += 5;
  const lh = parseFloat(data.lh), fsh = parseFloat(data.fsh);
  if (!isNaN(lh) && !isNaN(fsh) && fsh > 0 && lh / fsh > 2) score += 15;
  const t = parseFloat(data.totalTestosterone);
  if (!isNaN(t) && t > 70) score += 12;
  const amh = parseFloat(data.amh);
  if (!isNaN(amh) && amh > 3.5) score += 10;
  const ins = parseFloat(data.fastingInsulin);
  if (!isNaN(ins) && ins > 15) score += 10;
  const glu = parseFloat(data.fastingGlucose);
  if (!isNaN(glu) && glu > 100) score += 8;

  const probability = Math.min(score / 120, 0.98);
  const likelihood = probability < 0.33 ? "Unlikely" : probability < 0.66 ? "Possible" : "Likely";

  const factors: string[] = [];
  if (data.irregularPeriods === "yes") factors.push("Irregular periods");
  if (data.periodFrequency === "rarely" || data.periodFrequency === "none") factors.push("Very infrequent periods");
  if (data.excessiveHairGrowth === "yes") factors.push("Excessive hair growth");
  if (data.hairThinning === "yes") factors.push("Hair thinning");
  if (data.acneOrOilySkin === "yes") factors.push("Acne/oily skin");
  if (data.weightGain === "yes") factors.push("Difficulty with weight");
  if (data.skinDarkening === "yes") factors.push("Skin darkening");
  if (data.familyHistory === "yes") factors.push("Family history of PCOS/diabetes");
  if (data.difficultyConceiving === "yes") factors.push("Difficulty conceiving");
  if (!isNaN(lh) && !isNaN(fsh) && fsh > 0 && lh / fsh > 2) factors.push("Elevated LH/FSH ratio");
  if (!isNaN(t) && t > 70) factors.push("Elevated testosterone");
  if (!isNaN(amh) && amh > 3.5) factors.push("Elevated AMH");
  if (!isNaN(ins) && ins > 15) factors.push("Elevated fasting insulin");

  return { probability, likelihood, factors };
}

// ---- Step 1 ----
const step1Schema = z.object({
  age: z.coerce.number().min(13).max(60),
  weight: z.coerce.number().min(30).max(300),
  height: z.coerce.number().min(100).max(250),
});

function Step1({ onNext }: { onNext: (d: { age: number; weight: number; height: number; bmi: number }) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(step1Schema) });
  const weight = parseFloat(watch("weight") ?? "0");
  const height = parseFloat(watch("height") ?? "0") / 100;
  const bmi = weight && height ? (weight / (height * height)).toFixed(1) : null;

  return (
    <form onSubmit={handleSubmit(d => onNext({ ...d, bmi: parseFloat(bmi ?? "0") }))} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Age</Label>
          <Input type="number" placeholder="25" className="rounded-xl h-11" {...register("age")} />
          {errors.age && <p className="text-xs text-destructive">{errors.age.message as string}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Weight (kg)</Label>
          <Input type="number" placeholder="65" className="rounded-xl h-11" {...register("weight")} />
          {errors.weight && <p className="text-xs text-destructive">{errors.weight.message as string}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Height (cm)</Label>
          <Input type="number" placeholder="165" className="rounded-xl h-11" {...register("height")} />
          {errors.height && <p className="text-xs text-destructive">{errors.height.message as string}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>BMI (auto-calculated)</Label>
          <div className="h-11 rounded-xl bg-muted/50 border border-border/60 flex items-center px-3 text-muted-foreground font-medium">
            {bmi ?? "–"}
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl gap-2">Next <ChevronRight className="h-4 w-4" /></Button>
    </form>
  );
}

// ---- Step 2 ----
type SurveyFields = Pick<SurveyData, "irregularPeriods" | "periodFrequency" | "excessiveHairGrowth" | "acneOrOilySkin" | "hairThinning" | "weightGain" | "skinDarkening" | "familyHistory" | "difficultyConceiving" | "moodChanges">;

const questions: { key: keyof SurveyFields; label: string; options: { value: string; label: string }[] }[] = [
  { key: "irregularPeriods", label: "Do you have irregular periods?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "periodFrequency", label: "How frequent are your periods?", options: [{ value: "monthly", label: "Monthly" }, { value: "every2to3months", label: "Every 2–3 months" }, { value: "rarely", label: "Rarely" }, { value: "none", label: "None" }] },
  { key: "excessiveHairGrowth", label: "Do you have excessive hair growth on face/body?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "acneOrOilySkin", label: "Do you have acne or oily skin?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "hairThinning", label: "Do you experience hair thinning or hair loss?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "weightGain", label: "Do you experience weight gain or difficulty losing weight?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "skinDarkening", label: "Is there darkening of skin (neck, groin, under breasts)?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "familyHistory", label: "Family history of PCOS or diabetes?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { key: "difficultyConceiving", label: "Difficulty getting pregnant?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "na", label: "N/A" }] },
  { key: "moodChanges", label: "Mood changes, anxiety, or depression?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
];

function Step2({ onNext, onBack }: { onNext: (d: SurveyFields) => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<Partial<SurveyFields>>({});
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before continuing.");
      return;
    }
    onNext(answers as SurveyFields);
  };

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.key} className="p-4 rounded-xl bg-muted/30 border border-border/40">
            <p className="font-medium text-sm mb-3">{i + 1}. {q.label}</p>
            <RadioGroup
              value={answers[q.key] as string || ""}
              onValueChange={v => { setError(""); setAnswers(a => ({ ...a, [q.key]: v })); }}
              className="flex flex-wrap gap-2"
            >
              {q.options.map(opt => (
                <div key={opt.value} className="flex items-center">
                  <RadioGroupItem value={opt.value} id={`${q.key}-${opt.value}`} className="sr-only" />
                  <Label
                    htmlFor={`${q.key}-${opt.value}`}
                    className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      answers[q.key] === opt.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border/60 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={handleSubmit} className="flex-1 rounded-xl gap-2">Next <ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ---- Step 3 ----
type LabFields = Pick<SurveyData, "lh" | "fsh" | "totalTestosterone" | "amh" | "fastingInsulin" | "fastingGlucose">;

function Step3({ onNext, onBack }: { onNext: (d: LabFields) => void; onBack: () => void }) {
  const { register, handleSubmit } = useForm<LabFields>({ defaultValues: { lh: "", fsh: "", totalTestosterone: "", amh: "", fastingInsulin: "", fastingGlucose: "" } });
  const labs = [
    { key: "lh" as const, label: "LH (Luteinizing Hormone)", unit: "mIU/mL" },
    { key: "fsh" as const, label: "FSH (Follicle Stimulating Hormone)", unit: "mIU/mL" },
    { key: "totalTestosterone" as const, label: "Total Testosterone", unit: "ng/dL" },
    { key: "amh" as const, label: "AMH (Anti-Müllerian Hormone)", unit: "ng/mL" },
    { key: "fastingInsulin" as const, label: "Fasting Insulin", unit: "µIU/mL" },
    { key: "fastingGlucose" as const, label: "Fasting Glucose", unit: "mg/dL" },
  ];
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-sm text-muted-foreground flex gap-2">
        <FlaskConical className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        Don't have lab results? No problem — skip this step. The survey alone provides meaningful insights.
      </div>
      <div className="grid grid-cols-1 gap-3">
        {labs.map(l => (
          <div key={l.key} className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-sm">{l.label}</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" placeholder="Optional" className="rounded-xl h-10 flex-1" {...register(l.key)} />
                <span className="flex items-center text-xs text-muted-foreground bg-muted px-3 rounded-xl whitespace-nowrap">{l.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <Button type="submit" className="flex-1 rounded-xl gap-2">Next <ChevronRight className="h-4 w-4" /></Button>
      </div>
    </form>
  );
}

// ---- Step 4: Ultrasound ----
function Step4({ onNext, onBack }: { onNext: (file?: File) => void; onBack: () => void }) {
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-muted-foreground flex gap-2">
        <ImageIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        Upload an ultrasound image for AI analysis. Our ResNet-50 model will analyze the image for signs of PCOS. This is completely optional.
      </div>
      
      <div className="border-2 border-dashed border-border/60 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Ultrasound preview" className="mx-auto h-48 object-contain rounded-lg shadow-sm" />
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setFile(undefined); setPreview(undefined); }}>
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload Ultrasound Image</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 5MB</p>
            </div>
            <Label htmlFor="ultrasound-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Select File
            </Label>
            <Input id="ultrasound-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={() => onNext(file)} className="flex-1 rounded-xl gap-2">Review & Submit <ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ---- Step 5: Review ----
function Step5({ data, ultrasoundFile, onBack, onSubmit, isSubmitting }: { data: SurveyData; ultrasoundFile?: File; onBack: () => void; onSubmit: () => void; isSubmitting: boolean }) {
  const hasLabs = data.lh || data.fsh || data.totalTestosterone || data.amh || data.fastingInsulin || data.fastingGlucose;
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Personal Info</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Age:</span><span className="font-medium">{data.age} years</span>
            <span className="text-muted-foreground">Weight:</span><span className="font-medium">{data.weight} kg</span>
            <span className="text-muted-foreground">Height:</span><span className="font-medium">{data.height} cm</span>
            <span className="text-muted-foreground">BMI:</span><span className="font-medium">{data.bmi}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Eye className="h-4 w-4 text-secondary" /> Symptom Survey</h4>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {questions.map(q => (
              <div key={q.key} className="flex justify-between">
                <span className="text-muted-foreground">{q.label.replace("?", "")}</span>
                <Badge variant="outline" className="text-xs capitalize">{data[q.key] || "–"}</Badge>
              </div>
            ))}
          </div>
        </div>

        {hasLabs && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><FlaskConical className="h-4 w-4 text-accent" /> Lab Results</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {data.lh && <><span className="text-muted-foreground">LH:</span><span className="font-medium">{data.lh} mIU/mL</span></>}
              {data.fsh && <><span className="text-muted-foreground">FSH:</span><span className="font-medium">{data.fsh} mIU/mL</span></>}
              {data.totalTestosterone && <><span className="text-muted-foreground">Testosterone:</span><span className="font-medium">{data.totalTestosterone} ng/dL</span></>}
              {data.amh && <><span className="text-muted-foreground">AMH:</span><span className="font-medium">{data.amh} ng/mL</span></>}
              {data.fastingInsulin && <><span className="text-muted-foreground">Fasting Insulin:</span><span className="font-medium">{data.fastingInsulin} µIU/mL</span></>}
              {data.fastingGlucose && <><span className="text-muted-foreground">Fasting Glucose:</span><span className="font-medium">{data.fastingGlucose} mg/dL</span></>}
            </div>
          </div>
        )}

        {ultrasoundFile && (
           <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
             <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Ultrasound Image</h4>
             <div className="text-sm">
               <span className="text-muted-foreground">Image included for ML analysis: </span>
               <span className="font-medium">{ultrasoundFile.name}</span>
             </div>
           </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1 rounded-xl gap-2">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><CheckCircle className="h-4 w-4" /> Submit for Analysis</>}
        </Button>
      </div>
    </div>
  );
}

// ---- Main ----
const steps = [
  { label: "Personal Info", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Symptoms", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Lab Results", icon: <FlaskConical className="h-4 w-4" /> },
  { label: "Ultrasound", icon: <ImageIcon className="h-4 w-4" /> },
  { label: "Review", icon: <Eye className="h-4 w-4" /> },
];

export default function Screening() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<SurveyData>>({});
  const [ultrasoundFile, setUltrasoundFile] = useState<File | undefined>();

  const handleStep1 = (d: { age: number; weight: number; height: number; bmi: number }) => {
    setFormData(f => ({ ...f, ...d }));
    setStep(1);
  };

  const handleStep2 = (d: SurveyFields) => {
    setFormData(f => ({ ...f, ...d }));
    setStep(2);
  };

  const handleStep3 = (d: LabFields) => {
    setFormData(f => ({ ...f, ...d }));
    setStep(3);
  };

  const handleStep4 = (file?: File) => {
    setUltrasoundFile(file);
    setStep(4);
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a screening.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Calculate survey results
      const result = calculateScore(formData as SurveyData);
      
      // 2. Process ultrasound image via ML API if provided
      let ultrasoundResult = undefined;
      
      if (ultrasoundFile) {
        try {
          const apiData = new FormData();
          apiData.append("file", ultrasoundFile);
          
          // Assuming the API is running locally for now or deployed endpoint
          const apiUrl = import.meta.env.VITE_ML_API_URL || "http://localhost:7860/predict";
          const res = await fetch(apiUrl, {
            method: "POST",
            body: apiData,
          });
          
          if (res.ok) {
            const data = await res.json();
            ultrasoundResult = {
              prediction: data.prediction,
              confidence: data.confidence,
            };
          } else {
            console.error("ML API returned an error:", await res.text());
            toast.warning("Could not process ultrasound image, but your survey was saved.");
          }
        } catch (error) {
          console.error("Failed to call ML API", error);
          toast.warning("Failed to connect to the prediction server. Survey saved.");
        }
      }
      
      // 3. Save to Firestore
      const docId = await saveScreeningResult(
        user.uid,
        formData as Record<string, unknown>,
        result,
        ultrasoundResult
      );
      
      // 4. Navigate to real results page
      setLocation(`/results/${docId}`);
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving your results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PCOS Screening</h1>
        <p className="text-muted-foreground">Answer honestly — your results are private and never shared.</p>
      </motion.div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all text-xs ${i < step ? "bg-primary border-primary text-white" : i === step ? "border-primary text-primary" : "border-muted-foreground/30"}`}>
                {i < step ? <CheckCircle className="h-3 w-3" /> : i + 1}
              </div>
              <span className="hidden md:block">{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={(step / (steps.length - 1)) * 100} className="h-2 rounded-full" />
        <p className="text-xs text-muted-foreground mt-1">Step {step + 1} of {steps.length}</p>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            {step === 0 && <><ClipboardList className="h-5 w-5 text-primary" /> Personal Information</>}
            {step === 1 && <><ClipboardList className="h-5 w-5 text-secondary" /> Symptom Survey</>}
            {step === 2 && <><FlaskConical className="h-5 w-5 text-accent" /> Lab Results (Optional)</>}
            {step === 3 && <><ImageIcon className="h-5 w-5 text-primary" /> Ultrasound Image (Optional)</>}
            {step === 4 && <><Eye className="h-5 w-5 text-primary" /> Review Your Answers</>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <Step1 onNext={handleStep1} />}
              {step === 1 && <Step2 onNext={handleStep2} onBack={() => setStep(0)} />}
              {step === 2 && <Step3 onNext={handleStep3} onBack={() => setStep(1)} />}
              {step === 3 && <Step4 onNext={handleStep4} onBack={() => setStep(2)} />}
              {step === 4 && (
                <Step5
                  data={formData as SurveyData}
                  ultrasoundFile={ultrasoundFile}
                  onBack={() => setStep(3)}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

    </div>
  );
}
