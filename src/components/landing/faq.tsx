"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

// GEO-optimized FAQs with clear, citation-friendly answers
const faqs = [
  {
    question: "What is Acad AI?",
    answer: "Acad AI is an AI-powered platform that generates hyper-personalized learning roadmaps for tech careers. It customizes learning paths based on your existing skills, proficiency level, and learning speed across domains like Frontend, Backend, Fullstack, Machine Learning, and DevOps.",
  },
  {
    question: "How does Acad AI personalize learning roadmaps?",
    answer: "Acad AI personalizes roadmaps through three key mechanisms: (1) Skills-based customization that adapts to your existing knowledge, (2) Proficiency tracking that matches content difficulty to your level, and (3) Learning speed optimization that adjusts pacing to your progress. This feature is upcoming soon along with AI chat assistant.",
  },
  {
    question: "What domains does Acad AI cover?",
    answer: "Acad AI provides comprehensive learning roadmaps for 14 major tech domains: Frontend Development (React, Vue, JavaScript), Backend Development (APIs, databases, Node.js, Python), Fullstack Development (MERN stack, complete web apps), Machine Learning (Python, TensorFlow, PyTorch, MLOps), and DevOps (CI/CD, Docker, Kubernetes, cloud platforms) and many others.",
  },
  {
    question: "Is Acad AI free to use?",
    answer: "No, we have had a free tier from last September but that free tier is no longer available.",
  },
  {
    question: "How is Acad AI different from other learning platforms?",
    answer: "Unlike generic learning platforms, Acad AI provides roadmaps that dynamically adapt to individual learners. The platform considers your existing skills, proficiency level, and learning pace to create a truly customized learning experience, rather than offering one-size-fits-all content.",
  },
  {
    question: "Who should use Acad AI?",
    answer: "Acad AI is ideal for career switchers transitioning into tech, self-taught developers seeking structured learning, bootcamp graduates deepening specific skills, and working professionals learning new technologies with limited time. The platform adapts to each user's background and goals.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
