"use client";

import type { Roadmap } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RoadmapViewProps {
  roadmap: Roadmap;
}

export function RoadmapView({ roadmap }: RoadmapViewProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const stageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  const moduleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mt-8">
      <motion.div 
        className="relative pl-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-border -translate-x-1/2"></div>
        {roadmap.stages.map((stage, stageIndex) => (
          <motion.div key={stageIndex} className="relative mb-8" variants={stageVariants}>
            <div className="absolute left-[39px] top-4 -translate-x-1/2 -translate-y-1/2 bg-background p-1 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-12">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{stage.title}</CardTitle>
                  <CardDescription>{stage.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>View Modules</AccordionTrigger>
                      <AccordionContent>
                        <motion.ul 
                          className="space-y-4 mt-4"
                          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                          {stage.modules.map((module, moduleIndex) => (
                            <motion.li key={moduleIndex} className="flex items-start gap-4" variants={moduleVariants}>
                              <Circle className="h-3 w-3 mt-1.5 text-primary/70 shrink-0" />
                              <div>
                                <h4 className="font-semibold">{module.title}</h4>
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                              </div>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
