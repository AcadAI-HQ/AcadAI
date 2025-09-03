"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const Header = () => {
  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-white" />
          <span className="font-headline text-xl font-bold text-white">Acad AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
