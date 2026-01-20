"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Lightbulb,
  BookOpen,
  Bug,
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";

const feedbackTypes = [
  {
    id: "general",
    label: "General Feedback",
    description: "Share your thoughts about the platform",
    icon: MessageSquare,
  },
  {
    id: "feature",
    label: "Feature Request",
    description: "Suggest a new feature or improvement",
    icon: Lightbulb,
  },
  {
    id: "domain",
    label: "Domain Request",
    description: "Request a new learning domain/roadmap",
    icon: BookOpen,
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Report an issue or problem",
    icon: Bug,
  },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "general",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current user's ID token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to submit feedback");
      }
      const token = await currentUser.getIdToken();

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          subject: formData.subject,
          message: formData.message,
          userEmail: user?.email,
          userName: user?.displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send feedback");
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ type: "general", subject: "", message: "" });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-500/50">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve Acad AI.
              </p>
              <Button onClick={handleReset} variant="outline">
                Submit Another Feedback
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve Acad AI by sharing your thoughts, requesting features, or suggesting new domains.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
            <CardDescription>
              Your feedback helps shape the future of Acad AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-3">
                <Label>What type of feedback do you have?</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {feedbackTypes.map((type) => (
                    <Label
                      key={type.id}
                      htmlFor={type.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.type === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <type.icon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder={
                    formData.type === "domain"
                      ? "e.g., Cybersecurity Roadmap"
                      : formData.type === "feature"
                      ? "e.g., Dark mode toggle"
                      : formData.type === "bug"
                      ? "e.g., Roadmap not loading"
                      : "Brief summary of your feedback"
                  }
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder={
                    formData.type === "domain"
                      ? "Describe the domain you'd like to see covered and why it would be valuable..."
                      : formData.type === "feature"
                      ? "Describe the feature you'd like to see and how it would help you..."
                      : formData.type === "bug"
                      ? "Describe the issue you encountered, including steps to reproduce it..."
                      : "Share your thoughts, suggestions, or feedback..."
                  }
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/2000
                </p>
              </div>

              {/* User Info Display */}
              {user && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Submitting as <span className="font-medium text-foreground">{user.displayName || user.email}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
