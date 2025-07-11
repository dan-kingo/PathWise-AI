import React from 'react';
import ActivityItem from './ActivityItem';
import { Sparkles, CheckCircle, Target } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const recentActivities = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: "Career path generated",
      description: "AI created your personalized roadmap",
      time: "2 hours ago",
      color: "bg-purple-50"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: "Profile completed",
      description: "All required information added",
      time: "1 day ago",
      color: "bg-green-50"
    },
    {
      icon: <Target className="w-5 h-5 text-blue-600" />,
      title: "Goal updated",
      description: "Target role set to Frontend Developer",
      time: "3 days ago",
      color: "bg-blue-50"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;