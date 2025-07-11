import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface WelcomeHeaderProps {
  userName: string;
  onGenerateCareerPath: () => void;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, onGenerateCareerPath }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Ready to take the next step in your career journey?
          </p>
        </div>
        <div className="mt-6 lg:mt-0">
          <Button 
            variant="secondary" 
            onClick={onGenerateCareerPath}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Career Path
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;