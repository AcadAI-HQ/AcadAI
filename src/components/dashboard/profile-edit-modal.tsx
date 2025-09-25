"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";
import { User, Briefcase, Target, Save, X } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

const domains = [
  { id: 'frontend', name: 'Frontend Development', description: 'React, Vue, modern web technologies' },
  { id: 'backend', name: 'Backend Development', description: 'APIs, databases, system architecture' },
  { id: 'fullstack', name: 'Fullstack Development', description: 'Complete web application development' },
  { id: 'ml', name: 'Machine Learning', description: 'From foundations to MLOps and specialized applications' },
  { id: 'devops', name: 'DevOps', description: 'Infrastructure automation, CI/CD, cloud platforms' },
  { id: 'cybersecurity', name: 'CyberSecurity', description: 'Information security, ethical hacking, and digital defense' },
  { id: 'data-science', name: 'Data Science', description: 'Statistical analysis, business intelligence, and data-driven insights' },
];

export default function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: user.displayName || '',
    userType: user.userType || undefined,

    // Student fields
    degree: user.degree || '',
    startDate: user.startDate || '',
    endDate: user.endDate || '',
    currentYear: user.currentYear || '',

    // Professional fields
    currentRole: user.currentRole || '',
    yearsOfExperience: user.yearsOfExperience || undefined,

    // Learner fields
    description: user.description || '',

    // Common fields
    interestedDomain: user.interestedDomain || '',
    domainExperience: user.domainExperience || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        displayName: user.displayName || '',
        userType: user.userType || undefined,
        degree: user.degree || '',
        startDate: user.startDate || '',
        endDate: user.endDate || '',
        currentYear: user.currentYear || '',
        currentRole: user.currentRole || '',
        yearsOfExperience: user.yearsOfExperience || undefined,
        description: user.description || '',
        interestedDomain: user.interestedDomain || '',
        domainExperience: user.domainExperience || '',
      });
    }
  }, [isOpen, user]);

  const updateFormData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!formData.displayName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.userType) {
      toast({
        title: "Validation Error",
        description: "Please select your user type.",
        variant: "destructive",
      });
      return false;
    }

    // User type specific validation
    if (formData.userType === 'student') {
      if (!formData.degree || !formData.startDate || !formData.endDate || !formData.currentYear) {
        toast({
          title: "Validation Error",
          description: "Please fill all student information fields.",
          variant: "destructive",
        });
        return false;
      }
    } else if (formData.userType === 'professional') {
      if (!formData.currentRole || formData.yearsOfExperience === undefined) {
        toast({
          title: "Validation Error",
          description: "Please fill all professional information fields.",
          variant: "destructive",
        });
        return false;
      }
    } else if (formData.userType === 'learner') {
      if (!formData.description) {
        toast({
          title: "Validation Error",
          description: "Please provide a description of your current situation.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (!formData.interestedDomain) {
      toast({
        title: "Validation Error",
        description: "Please select your interested domain.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.domainExperience || formData.domainExperience.length < 20) {
      toast({
        title: "Validation Error",
        description: "Please provide at least 20 characters describing your domain experience.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateUserProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDomain = domains.find(d => d.id === formData.interestedDomain);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information to get better personalized roadmaps.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="preferences">Learning Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Basic information about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName || ''}
                    onChange={(e) => updateFormData('displayName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">What best describes you?</Label>
                  <RadioGroup
                    value={formData.userType || ''}
                    onValueChange={(value) => updateFormData('userType', value as 'student' | 'professional' | 'learner')}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">College Student</div>
                          <div className="text-sm text-muted-foreground">Currently pursuing a degree</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">Working Professional</div>
                          <div className="text-sm text-muted-foreground">Looking to pivot or upskill in tech</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="learner" id="learner" />
                      <Label htmlFor="learner" className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">Independent Learner</div>
                          <div className="text-sm text-muted-foreground">Self-taught or career changer</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Background Information
                </CardTitle>
                <CardDescription>Tell us more about your background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.userType === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        placeholder="e.g., Bachelor of Computer Science"
                        value={formData.degree || ''}
                        onChange={(e) => updateFormData('degree', e.target.value)}
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
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">Expected End Date</Label>
                        <Input
                          id="endDate"
                          type="month"
                          value={formData.endDate || ''}
                          onChange={(e) => updateFormData('endDate', e.target.value)}
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
                  </>
                )}

                {formData.userType === 'professional' && (
                  <>
                    <div>
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        placeholder="e.g., Marketing Manager, Sales Executive"
                        value={formData.currentRole || ''}
                        onChange={(e) => updateFormData('currentRole', e.target.value)}
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
                  </>
                )}

                {formData.userType === 'learner' && (
                  <div>
                    <Label htmlFor="description">Describe Your Current Situation</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Self-taught programmer, Career changer from finance"
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>What domain interests you and your experience level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="interestedDomain">Interested Domain</Label>
                  <Select value={formData.interestedDomain || ''} onValueChange={(value) => updateFormData('interestedDomain', value)}>
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="domainExperience">
                    Your Experience in {selectedDomain?.name || 'this domain'}
                    <span className="text-muted-foreground ml-1">(minimum 20 characters)</span>
                  </Label>
                  <Textarea
                    id="domainExperience"
                    placeholder="Describe your skills, experience, and knowledge in this domain..."
                    value={formData.domainExperience || ''}
                    onChange={(e) => updateFormData('domainExperience', e.target.value)}
                    rows={4}
                    className="resize-none"
                    minLength={20}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {(formData.domainExperience || '').length} characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}