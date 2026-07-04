import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getScreeningHistory } from "@/lib/firestore";
import type { ScreeningData } from "@/lib/firestore";
import {
  ClipboardList, BarChart3, BookOpen, ChevronRight,
  Heart, Calendar, TrendingUp, Activity, ChevronLeft, Lightbulb, AlertCircle
} from "lucide-react";
import { PCOSGauge } from "@/components/PCOSGauge";

const healthTips = [
  { icon: <Activity className="h-5 w-5" />, title: "Exercise Regularly", tip: "Regular exercise helps regulate insulin levels and can significantly reduce PCOS symptoms." },
  { icon: <Heart className="h-5 w-5" />, title: "Anti-inflammatory Diet", tip: "Leafy greens, berries, and fatty fish can help manage inflammation associated with PCOS." },
  { icon: <Lightbulb className="h-5 w-5" />, title: "Stress Management", tip: "Yoga, meditation, and deep breathing may improve hormonal balance by lowering cortisol." },
  { icon: <Calendar className="h-5 w-5" />, title: "Track Your Cycle", tip: "Tracking your period helps identify patterns, monitor symptoms, and prepare for doctor visits." },
  { icon: <TrendingUp className="h-5 w-5" />, title: "Prioritize Sleep", tip: "Getting 7–9 hours of quality sleep supports hormonal regulation and metabolic health." },
];

const likelihoodColor: Record<string, string> = {
  Unlikely: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Possible: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Likely: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const quotes = [
  "Your health is an investment, not an expense.",
  "Knowledge is the first step to healing.",
  "Small steps every day lead to big changes.",
  "You deserve to understand your own body.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<(ScreeningData & { id: string })[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const data = await getScreeningHistory(user.uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch screening history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(i => (i + 1) % healthTips.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const quote = quotes[new Date().getDay() % quotes.length];
  const latest = history.length > 0 ? history[0] : null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="glass-card rounded-2xl p-6 md:p-8 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{today}</p>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0] || "User"} 👋</h1>
              <p className="text-muted-foreground italic">"{quote}"</p>
            </div>
            <div className="shrink-0">
              <Link href="/screening">
                <Button size="lg" className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <ClipboardList className="h-5 w-5" /> New Screening
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <ClipboardList className="h-8 w-8 text-primary" />, title: "New Screening", desc: "Start a fresh PCOS assessment", href: "/screening", color: "from-primary/10 to-primary/5" },
          { icon: <BarChart3 className="h-8 w-8 text-secondary" />, title: "View Results", desc: "Check your latest screening results", href: "/results", color: "from-secondary/10 to-secondary/5" },
          { icon: <BookOpen className="h-8 w-8 text-accent" />, title: "Learn About PCOS", desc: "Explore educational resources", href: "/learn", color: "from-accent/10 to-accent/5" },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <Link href={card.href}>
              <Card className={`glass-card rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br ${card.color} h-full`}>
                <CardContent className="p-6">
                  <div className="mb-4">{card.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-4" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Latest Assessment */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
          <Card className="glass-card rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Latest Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {loading ? (
                <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <div className="flex-1 space-y-2 w-full">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ) : latest ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="shrink-0">
                    <PCOSGauge probability={latest.result.probability} size="sm" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge className={`${likelihoodColor[latest.result.likelihood]} mb-3`}>{latest.result.likelihood}</Badge>
                    <p className="text-sm text-muted-foreground mb-2">Assessed on {latest.createdAt.toDate().toLocaleDateString()}</p>
                    <div className="space-y-1 mb-4">
                      {latest.result.factors.slice(0, 2).map((f, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{f}
                        </p>
                      ))}
                    </div>
                    <Link href={`/results/${latest.id}`}>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1">View Details <ChevronRight className="h-3 w-3" /></Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium mb-1">No assessments yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Take your first screening to see your results here.</p>
                  <Link href="/screening">
                    <Button size="sm" className="rounded-xl">Start Screening</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Tips Carousel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="h-full">
          <Card className="glass-card rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" /> Health Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <motion.div
                key={tipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="min-h-[100px]"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    {healthTips[tipIndex].icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{healthTips[tipIndex].title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{healthTips[tipIndex].tip}</p>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  {healthTips.map((_, i) => (
                    <button key={i} onClick={() => setTipIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === tipIndex ? "bg-primary w-4" : "bg-muted-foreground/30"}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setTipIndex(i => (i - 1 + healthTips.length) % healthTips.length)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setTipIndex(i => (i + 1) % healthTips.length)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Assessment History */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Assessment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : history.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 No screening history available.
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/40">
                      <th className="text-left py-3 pr-4 font-medium">Date</th>
                      <th className="text-left py-3 pr-4 font-medium">Probability</th>
                      <th className="text-left py-3 pr-4 font-medium">Likelihood</th>
                      <th className="text-left py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {history.map(a => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">{a.createdAt.toDate().toLocaleDateString()}</td>
                        <td className="py-3 pr-4 font-medium">{Math.round(a.result.probability * 100)}%</td>
                        <td className="py-3 pr-4">
                          <Badge className={`${likelihoodColor[a.result.likelihood]} text-xs`}>{a.result.likelihood}</Badge>
                        </td>
                        <td className="py-3">
                          <Link href={`/results/${a.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 rounded-lg text-xs gap-1 text-primary">
                              View <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
