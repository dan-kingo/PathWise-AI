import React from 'react';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  icon, 
  title, 
  description, 
  time, 
  color 
}) => {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="text-gray-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;