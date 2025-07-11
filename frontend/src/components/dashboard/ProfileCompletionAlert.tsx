import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

interface ProfileCompletionAlertProps {
  onCompleteProfile: () => void;
}

const ProfileCompletionAlert: React.FC<ProfileCompletionAlertProps> = ({ onCompleteProfile }) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">Complete Your Profile</h3>
            <p className="text-orange-700 mt-1">
              Complete your profile to unlock personalized career recommendations and AI-powered insights.
            </p>
          </div>
        </div>
        <Button onClick={onCompleteProfile} className="flex-shrink-0">
          Complete Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionAlert;