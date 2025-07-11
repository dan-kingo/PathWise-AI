import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  colorScheme: 'purple' | 'blue' | 'green' | 'orange';
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  colorScheme 
}) => {
  const colorClasses = {
    purple: {
      border: 'hover:border-purple-300',
      bg: 'hover:bg-purple-50',
      iconBg: 'bg-purple-100 group-hover:bg-purple-200',
      iconColor: 'text-purple-600',
      arrowColor: 'group-hover:text-purple-600'
    },
    blue: {
      border: 'hover:border-blue-300',
      bg: 'hover:bg-blue-50',
      iconBg: 'bg-blue-100 group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      arrowColor: 'group-hover:text-blue-600'
    },
    green: {
      border: 'hover:border-green-300',
      bg: 'hover:bg-green-50',
      iconBg: 'bg-green-100 group-hover:bg-green-200',
      iconColor: 'text-green-600',
      arrowColor: 'group-hover:text-green-600'
    },
    orange: {
      border: 'hover:border-orange-300',
      bg: 'hover:bg-orange-50',
      iconBg: 'bg-orange-100 group-hover:bg-orange-200',
      iconColor: 'text-orange-600',
      arrowColor: 'group-hover:text-orange-600'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <button
      onClick={onClick}
      className={`p-6 border border-gray-200 rounded-xl ${colors.border} ${colors.bg} transition-all group text-left`}
    >
      <div className="flex items-center mb-3">
        <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center transition-colors`}>
          <div className={colors.iconColor}>
            {icon}
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 text-gray-400 ml-auto ${colors.arrowColor} transition-colors`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
};

export default ActionCard;