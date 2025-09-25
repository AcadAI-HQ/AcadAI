"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/types";
import { ArrowLeft, ArrowRight, User, Briefcase, BookOpen, Target } from "lucide-react";

interface OnboardingFormProps {
  onComplete: (data: Partial<UserProfile>) => Promise<void>;
  onSkip?: () => void;
  initialData?: Partial<UserProfile>;
  loading?: boolean;
}

const domains = [
  { id: 'frontend', name: 'Frontend Development', description: 'React, Vue, modern web technologies' },
  { id: 'backend', name: 'Backend Development', description: 'APIs, databases, system architecture' },
  { id: 'fullstack', name: 'Fullstack Development', description: 'Complete web application development' },
  { id: 'ml', name: 'Machine Learning', description: 'From foundations to MLOps and specialized applications' },
  { id: 'devops', name: 'DevOps', description: 'Infrastructure automation, CI/CD, cloud platforms' },
];

export default function OnboardingForm({ onComplete, onSkip, initialData, loading }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    userType: undefined,
    degree: '',
    startDate: '',
    endDate: '',
    currentYear: '',
    currentRole: '',
    yearsOfExperience: undefined,
    description: '',
    interestedDomain: '',
    domainExperience: '',
    ...initialData,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onComplete({ ...formData, profileComplete: true });
  };

  const updateFormData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canProceedFromStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return !!formData.userType;
      case 2:
        if (formData.userType === 'student') {
          return !!(formData.degree && formData.startDate && formData.endDate && formData.currentYear);
        }
        if (formData.userType === 'professional') {
          return !!(formData.currentRole && formData.yearsOfExperience);
        }
        if (formData.userType === 'learner') {
          return !!formData.description;
        }
        return false;
      case 3:
        return !!formData.interestedDomain;
      case 4:
        return !!formData.domainExperience && formData.domainExperience.length >= 20;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Complete Your Profile</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold">Who are you?</h3>
                  <p className="text-muted-foreground">This helps us tailor your learning experience</p>
                </div>

                <RadioGroup
                  value={formData.userType || ''}
                  onValueChange={(value) => updateFormData('userType', value as 'student' | 'professional' | 'learner')}
                  className="grid gap-4"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">College Student</div>
                        <div className="text-sm text-muted-foreground">Currently pursuing a degree</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional" className="cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Working Professional</div>
                        <div className="text-sm text-muted-foreground">Looking to pivot or upskill in tech</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="learner" id="learner" />
                    <Label htmlFor="learner" className="cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Independent Learner</div>
                        <div className="text-sm text-muted-foreground">Self-taught or career changer</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 2: User-specific Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold">Tell us more about yourself</h3>
                  <p className="text-muted-foreground">Help us understand your background</p>
                </div>

                {formData.userType === 'student' && (
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        placeholder="e.g., Bachelor of Computer Science"
                        value={formData.degree || ''}
                        onChange={(e) => updateFormData('degree', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="month"
                          value={formData.startDate || ''}
                          onChange={(e) => updateFormData('startDate', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">Expected End Date</Label>
                        <Input
                          id="endDate"
                          type="month"
                          value={formData.endDate || ''}
                          onChange={(e) => updateFormData('endDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currentYear">Current Year of Study</Label>
                      <Select value={formData.currentYear || ''} onValueChange={(value) => updateFormData('currentYear', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="5+">5th Year or Above</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.userType === 'professional' && (
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        placeholder="e.g., Marketing Manager, Sales Executive"
                        value={formData.currentRole || ''}
                        onChange={(e) => updateFormData('currentRole', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Select
                        value={formData.yearsOfExperience?.toString() || ''}
                        onValueChange={(value) => updateFormData('yearsOfExperience', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Less than 1 year</SelectItem>
                          <SelectItem value="1">1-2 years</SelectItem>
                          <SelectItem value="3">3-5 years</SelectItem>
                          <SelectItem value="6">6-10 years</SelectItem>
                          <SelectItem value="11">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.userType === 'learner' && (
                  <div>
                    <Label htmlFor="description">Describe Your Current Situation</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Self-taught programmer, Career changer from finance"
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      required
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Domain Selection */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold">What domain interests you?</h3>
                  <p className="text-muted-foreground">Choose the area you want to focus on</p>
                </div>

                <RadioGroup
                  value={formData.interestedDomain || ''}
                  onValueChange={(value) => updateFormData('interestedDomain', value)}
                  className="grid gap-4"
                >
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
                      <RadioGroupItem value={domain.id} id={domain.id} />
                      <Label htmlFor={domain.id} className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">{domain.name}</div>
                          <div className="text-sm text-muted-foreground">{domain.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 4: Experience Assessment */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold">Your Experience & Knowledge</h3>
                  <p className="text-muted-foreground">Tell us about your existing skills and experience in {domains.find(d => d.id === formData.interestedDomain)?.name}</p>
                </div>

                <div>
                  <Label htmlFor="domainExperience">
                    Describe your experience, skills, and existing knowledge
                    <span className="text-muted-foreground ml-1">(minimum 20 characters)</span>
                  </Label>
                  <Textarea
                    id="domainExperience"
                    placeholder="e.g., I have basic HTML/CSS knowledge from online courses, built a few small projects using JavaScript. Familiar with Git and have worked on a team project during college. Looking to learn React and modern development practices..."
                    value={formData.domainExperience || ''}
                    onChange={(e) => updateFormData('domainExperience', e.target.value)}
                    rows={6}
                    className="resize-none"
                    required
                    minLength={20}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {(formData.domainExperience || '').length} characters
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              {step === 1 && onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip}>
                  Skip for now
                </Button>
              )}
            </div>

            <div>
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedFromStep(step)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canProceedFromStep(step) || loading}
                >
                  {loading ? 'Completing...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}