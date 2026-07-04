import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  HelpCircle, Activity, AlertTriangle, Stethoscope,
  Pill, Apple, Clock, XCircle, ArrowRight, BookOpen
} from "lucide-react";

const sections = [
  {
    icon: <HelpCircle className="h-5 w-5 text-primary" />,
    title: "What is PCOS?",
    content: `Polycystic Ovary Syndrome (PCOS) is one of the most common hormonal disorders affecting women of reproductive age, impacting approximately 1 in 10 women worldwide. It's characterized by hormonal imbalances, irregular menstrual cycles, and small fluid-filled sacs (follicles) on the ovaries that may or may not turn into cysts.

PCOS is a complex condition that varies widely between individuals. Some women have all three hallmark features (irregular periods, elevated androgens, and polycystic ovaries), while others may only have two. The condition is diagnosed using the Rotterdam criteria, which requires at least two of these three features.

Despite its name, not all women with PCOS have cysts on their ovaries, and having ovarian cysts alone does not mean you have PCOS.`,
  },
  {
    icon: <Activity className="h-5 w-5 text-secondary" />,
    title: "Common Symptoms",
    content: `PCOS manifests differently in every woman, but common symptoms include:

• **Irregular periods**: Menstrual cycles that are infrequent (fewer than 8 per year), too frequent, or unpredictable in timing.
• **Excess androgen**: Elevated levels of male hormones may result in physical signs such as excess facial and body hair (hirsutism), severe acne, and male-pattern baldness or thinning hair.
• **Polycystic ovaries**: Enlarged ovaries with multiple follicles visible on ultrasound.
• **Weight gain**: Many women with PCOS struggle with weight gain or find it difficult to lose weight, particularly around the abdomen.
• **Skin changes**: Darkening of skin in body creases and folds (acanthosis nigricans), skin tags, and persistent acne.
• **Mood symptoms**: Depression, anxiety, and mood swings are more common in women with PCOS.
• **Difficulty conceiving**: PCOS is one of the leading causes of female infertility due to irregular or absent ovulation.`,
  },
  {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    title: "Causes & Risk Factors",
    content: `The exact cause of PCOS isn't fully understood, but several factors play a role:

**Insulin resistance**: Up to 70% of women with PCOS have insulin resistance, meaning their cells don't respond effectively to insulin. This causes the pancreas to produce more insulin, which may stimulate the ovaries to produce more androgens.

**Hormonal imbalances**: Elevated levels of luteinizing hormone (LH) relative to follicle-stimulating hormone (FSH), along with excess androgens, disrupt the normal hormonal signaling needed for ovulation.

**Low-grade inflammation**: Research suggests that women with PCOS often have a type of low-grade inflammation that stimulates polycystic ovaries to produce androgens.

**Genetics**: PCOS tends to run in families. If your mother, sister, or aunt has PCOS, your risk is significantly higher. Several genes may contribute, though no single gene has been identified.

**Risk factors include**: family history of PCOS, obesity (excess weight worsens insulin resistance), and type 2 diabetes.`,
  },
  {
    icon: <Stethoscope className="h-5 w-5 text-accent" />,
    title: "How is PCOS Diagnosed?",
    content: `There is no single test to definitively diagnose PCOS. Diagnosis typically involves:

**Medical history**: Your doctor will ask about your menstrual cycle, weight changes, and other symptoms. Family history of PCOS or diabetes is also relevant.

**Physical examination**: Checking for signs of excess androgen such as extra hair growth and acne, as well as signs of insulin resistance like acanthosis nigricans.

**Blood tests**: 
- Hormone levels: LH, FSH, testosterone, DHEAS, and prolactin
- Metabolic tests: fasting glucose, insulin, and cholesterol
- Thyroid function tests to rule out thyroid disorders
- AMH (Anti-Müllerian Hormone) levels, which are often elevated in PCOS

**Pelvic ultrasound**: To examine the appearance of the ovaries and the thickness of the uterine lining. Polycystic ovaries show 20 or more follicles per ovary or increased ovarian volume.

The Rotterdam criteria (2003) requires at least 2 of 3: irregular periods, clinical/biochemical hyperandrogenism, and polycystic ovaries on ultrasound.`,
  },
  {
    icon: <Pill className="h-5 w-5 text-purple-500" />,
    title: "Treatment Options",
    content: `PCOS treatment is tailored to your specific symptoms and goals:

**Lifestyle modifications** (first-line treatment):
- Even a 5–10% reduction in body weight can significantly improve hormonal balance, menstrual regularity, and fertility
- Regular exercise improves insulin sensitivity
- A balanced, anti-inflammatory diet

**Medications for menstrual regulation**:
- Combined oral contraceptives (birth control pills): Regulate periods and reduce androgen levels
- Progestin therapy: Helps regulate cycles when estrogen isn't needed

**Medications for insulin resistance**:
- Metformin: Originally used for type 2 diabetes, it improves insulin sensitivity and can restore ovulation

**For fertility**:
- Letrozole (first-line) or Clomiphene citrate: Ovulation induction medications
- Gonadotropins: Injectable hormones to stimulate ovulation
- IVF: For cases where other treatments haven't worked

**For excess hair/acne**:
- Anti-androgen medications (spironolactone)
- Topical treatments and eflornithine cream`,
  },
  {
    icon: <Apple className="h-5 w-5 text-green-500" />,
    title: "Lifestyle & Diet Tips",
    content: `Lifestyle changes are often the most powerful tool in managing PCOS:

**Diet recommendations**:
- Follow a low-glycemic index (GI) diet to reduce insulin spikes
- Eat plenty of fiber-rich vegetables, legumes, and whole grains
- Include anti-inflammatory foods: fatty fish (salmon, sardines), berries, leafy greens, olive oil, and nuts
- Limit processed foods, refined carbohydrates, and sugary drinks
- Consider a Mediterranean-style diet, which has the most research support for PCOS

**Exercise**:
- Aim for 150 minutes of moderate-intensity exercise per week
- Combine cardio (walking, swimming, cycling) with strength training
- High-intensity interval training (HIIT) can be especially effective for insulin sensitivity
- Even a 30-minute daily walk makes a measurable difference

**Stress management**:
- Chronic stress raises cortisol, which worsens insulin resistance and hormonal imbalance
- Practice mindfulness, yoga, meditation, or deep breathing
- Prioritize 7–9 hours of quality sleep per night

**Supplements** (discuss with your doctor first):
- Inositol (myo-inositol + D-chiro-inositol): Strong evidence for improving insulin sensitivity and ovulation in PCOS
- Vitamin D: Often deficient in women with PCOS
- Omega-3 fatty acids: Help reduce inflammation`,
  },
  {
    icon: <Clock className="h-5 w-5 text-orange-500" />,
    title: "When to See a Doctor",
    content: `You should seek medical evaluation if you experience any of the following:

• **Irregular or absent periods**: If your cycles are consistently irregular (shorter than 21 days or longer than 35 days), absent for 3+ months, or very unpredictable
• **Signs of excess androgen**: Unwanted hair growth on the face, chest, or back; persistent acne that doesn't respond to typical treatments; or significant hair thinning or loss on the scalp
• **Difficulty getting pregnant**: If you've been trying to conceive for 12 months (or 6 months if you're over 35) without success
• **Unexplained weight gain**: Particularly around the abdomen, or difficulty losing weight despite diet and exercise
• **Skin changes**: Darkening of skin in body creases, especially the neck, groin, or under the breasts
• **Significant mood changes**: Depression or anxiety that interferes with daily life

Early diagnosis and management of PCOS can reduce the risk of long-term complications including type 2 diabetes, cardiovascular disease, endometrial cancer, and sleep apnea.`,
  },
  {
    icon: <XCircle className="h-5 w-5 text-red-400" />,
    title: "Myths vs. Facts",
    content: `**Myth: You can't get pregnant if you have PCOS.**
Fact: Many women with PCOS do conceive, either naturally or with medical assistance. While PCOS is a leading cause of infertility, it's also very treatable with medications like letrozole.

**Myth: You need to have cysts to be diagnosed with PCOS.**
Fact: Despite the name, having ovarian cysts is not required for a PCOS diagnosis. Many women with PCOS have no visible cysts, and having cysts alone doesn't mean you have PCOS.

**Myth: PCOS only affects overweight women.**
Fact: PCOS affects women of all body types. "Lean PCOS" affects women with a normal BMI and can be harder to identify but is equally valid.

**Myth: Once you have PCOS, you'll always have it.**
Fact: PCOS symptoms can improve significantly with lifestyle changes, and some women find their symptoms diminish after menopause. It's manageable.

**Myth: Birth control pills cure PCOS.**
Fact: Birth control pills manage symptoms (like irregular periods and acne) but don't treat the underlying hormonal imbalances. Symptoms often return when you stop taking them.

**Myth: PCOS is rare.**
Fact: PCOS affects approximately 1 in 10 women of reproductive age worldwide — it's one of the most common hormonal disorders.`,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Learn() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-[20%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-[15%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <motion.div initial="hidden" animate="visible" className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
            <BookOpen className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-5xl font-bold mb-4">Understanding PCOS</motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about Polycystic Ovary Syndrome — from symptoms to treatment, explained clearly and compassionately.
          </motion.p>
        </motion.div>
      </section>

      {/* Accordion Sections */}
      <section className="px-4 py-12 max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Accordion type="single" collapsible className="space-y-3">
            {sections.map((section, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <AccordionItem value={`item-${i}`} className="glass-card rounded-2xl border border-border/60 px-2 overflow-hidden">
                  <AccordionTrigger className="px-4 py-5 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        {section.icon}
                      </div>
                      <span className="font-semibold text-base">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5">
                    <div className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line pl-12">
                      {section.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <Card className="glass-card rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-10">
              <motion.div variants={fadeUp} custom={0}>
                <Stethoscope className="h-12 w-12 text-primary mx-auto mb-5" />
                <h2 className="text-3xl font-bold mb-3">Consult a Specialist</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  FemWell is a screening tool, not a diagnosis. If you're experiencing PCOS symptoms, speaking with a gynecologist or endocrinologist is the most important next step.
                </p>
                <Link href="/screening">
                  <Button size="lg" className="rounded-xl gap-2">
                    Start Your Screening First <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
