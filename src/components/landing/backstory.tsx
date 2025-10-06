"use client";

import { DottedSurface } from "../ui/dotted-surface";
import { PinContainer } from "../ui/3d-pin";
import Image from "next/image";

export function Backstory() {
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Dotted Surface Background */}
      <DottedSurface fixed={false} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Story Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-white mb-8">
            Born From Rejection
          </h2>
          <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
            <p>
              This platform didn&apos;t start as a grand vision to change education.
              It was born from pain—the frustration of sending out thousands of job
              applications and hearing nothing but silence.
            </p>
            <p>
              In a world where the tech job market moves at lightning speed, staying
              updated with the right skills felt impossible. Human judgment about
              what&apos;s &quot;worth learning&quot; is flawed, outdated, and often wrong.
            </p>
            <p>
              What started as a personal project—a desperate attempt to land a single
              job—evolved into something bigger. We realized that students, professionals,
              and anyone chasing a tech career faced the same struggle.
            </p>
            <p className="text-xl md:text-2xl font-semibold text-white">
              So we made it public. We made it free. We made it for everyone.
            </p>
          </div>
        </div>

        {/* Cofounders Cards */}
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto mt-64">
          {/* Bhaskar Card */}
          <div className="flex justify-center">
            <PinContainer
              title="Co-Founder, CEO"
              containerClassName="w-full"
            >
              <div className="flex flex-col w-[20rem] p-6 tracking-tight text-slate-100/50">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#29ABE2]">
                  <Image
                    src="/team/bhaskar.jpg"
                    alt="Bhaskar"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  Bhaskar
                </h3>
                <p className="text-sm text-[#29ABE2] font-semibold mb-4 text-center">
                  Co-Founder, CEO
                </p>
                <div className="text-base !m-0 p-4 font-normal bg-zinc-900/50 rounded-lg border border-white/10">
                  <span className="text-gray-300">
                    &quot;I created this platform as a personal project cause I got rejected
                    from 3000 job applications and I just wanted to land a job. So I
                    created it to keep updated with exact market-backed skills cause
                    humans make a lot of error in our judgment of what skills are worth
                    it and what are not.&quot;
                  </span>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Disshad Card */}
          <div className="flex justify-center">
            <PinContainer
              title="Co-Founder, CTO"
              containerClassName="w-full"
            >
              <div className="flex flex-col w-[20rem] p-6 tracking-tight text-slate-100/50">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#8E2DE2]">
                  <Image
                    src="/team/disshad.jpg"
                    alt="Disshad"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  Disshad
                </h3>
                <p className="text-sm text-[#8E2DE2] font-semibold mb-4 text-center">
                  Co-Founder, CTO
                </p>
                <div className="text-base !m-0 p-4 font-normal bg-zinc-900/50 rounded-lg border border-white/10">
                  <span className="text-gray-300">
                    &quot;I convinced that guy that what he had created was liquid gold
                    for students and anyone in the tech world wanting to land a job.
                    And we both launched this thing together.&quot;
                  </span>
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none z-[5]" />
    </section>
  );
}
