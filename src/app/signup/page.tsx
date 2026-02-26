"use client";

import { BrainCircuit } from "lucide-react";
import { AuthComponent } from "@/components/ui/sign-up";

const Logo = () => (
  <div className="bg-primary text-primary-foreground rounded-md p-1.5">
    <BrainCircuit className="h-4 w-4" />
  </div>
);

export default function SignupPage() {
  return <AuthComponent logo={<Logo />} brandName="Acad AI" mode="signup" />;
}
