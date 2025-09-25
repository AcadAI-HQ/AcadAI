"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserProfile } from "@/types";
import { User, Target, BookOpen } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Partial<UserProfile>) => Promise<void>;
  initialData?: Partial<UserProfile>;
  loading?: boolean;
  domainId?: string;
}

const domains = [
  { id: 'frontend', name: 'Frontend Development', description: 'React, Vue, modern web technologies' },
  { id: 'backend', name: 'Backend Development', description: 'APIs, databases, system architecture' },
  { id: 'fullstack', name: 'Fullstack Development', description: 'Complete web application development' },
  { id: 'ml', name: 'Machine Learning', description: 'From foundations to MLOps and specialized applications' },
  { id: 'devops', name: 'DevOps', description: 'Infrastructure automation, CI/CD, cloud platforms' },
];

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  onComplete,
  initialData,
  loading,
  domainId
}: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    userType: undefined,
    degree: '',
    startDate: '',
    endDate: '',
    currentYear: '',
    currentRole: '',
    yearsOfExperience: undefined,
    description: '',
    interestedDomain: domainId || '',
    domainExperience: '',
    ...initialData,
  });

  const updateFormData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.userType || !formData.interestedDomain || !formData.domainExperience ||
        (formData.domainExperience && formData.domainExperience.length < 20)) {
      return;
    }

    // User type specific validation
    if (formData.userType === 'student' && (!formData.degree || !formData.startDate || !formData.endDate || !formData.currentYear)) {
      return;
    }
    if (formData.userType === 'professional' && (!formData.currentRole || !formData.yearsOfExperience)) {
      return;
    }
    if (formData.userType === 'learner' && !formData.description) {
      return;
    }

    await onComplete({ ...formData, profileComplete: true });
  };

  const isFormValid = () => {
    if (!formData.userType || !formData.interestedDomain || !formData.domainExperience ||
        (formData.domainExperience && formData.domainExperience.length < 20)) {
      return false;
    }

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
  };

  const selectedDomain = domains.find(d => d.id === formData.interestedDomain);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Complete Your Profile to Generate Roadmap
          </DialogTitle>
          <DialogDescription>
            We need to know more about you to create a personalized roadmap. This will only take a minute.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <Label className="text-base font-medium flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              Who are you?
            </Label>
            <RadioGroup
              value={formData.userType || ''}
              onValueChange={(value) => updateFormData('userType', value as 'student' | 'professional' | 'learner')}
              className="grid gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="modal-student" />
                <Label htmlFor="modal-student" className="cursor-pointer">College Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="professional" id="modal-professional" />
                <Label htmlFor="modal-professional" className="cursor-pointer">Working Professional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="learner" id="modal-learner" />
                <Label htmlFor="modal-learner" className="cursor-pointer">Independent Learner</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Fields based on User Type */}
          {formData.userType === 'student' && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="modal-degree">Degree</Label>
                <Input
                  id="modal-degree"
                  placeholder="e.g., Bachelor of Computer Science"
                  value={formData.degree || ''}
                  onChange={(e) => updateFormData('degree', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modal-startDate">Start Date</Label>
                  <Input
                    id="modal-startDate"
                    type="month"
                    value={formData.startDate || ''}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="modal-endDate">End Date</Label>
                  <Input
                    id="modal-endDate"
                    type="month"
                    value={formData.endDate || ''}
                    onChange={(e) => updateFormData('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="modal-currentYear">Current Year</Label>
                <Select value={formData.currentYear || ''} onValueChange={(value) => updateFormData('currentYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
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
                <Label htmlFor="modal-currentRole">Current Role</Label>
                <Input
                  id="modal-currentRole"
                  placeholder="e.g., Marketing Manager, Sales Executive"
                  value={formData.currentRole || ''}
                  onChange={(e) => updateFormData('currentRole', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="modal-experience">Years of Experience</Label>
                <Select
                  value={formData.yearsOfExperience?.toString() || ''}
                  onValueChange={(value) => updateFormData('yearsOfExperience', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
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
              <Label htmlFor="modal-description">Describe Your Situation</Label>
              <Input
                id="modal-description"
                placeholder="e.g., Self-taught programmer, Career changer"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                required
              />
            </div>
          )}

          {/* Domain Selection */}
          <div>
            <Label className="text-base font-medium">Interested Domain</Label>
            <Select value={formData.interestedDomain || ''} onValueChange={(value) => updateFormData('interestedDomain', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDomain && (
              <p className="text-sm text-muted-foreground mt-1">{selectedDomain.description}</p>
            )}
          </div>

          {/* Experience Assessment */}
          <div>
            <Label htmlFor="modal-domainExperience" className="text-base font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Your Experience in {selectedDomain?.name || 'this domain'}
            </Label>
            <Textarea
              id="modal-domainExperience"
              placeholder="Describe your skills, experience, and knowledge in this domain (minimum 20 characters)"
              value={formData.domainExperience || ''}
              onChange={(e) => updateFormData('domainExperience', e.target.value)}
              rows={4}
              className="resize-none mt-2"
              required
              minLength={20}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {(formData.domainExperience || '').length} characters
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || loading}>
              {loading ? 'Saving...' : 'Complete Profile & Generate Roadmap'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}