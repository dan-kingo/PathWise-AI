import React from 'react';
import { Target, TrendingUp, BookOpen, Award } from 'lucide-react';
import StatCard from './StatusCard';

interface Profile {
  careerGoals?: {
    targetRole?: string;
  };
  experience?: {
    level?: string;
  };
  skills?: string[];
}

interface QuickStatsProps {
  profile: Profile | null;
  isProfileComplete: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ profile, isProfileComplete }) => {
  const quickStats = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      label: "Career Goal",
      value: profile?.careerGoals?.targetRole || "Not set",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      label: "Experience Level",
      value: profile?.experience?.level ? 
        profile.experience.level.charAt(0).toUpperCase() + profile.experience.level.slice(1) : 
        "Not set",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      label: "Skills",
      value: `${profile?.skills?.length || 0} skills`,
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Award className="w-6 h-6 text-orange-600" />,
      label: "Profile Status",
      value: isProfileComplete ? "Complete" : "Incomplete",
      color: isProfileComplete ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default QuickStats;