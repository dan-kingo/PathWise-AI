import React from 'react';
import Button from '../ui/Button';

interface SkillsOverviewProps {
  skills: string[];
  onManageSkills: () => void;
}

const SkillsOverview: React.FC<SkillsOverviewProps> = ({ skills, onManageSkills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Skills</h2>
        <Button variant="outline" size="sm" onClick={onManageSkills}>
          Manage Skills
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 12).map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {skill}
          </span>
        ))}
        {skills.length > 12 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            +{skills.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
};

export default SkillsOverview;