import React from 'react';
import ActionCard from './ActionCard';
import { Sparkles, Search, FileText, User } from 'lucide-react';

interface QuickActionsProps {
  onCareerPlannerClick: () => void;
  onProfileReviewerClick: () => void;
  onResumeReviewerClick: () => void;
  onProfileClick: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCareerPlannerClick,
  onProfileReviewerClick,
  onResumeReviewerClick,
  onProfileClick
}) => {
  const actions = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Generate AI Career Path",
      description: "Get a personalized learning roadmap tailored to your goals",
      onClick: onCareerPlannerClick,
      colorScheme: 'purple' as const
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "AI Profile Reviewer",
      description: "Get AI insights to optimize your LinkedIn and GitHub profiles",
      onClick: onProfileReviewerClick,
      colorScheme: 'blue' as const
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "AI Resume Reviewer",
      description: "Get comprehensive AI analysis of your resume and CV",
      onClick: onResumeReviewerClick,
      colorScheme: 'green' as const
    },
    {
      icon: <User className="w-5 h-5" />,
      title: "Update Profile",
      description: "Keep your information current for better recommendations",
      onClick: onProfileClick,
      colorScheme: 'orange' as const
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;