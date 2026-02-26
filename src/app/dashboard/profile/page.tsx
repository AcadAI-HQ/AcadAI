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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and learning preferences
          </p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Identity hero card */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <ProfilePictureUpload
              currentPhotoURL={user.photoURL}
              displayName={user.displayName}
              email={user.email}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold leading-tight">{user.displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.userType && (
                <Badge variant="secondary" className="mt-2 capitalize text-xs">
                  {user.userType}
                </Badge>
              )}
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-xs text-muted-foreground mb-1.5">Profile completion</p>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: completionPercentage >= 75 ? '#22C55E' : completionPercentage >= 50 ? '#F97316' : '#EF4444' }}
                >
                  {completionPercentage}%
                </span>
                <Progress value={completionPercentage} className="w-28 h-1.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information — removed (moved to hero) */}
        {/* Background card */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Background</CardTitle>
            {user.userType === 'student'      && <GraduationCap className="h-4 w-4 ml-auto text-muted-foreground" />}
            {user.userType === 'professional' && <Briefcase className="h-4 w-4 ml-auto text-muted-foreground" />}
            {user.userType === 'learner'      && <BookOpen className="h-4 w-4 ml-auto text-muted-foreground" />}
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">User Type</p>
              <Badge variant="secondary" className="capitalize text-xs">
                {user.userType ? user.userType : 'Not specified'}
              </Badge>
            </div>

            {user.userType === 'student' && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Degree</p>
                  <p className="text-sm">{user.degree || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Duration
                    </p>
                    <p className="text-xs">
                      {user.startDate && user.endDate ? `${user.startDate} – ${user.endDate}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Award className="h-3 w-3" /> Year
                    </p>
                    <p className="text-xs">{user.currentYear ? `Year ${user.currentYear}` : 'Not specified'}</p>
                  </div>
                </div>
              </>
            )}

            {user.userType === 'professional' && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Role</p>
                  <p className="text-sm">{user.currentRole || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Experience
                  </p>
                  <p className="text-sm">{getYearsOfExperienceText(user.yearsOfExperience)}</p>
                </div>
              </>
            )}

            {user.userType === 'learner' && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">About</p>
                <p className="text-sm leading-relaxed">{user.description || 'Not specified'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Learning Preferences</CardTitle>
            <Target className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Interested Domain</p>
              {selectedDomain ? (
                <Badge className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6]/15">
                  {selectedDomain.name}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Domain Experience</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.domainExperience || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Skills</CardTitle>
            <CardDescription className="text-xs">Your listed skills and competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
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