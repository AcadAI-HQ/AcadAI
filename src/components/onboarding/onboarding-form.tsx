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

// Generate year options (from 10 years ago to 10 years in the future)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 21 }, (_, i) => (currentYear - 10 + i).toString());

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Helper to parse YYYY-MM format
const parseDateString = (dateStr: string | undefined) => {
  if (!dateStr) return { year: '', month: '' };
  const [year, month] = dateStr.split('-');
  return { year: year || '', month: month || '' };
};

// Helper to combine year and month into YYYY-MM format
const combineDateParts = (year: string, month: string) => {
  if (!year || !month) return '';
  return `${year}-${month}`;
};

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
    interestedDomains: [],
    interestedDomain: '',
    domainExperience: '',
    ...initialData,
  });

  // Separate state for date parts (for better UX with select dropdowns)
  const [startDateParts, setStartDateParts] = useState(() => parseDateString(initialData?.startDate));
  const [endDateParts, setEndDateParts] = useState(() => parseDateString(initialData?.endDate));

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
    // Combine date parts into proper format and prepare submission data
    const submissionData = {
      ...formData,
      profileComplete: true,
      startDate: combineDateParts(startDateParts.year, startDateParts.month),
      endDate: combineDateParts(endDateParts.year, endDateParts.month),
      // For backward compatibility, also set interestedDomains array
      interestedDomains: formData.interestedDomain ? [formData.interestedDomain] : [],
    };
    await onComplete(submissionData);
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
          const hasStartDate = !!(startDateParts.year && startDateParts.month);
          const hasEndDate = !!(endDateParts.year && endDateParts.month);
          return !!(formData.degree && hasStartDate && hasEndDate && formData.currentYear);
        }
        if (formData.userType === 'professional') {
          return !!(formData.currentRole && formData.yearsOfExperience);
        }
        if (formData.userType === 'learner') {
          return !!formData.description;
        }
        return false;
      case 3:
        return !!(formData.interestedDomain && formData.interestedDomain.trim().length > 0);
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

                    <div>
                      <Label>Start Date</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={startDateParts.month}
                          onValueChange={(value) => setStartDateParts(prev => ({ ...prev, month: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={startDateParts.year}
                          onValueChange={(value) => setStartDateParts(prev => ({ ...prev, year: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Expected End Date</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={endDateParts.month}
                          onValueChange={(value) => setEndDateParts(prev => ({ ...prev, month: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={endDateParts.year}
                          onValueChange={(value) => setEndDateParts(prev => ({ ...prev, year: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  <p className="text-muted-foreground">Enter the area you want to focus on</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="interestedDomain">Your Domain of Interest</Label>
                    <Input
                      id="interestedDomain"
                      placeholder="e.g., Frontend Development, Machine Learning, Data Science, Cybersecurity..."
                      value={formData.interestedDomain || ''}
                      onChange={(e) => updateFormData('interestedDomain', e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Examples: Frontend Development, Backend Development, Fullstack, Machine Learning, DevOps, Data Science, Cybersecurity, Mobile Development, Cloud Computing, etc.
                  </p>
                </div>
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
                  <p className="text-muted-foreground">
                    Tell us about your existing skills and experience in{' '}
                    {formData.interestedDomain || 'your selected domain'}
                  </p>
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