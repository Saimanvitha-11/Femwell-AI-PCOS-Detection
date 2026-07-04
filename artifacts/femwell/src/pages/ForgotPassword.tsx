import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const schema = z.object({ email: z.string().email("Please enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(315,50%,98%)] to-[hsl(262,40%,98%)] dark:from-[hsl(262,51%,13%)] dark:to-[hsl(263,60%,10%)]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="h-7 w-7 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">FemWell</span>
          </Link>
        </div>

        <Card className="glass-card rounded-2xl border-border/60 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot password?</CardTitle>
            <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Check your inbox</h3>
                <p className="text-muted-foreground text-sm mb-6">We've sent a password reset link to your email. The link expires in 1 hour.</p>
                <Link href="/sign-in">
                  <Button variant="outline" className="rounded-xl gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="rounded-xl h-11" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Link href="/sign-in">
                  <Button type="button" variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
