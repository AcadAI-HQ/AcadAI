'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, BookOpen, Zap, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the announcement has been shown before
    const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement_jan2026');
    if (!hasSeenAnnouncement) {
      // Show modal after a short delay for better UX
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenAnnouncement_jan2026', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-black rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Animated border trail */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 border-trail" />
              </div>

              {/* Content container */}
              <div className="relative z-10">
                {/* Header */}
                <div className="relative p-8 pb-6 border-b border-gray-800">
                  <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close announcement"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#29ABE2] rounded-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#29ABE2]">
                      Important Updates
                    </h2>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Thank you for being part of our community
                  </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Pricing Change */}
                  <div className="relative bg-black rounded-xl p-6">
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 border-trail-box" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        Changes to Free Access
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Due to my co-founder leaving the project, I can no longer sustain the API costs for market research features alone.
                        <span className="block mt-2 font-medium text-[#29ABE2]">
                          The free tier is temporarily removed for the foreseeable future, but it will return.
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm mt-3 italic">
                        I appreciate your understanding during this transition period.
                      </p>
                    </div>
                  </div>

                  {/* New Features */}
                  <div className="relative bg-black rounded-xl p-6">
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 border-trail-box" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        Exciting New Features
                      </h3>

                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <BookOpen className="w-5 h-5 text-[#29ABE2]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">7 New Domains Added</h4>
                            <p className="text-gray-300 text-sm">
                              Expanded our collection with Android, iOS, Blockchain, UI/UX, Product Engineering, and both AAA & Indie Game Development roadmaps.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Calendar className="w-5 h-5 text-[#8E2DE2]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Weekly Learning Resources</h4>
                            <p className="text-gray-300 text-sm">
                              Each domain now includes curated learning resources that will be updated every week with fresh content, tutorials, and materials.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hyperpersonalization Update */}
                  <div className="relative bg-black rounded-xl p-6">
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 border-trail-box" style={{ animationDelay: '1s' }} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Hyperpersonalization Coming Soon
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        The AI-powered hyperpersonalization feature has been delayed as my co-founder who was working on it has left.
                        <span className="block mt-2 font-medium text-[#8E2DE2]">
                          However, since I'm now building it from scratch, I'm making it more advanced and better than originally planned.
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm mt-3">
                        Stay tuned for an even more powerful personalization experience!
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-gray-800">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 px-6 bg-[#29ABE2] text-white font-semibold rounded-lg hover:bg-[#2196ce] transition-colors"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            @keyframes borderTrail {
              0% {
                background: conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  #29ABE2 90deg,
                  #8E2DE2 180deg,
                  transparent 270deg,
                  transparent 360deg
                );
              }
              100% {
                background: conic-gradient(
                  from 360deg,
                  transparent 0deg,
                  #29ABE2 90deg,
                  #8E2DE2 180deg,
                  transparent 270deg,
                  transparent 360deg
                );
              }
            }

            .border-trail {
              position: absolute;
              inset: -2px;
              border-radius: 1rem;
              padding: 2px;
              background: conic-gradient(
                from 0deg,
                transparent 0deg,
                #29ABE2 90deg,
                #8E2DE2 180deg,
                transparent 270deg,
                transparent 360deg
              );
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              animation: borderTrail 3s linear infinite;
            }

            .border-trail-box {
              position: absolute;
              inset: -1px;
              border-radius: 0.75rem;
              padding: 1px;
              background: conic-gradient(
                from 0deg,
                transparent 0deg,
                #29ABE2 90deg,
                #8E2DE2 180deg,
                transparent 270deg,
                transparent 360deg
              );
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              animation: borderTrail 3s linear infinite;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
