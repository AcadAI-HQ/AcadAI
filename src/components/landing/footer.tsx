"use client";

import Link from "next/link";
import { BrainCircuit, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <span className="font-headline text-xl font-bold text-foreground">Acad AI</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI-powered roadmaps for your tech career.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Github /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
            </div>
          </div>

          <div>
            <h3 className="font-headline font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#about" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link href="#how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link href="#faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline font-semibold text-foreground">Roadmaps</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Frontend</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Backend</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Fullstack</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">DevOps</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Machine Learning</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Acad AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
