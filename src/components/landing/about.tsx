"use client"

import { motion } from "framer-motion"
import { HeroVideoDialog } from "../ui/hero-video-dialog"
import { AuroraText } from "../ui/aurora-text"

export default function About() {
  return (
    <section id="about" className="relative w-full py-20 md:py-32 bg-black">
      <div className="container mx-auto px-4">
        <div className="space-y-12 md:space-y-16">
          {/* Text content - Left aligned */}
          <motion.div
            className="space-y-6 max-w-4xl"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xl md:text-2xl font-semibold tracking-lighter capitalize">
              <AuroraText colors={["#3546b5ff", "#1E90FF", "#00CED1", "#87CEEB"]}>Land that dream tech job faster.</AuroraText>
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              An AI that tells you exactly what the companies are hiring for, so that you can streamline your learning process.
            </h2>
          </motion.div>

          {/* Hero Video - Large and below text */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(41,171,226,0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#29ABE2]/20 to-[#8E2DE2]/20 rounded-2xl blur-3xl -z-10 transform scale-95" />

              <HeroVideoDialog
                className="w-full aspect-video"
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/mjYvkvTxrbQ"
                thumbnailSrc="/og-image.png"
                thumbnailAlt="AcadAI Demo Video"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
