import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, ClipboardList, BarChart3, BookOpen, Shield, Star, ChevronRight, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-32 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/30 text-primary bg-primary/5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered Health Screening
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Take control of your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              hormonal health
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            FemWell helps you understand your PCOS risk through an intelligent screening tool — combining symptoms, lifestyle, and lab results for personalized insights.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isLoggedIn ? "/screening" : "/sign-up"}>
              <Button size="lg" className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 animate-pulse hover:animate-none">
                Start Your Screening
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl border-border/60">
                Learn About PCOS
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-500" /> Privacy first</span>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-secondary" fill="currentColor" /> 12,000+ women screened</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500" fill="currentColor" /> 4.9 star rating</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <motion.h2 variants={fadeUp} custom={0} className="text-4xl font-bold mb-4">Everything you need to understand PCOS</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-xl mx-auto">
            A comprehensive toolkit built with medical accuracy and compassion.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <ClipboardList className="h-7 w-7 text-primary" />,
              title: "Smart Symptom Survey",
              desc: "A guided multi-step questionnaire covering menstrual health, symptoms, lifestyle, and family history — calibrated by clinical PCOS criteria.",
              color: "from-primary/10 to-primary/5",
            },
            {
              icon: <BarChart3 className="h-7 w-7 text-secondary" />,
              title: "Lab Results Integration",
              desc: "Optionally add your lab values (LH, FSH, AMH, Testosterone) for a more precise probability score and deeper insights.",
              color: "from-secondary/10 to-secondary/5",
            },
            {
              icon: <BookOpen className="h-7 w-7 text-accent" />,
              title: "Educational Resources",
              desc: "Comprehensive guides on PCOS causes, treatments, lifestyle adjustments, and when to see a specialist — all in plain language.",
              color: "from-accent/10 to-accent/5",
            },
          ].map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="glass-card h-full hover:scale-[1.02] transition-transform duration-300 rounded-2xl">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24 bg-primary/5 dark:bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl font-bold mb-4">How it works</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg mb-16">Three simple steps to your screening results</motion.p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Answer the survey", desc: "Complete a 10-question symptom survey covering your menstrual cycle, physical symptoms, and medical history." },
                { num: "02", title: "Add lab results (optional)", desc: "For deeper accuracy, add your blood test values. No results? No problem — the survey alone provides meaningful insights." },
                { num: "03", title: "Get your results", desc: "Receive your personalized PCOS probability score, contributing factors, and tailored recommendations." },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp} custom={i + 2} className="text-left">
                  <div className="text-6xl font-bold text-primary/20 mb-3">{s.num}</div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                  {i < 2 && <ChevronRight className="hidden md:block absolute" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} custom={0} className="text-4xl font-bold text-center mb-4">Real women, real stories</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg text-center mb-16">Thousands of women have used FemWell to understand their health better.</motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Aisha M.", quote: "FemWell gave me the language to talk to my doctor. I finally understood what my symptoms meant and got diagnosed within weeks.", role: "Diagnosed in 2024" },
              { name: "Priya K.", quote: "I had no idea irregular periods and acne were connected. FemWell helped me connect the dots and take action before things got worse.", role: "PCOS Warrior" },
              { name: "Lauren R.", quote: "The lab results integration is incredible. I added my bloodwork and got insights I never would have understood on my own.", role: "Health advocate" },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2}>
                <Card className="glass-card rounded-2xl h-full">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mb-8 shadow-xl shadow-primary/30">
            <Heart className="h-10 w-10 text-white" fill="white" />
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-bold mb-4">Your health deserves answers</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg mb-8">
            Start your free PCOS screening today. No medical background needed — just honest answers and 5 minutes of your time.
          </motion.p>
          <motion.div variants={fadeUp} custom={3}>
            <Link href={isLoggedIn ? "/screening" : "/sign-up"}>
              <Button size="lg" className="h-14 px-10 text-base rounded-2xl shadow-lg shadow-primary/25">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-10 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-4 w-4 text-secondary" fill="currentColor" />
          <span className="font-semibold text-foreground">FemWell</span>
        </div>
        <p className="max-w-xl mx-auto mb-4">
          ⚠️ FemWell is a screening tool for educational purposes only. Not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span>© 2025 FemWell</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
