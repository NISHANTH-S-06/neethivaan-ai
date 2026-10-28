"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, ArrowRight, MessageSquare, Scale } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center py-20 px-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-dark-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl w-full text-center space-y-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <Shield className="h-16 w-16 text-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-dark-blue dark:text-white leading-[0.9]">
            NEETHI<span className="text-gold">VAAN</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            The next generation of <span className="text-gold font-bold underline decoration-gold/30">AI-Powered</span> legal justice. Secure, transparent, and instant.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-gold hover:bg-gold/90 text-dark-blue font-bold text-lg shadow-xl shadow-gold/20 group">
            <Link href="/register" className="flex items-center gap-2">
              Register Case <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-bold text-lg">
            <Link href="/tracking" className="flex items-center gap-2">
              Track Status
            </Link>
          </Button>
        </motion.div>

        {/* Feature Tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: MessageSquare, label: "AI Consultation" },
            { icon: Scale, label: "Live Legal Tracking" },
            { icon: Shield, label: "Secure Identity" },
            { icon: ArrowRight, label: "Instant FIR" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <feature.icon className="h-5 w-5 text-gold/60" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

