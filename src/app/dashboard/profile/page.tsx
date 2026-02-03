"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfilePictureUpload } from "@/components/profile/profile-picture-upload";
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  User,
  Mail,
  GraduationCap,
  Briefcase,
  BookOpen,
  Target,
  Calendar,
  Award,
  Clock
} from "lucide-react";
import ProfileEditModal from "@/components/dashboard/profile-edit-modal";

const domains = [
  { id: 'frontend', name: 'Frontend Development' },
  { id: 'backend', name: 'Backend Development' },
  { id: 'fullstack', name: 'Fullstack Development' },
  { id: 'ml', name: 'Machine Learning' },
  { id: 'devops', name: 'DevOps' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calculate profile completion
  let completionScore = 0;
  const maxScore = 4;

  if (user.userType) {
    completionScore++;
    if (user.userType === 'student') {
      if (user.degree && user.startDate && user.endDate && user.currentYear) {
        completionScore++;
      }
    } else if (user.userType === 'professional') {
      if (user.currentRole && user.yearsOfExperience) {
        completionScore++;
      }
    } else if (user.userType === 'learner') {
      if (user.description) {
        completionScore++;
      }
    }
  }

  if (user.interestedDomain) completionScore++;
  if (user.domainExperience && user.domainExperience.length >= 20) completionScore++;

  const completionPercentage = Math.round((completionScore / maxScore) * 100);

  const selectedDomain = domains.find(d => d.id === user.interestedDomain);

  const formatUserType = (type?: string) => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getYearsOfExperienceText = (years?: number) => {
    if (!years) return 'Not specified';
    if (years === 0) return 'Less than 1 year';
    if (years === 1) return '1-2 years';
    if (years === 3) return '3-5 years';
    if (years === 6) return '6-10 years';
    if (years === 11) return '10+ years';
    return `${years} years`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and learning preferences
          </p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
            <User className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <ProfilePictureUpload
                currentPhotoURL={user.photoURL}
                displayName={user.displayName}
                email={user.email}
                size="md"
              />
              <div>
                <p className="font-medium">{user.displayName}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 mr-1" />
                  {user.email}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Profile Completion</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} />
            </div>
          </CardContent>
        </Card>

        {/* User Type & Background */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Background</CardTitle>
            {user.userType === 'student' && <GraduationCap className="h-4 w-4 ml-auto text-muted-foreground" />}
            {user.userType === 'professional' && <Briefcase className="h-4 w-4 ml-auto text-muted-foreground" />}
            {user.userType === 'learner' && <BookOpen className="h-4 w-4 ml-auto text-muted-foreground" />}
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">User Type</p>
              <Badge variant="secondary" className="mt-1">
                {formatUserType(user.userType)}
              </Badge>
            </div>

            {user.userType === 'student' && (
              <>
                <div>
                  <p className="text-sm font-medium">Degree</p>
                  <p className="text-sm text-muted-foreground">
                    {user.degree || 'Not specified'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Duration
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.startDate && user.endDate
                        ? `${user.startDate} - ${user.endDate}`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Current Year
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.currentYear ? `${user.currentYear} Year` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {user.userType === 'professional' && (
              <>
                <div>
                  <p className="text-sm font-medium">Current Role</p>
                  <p className="text-sm text-muted-foreground">
                    {user.currentRole || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Experience
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getYearsOfExperienceText(user.yearsOfExperience)}
                  </p>
                </div>
              </>
            )}

            {user.userType === 'learner' && (
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">
                  {user.description || 'Not specified'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Preferences</CardTitle>
            <Target className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Interested Domain</p>
              <Badge variant="default" className="mt-1">
                {selectedDomain?.name || 'Not specified'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Domain Experience</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.domainExperience || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
            <CardDescription>
              Your listed skills and competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
}