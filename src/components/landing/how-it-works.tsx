"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Target, Route } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      title: "1. Choose Your Path",
      description: "Sign up and select your desired career goal from our list of tech domains like Frontend, Backend, ML, and more.",
    },
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "2. Generate Your Roadmap",
      description: "Our AI analyzes current industry trends and job requirements to generate a personalized, step-by-step learning path just for you.",
    },
    {
      icon: <Route className="h-10 w-10 text-primary" />,
      title: "3. Start Learning",
      description: "Follow your tailored roadmap, track your progress, and access curated resources to master each skill on your journey.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Career Upgrade in Three Simple Steps
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Go from beginner to pro with a clear, guided path.
          </p>
        </div>

        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full text-center hover:border-primary transition-colors duration-300 shadow-lg hover:shadow-primary/20">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {step.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
