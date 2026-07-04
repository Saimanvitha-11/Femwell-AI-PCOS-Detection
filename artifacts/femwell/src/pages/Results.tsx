import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PCOSGauge } from "@/components/PCOSGauge";
import { useAuth } from "@/contexts/AuthContext";
import { getScreeningById, getScreeningHistory } from "@/lib/firestore";
import type { ScreeningData } from "@/lib/firestore";
import {
  AlertTriangle, CheckCircle, ClipboardList, Download,
  TrendingUp, Share2, ChevronRight, Info, ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const recommendations: Record<string, { title: string; desc: string; color: string }> = {
  Unlikely: {
    title: "Low Risk — Keep Up the Great Work",
    desc: "Your screening suggests a low likelihood of PCOS. Continue maintaining a healthy lifestyle: regular exercise, balanced nutrition, and routine gynecological check-ups. If you experience new symptoms in the future, don't hesitate to reassess.",
    color: "from-green-500/10 to-green-500/5 border-green-500/20",
  },
  Possible: {
    title: "Moderate Risk — Further Evaluation Recommended",
    desc: "Some indicators in your screening suggest PCOS may be worth investigating further. Consider consulting a gynecologist or endocrinologist for a comprehensive evaluation including blood tests and a pelvic ultrasound. Early intervention can prevent long-term complications.",
    color: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
  },
  Likely: {
    title: "Higher Risk — Please Consult a Specialist",
    desc: "Multiple indicators in your screening suggest a significant likelihood of PCOS. We strongly recommend scheduling an appointment with a gynecologist or endocrinologist as soon as possible. A definitive diagnosis requires clinical evaluation, blood work, and possibly an ultrasound. Early treatment makes a meaningful difference.",
    color: "from-red-500/10 to-red-500/5 border-red-500/20",
  },
};

const likelihoodColor: Record<string, string> = {
  Unlikely: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Possible: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Likely: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const likelihoodIcon: Record<string, React.ReactNode> = {
  Unlikely: <CheckCircle className="h-5 w-5 text-green-500" />,
  Possible: <TrendingUp className="h-5 w-5 text-yellow-500" />,
  Likely: <AlertTriangle className="h-5 w-5 text-red-500" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Results() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<ScreeningData | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        let dataToDisplay = null;
        if (id) {
          dataToDisplay = await getScreeningById(user.uid, id);
        } else {
          const history = await getScreeningHistory(user.uid);
          if (history.length > 0) {
            dataToDisplay = history[0];
          }
        }
        
        if (dataToDisplay) {
          setResultData(dataToDisplay);
        } else {
          toast.info("No screening results found. Take a screening first!");
          setLocation("/screening");
        }
      } catch (err) {
        console.error("Error loading results", err);
        toast.error("Failed to load your screening results.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-12 w-3/4 mb-2 rounded-xl" />
        <Skeleton className="h-6 w-1/2 mb-8 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!resultData) {
    return null; // Handled by useEffect redirect
  }

  const { result, ultrasoundResult, createdAt } = resultData;
  const rec = recommendations[result.likelihood];
  const dateStr = createdAt.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Screening Results</h1>
        <p className="text-muted-foreground">Assessed {dateStr} · Remember: this is a screening tool, not a diagnosis.</p>
      </motion.div>

      {/* Gauge Hero */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <Card className="glass-card rounded-2xl mb-6 overflow-hidden">
          <CardContent className="p-8 text-center">
            <PCOSGauge probability={result.probability} />
            <motion.div variants={fadeUp} custom={1} className="mt-4">
              <Badge className={`${likelihoodColor[result.likelihood]} text-base px-5 py-2 flex items-center gap-2 w-fit mx-auto`}>
                {likelihoodIcon[result.likelihood]}
                {result.likelihood} — {Math.round(result.probability * 100)}% probability
              </Badge>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ultrasound Result (if present) */}
      {ultrasoundResult && (
        <motion.div variants={fadeUp} custom={1.5} initial="hidden" animate="visible">
          <Card className="glass-card rounded-2xl mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <ImageIcon className="h-5 w-5" /> AI Ultrasound Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${ultrasoundResult.prediction === 'pcos' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  <p className="font-bold text-lg capitalize">{ultrasoundResult.prediction}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Confidence: {ultrasoundResult.confidence}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Our ResNet-50 AI model analyzed your scan and detected patterns consistent with {ultrasoundResult.prediction === 'pcos' ? 'PCOS' : 'a normal scan'}.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contributing Factors */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
        <Card className="glass-card rounded-2xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Contributing Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.factors.length === 0 ? (
              <p className="text-muted-foreground text-sm">No significant contributing factors identified.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.factors.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }}>
                    <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-sm border-primary/30 text-primary bg-primary/5">
                      {f}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendation */}
      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
        <Card className={`glass-card rounded-2xl mb-6 bg-gradient-to-br ${rec.color}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {likelihoodIcon[result.likelihood]}
              {rec.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{rec.desc}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
        <div className="flex gap-3 p-5 rounded-2xl bg-muted/50 border border-border/40 mb-8">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Medical Disclaimer: </strong>
            FemWell is an AI-powered screening tool designed for educational and informational purposes only. It is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider. If you think you may have PCOS, please consult a gynecologist or endocrinologist.
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
        <Link href="/screening">
          <Button variant="outline" className="rounded-xl gap-2">
            <ClipboardList className="h-4 w-4" /> Take Another Screening
          </Button>
        </Link>
        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4" /> Download Report
        </Button>
        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
          }}
        >
          <Share2 className="h-4 w-4" /> Share with Doctor
        </Button>
        <Link href="/learn">
          <Button className="rounded-xl gap-2">
            Learn More <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
