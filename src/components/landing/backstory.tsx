"use client";

import { PinContainer } from "../ui/3d-pin";
import Image from "next/image";
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from "@radix-ui/react-avatar";

interface Message {
    sender: string;
    text: string;
    pfp: string | null;
}

interface MessageWithDelay extends Message {
    delay: number;
}

export function Backstory() {
    const { theme } = useTheme();
    const effectiveTheme = theme || 'dark';
    const chatRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState<MessageWithDelay[]>([]);

    // Profile pictures - change images here
    const BHASKAR_PFP = "https://images.pexels.com/photos/34147236/pexels-photo-34147236.jpeg";
    const ARSTOS_PFP = "https://images.pexels.com/photos/34147236/pexels-photo-34147236.jpeg";

    // Messages from your provided text
    const messages: Message[] = [
        { sender: 'Bhaskar', text: "Mate 3000th rejection today! I can't understand what's happening and stuff. What am I doing wrong? 😢", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "Mate that's a heck lot of rejections. I don't even know how to cheer you up anymore. The tech job market is completely chaotic right now.", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "Online courses and stuff are very outdated man. Like I have about 10 different courses on Udemy and I completed them all, but somehow even after an interview I get rejected.", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "I totally get it man. College curriculums outdated, and roadmaps online are heavily influenced by a person's own opinion rather than what actually is happening in the tech market.", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "Hey, what if I could make something that actual market data and listed actual skills that companies hire for, and also project ideas and stuff to stand out? 🤔", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "That would be something. You can try it out. What tech stack do you plan on using for it? 😋", pfp: ARSTOS_PFP },
        { sender: 'Arstos', text: "Mate??? You there?? 👀", pfp: ARSTOS_PFP },
        { sender: 'timestamp', text: "six hours later", pfp: null },
        { sender: 'Bhaskar', text: "Hey, so uh... I made it. Used nextjs, tailwind, and gemini for it. And it um... works.", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "😶", pfp: ARSTOS_PFP },
        { sender: 'Arstos', text: "How in the hell have you been rejected 3000 times if you can build stuff like this in 6 hours?", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "I don't know mate. But yeah, so I configured gemini to do market analysis and craft me data backed roadmaps for the frontend and also think up awesome project ideas to stand out.", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "Took you just 6 hours to build this? Damnn... what now?", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "What do you mean? I'm going to use this platform to hopefully land a job.", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "Dude 😑... You do realise what you created is something that heck lot of students and devs could benefit from right?", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "They will?", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "😶... Why did you build this platform?", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "Cause I got rejected... Ah, I see what you are talking about. Yes, it does seem like great idea.", pfp: BHASKAR_PFP },
        { sender: 'Arstos', text: "Wanna build it together and apply to YC?", pfp: ARSTOS_PFP },
        { sender: 'Bhaskar', text: "Let's roll, my guy! My own company sounds rather incredulous but still I'd rather do something to change something for students.", pfp: BHASKAR_PFP },
    ];

    // Calculate cumulative delays based on text length
    const messagesWithDelays = useMemo(() => {
        let cumulativeDelay = 0;
        return messages.map((msg) => {
            const baseDelay = msg.sender === 'timestamp' ? 1000 : 1500;
            const lengthDelay = msg.sender !== 'timestamp' ? msg.text.length * 15 : 0;
            cumulativeDelay += baseDelay + lengthDelay;
            return { ...msg, delay: cumulativeDelay };
        });
    }, []);

    // Intersection Observer to detect when chat div is in viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (chatRef.current) {
            observer.observe(chatRef.current);
        }

        return () => {
            if (chatRef.current) {
                observer.unobserve(chatRef.current);
            }
        };
    }, []);

    // Add messages one by one with delays
    useEffect(() => {
        if (isInView) {
            const timeouts: NodeJS.Timeout[] = [];
            messagesWithDelays.forEach((msg) => {
                const timeout = setTimeout(() => {
                    setVisibleMessages((prev) => {
                        const newMessages = [...prev, msg];
                        // Keep only messages that fit in view
                        // This will be handled by CSS overflow hidden and the messages will naturally push out old ones
                        return newMessages;
                    });
                }, msg.delay);
                timeouts.push(timeout);
            });

            return () => {
                timeouts.forEach(timeout => clearTimeout(timeout));
            };
        }
    }, [isInView, messagesWithDelays]);

    return (
        <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-black min-h-[600px]">
            {/* Content */}
            <div className="relative z-10 container mx-auto px-4">
                <div className="max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-white mb-4 text-center">
                        Our Story
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 text-center px-4">
                        This is how Acad AI started.
                    </p>

                    {/* Chat Container */}
                    <div className="relative px-2 sm:px-0">
                        <div
                            ref={chatRef}
                            className={`relative p-3 sm:p-4 rounded-2xl border-2 ${
                                effectiveTheme === 'dark'
                                    ? 'bg-black border-gray-600'
                                    : 'bg-white border-gray-300'
                            } shadow-lg h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden flex flex-col justify-end`}
                        >
                            <div className="space-y-4">
                                <AnimatePresence mode="sync">
                                    {visibleMessages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.4 }}
                                            className={`flex items-start ${
                                                msg.sender === 'Bhaskar'
                                                    ? 'justify-start'
                                                    : msg.sender === 'Arstos'
                                                    ? 'justify-end'
                                                    : 'justify-center'
                                            }`}
                                        >
                                            {msg.sender === 'timestamp' ? (
                                                <span className="text-xs text-gray-500 italic block text-center w-full">
                                                    {msg.text}
                                                </span>
                                            ) : (
                                                <div className={`flex items-start space-x-2 sm:space-x-3 ${
                                                    msg.sender === 'Arstos' ? 'flex-row-reverse space-x-reverse' : ''
                                                } max-w-[85%] sm:max-w-[75%] md:max-w-[70%]`}>
                                                    {msg.pfp && (
                                                        <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={msg.pfp}
                                                                alt={msg.sender}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs sm:text-sm font-semibold text-gray-300 mb-1 ${
                                                            msg.sender === 'Arstos' ? 'text-right' : ''
                                                        }`}>{msg.sender}</p>
                                                        <div className={`p-2 sm:p-3 rounded-lg text-white border ${
                                                            msg.sender === 'Arstos'
                                                                ? 'bg-blue-600/80 border-blue-500'
                                                                : 'bg-black border-gray-700'
                                                        }`}>
                                                            <p className="text-xs sm:text-sm md:text-base break-words">{msg.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                        {/* Gradient fade at top and bottom */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

                        {/* Founder Cards - Positioned absolutely outside chat on desktop, below on mobile */}
                        {/* Bhaskar Card - Left */}
                    </div>

                     <div className="hidden lg:block absolute -left-10 top-1/2 -translate-y-1/2">
                            <PinContainer
                                title="Co-Founder, CEO"
                                containerClassName="w-full"
                            >
                                <div className="flex flex-col items-center p-4 w-32">
                                    <p className="text-lg font-bold text-white mb-3">Bhaskar</p>
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white">
                                        <Image
                                            src={BHASKAR_PFP}
                                            alt="Bhaskar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </PinContainer>
                        </div>

                        {/* Arstos Card - Right */}
                        <div className="hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2">
                            <PinContainer
                                title="Co-Founder, CTO"
                                containerClassName="w-full"
                            >
                                <div className="flex flex-col items-center p-4 w-32">
                                    <p className="text-lg font-bold text-white mb-3">Arstos</p>
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white">
                                        <Image
                                            src={ARSTOS_PFP}
                                            alt="Arstos"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </PinContainer>
                        </div>

                    {/* Founder Cards for Mobile - Below chat */}
                    <div className="lg:hidden grid grid-cols-2 gap-4 mt-8">
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-white mb-2">
                                <Image
                                    src={BHASKAR_PFP}
                                    alt="Bhaskar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-base sm:text-lg font-bold text-white">Bhaskar</p>
                            <p className="text-xs sm:text-sm text-gray-400">Co-Founder, CEO</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-white mb-2">
                                <Image
                                    src={ARSTOS_PFP}
                                    alt="Arstos"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-base sm:text-lg font-bold text-white">Arstos</p>
                            <p className="text-xs sm:text-sm text-gray-400">Co-Founder, CTO</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20 pointer-events-none z-[5]" />
        </section>
    );
}