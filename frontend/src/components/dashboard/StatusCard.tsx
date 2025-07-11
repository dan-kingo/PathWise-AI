import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className={`bg-white rounded-xl p-6 border ${color} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;