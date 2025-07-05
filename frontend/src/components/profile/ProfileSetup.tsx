import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../../schemas/profileSchema';
import { useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { User, MapPin, Briefcase, GraduationCap, Target, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  
  const { user } = useAuthStore();
  const { setProfile, updateProfile } = useProfileStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      phone: '',
      location: '',
      education: {
        degree: '',
        institution: '',
        graduationYear: undefined,
        fieldOfStudy: '',
      },
      careerGoals: {
        targetRole: '',
        industry: '',
        timeframe: '',
        description: '',
      },
      skills: [],
      interests: [],
      experience: {
        level: 'entry',
        years: undefined,
        currentRole: '',
        currentCompany: '',
      },
    },
  });

  const watchedSkills = watch('skills') || [];
  const watchedInterests = watch('interests') || [];

  const addSkill = () => {
    if (skillInput.trim() && !watchedSkills.includes(skillInput.trim())) {
      setValue('skills', [...watchedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', watchedSkills.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (interestInput.trim() && !watchedInterests.includes(interestInput.trim())) {
      setValue('interests', [...watchedInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setValue('interests', watchedInterests.filter(i => i !== interest));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Here you would typically save to backend
      setProfile(data);
      toast.success('Profile setup completed successfully!');
      onComplete();
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Education', icon: GraduationCap },
    { number: 3, title: 'Career Goals', icon: Target },
    { number: 4, title: 'Skills & Experience', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your learning journey</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card max-w-2xl mx-auto">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Full Name"
                        error={errors.name?.message}
                        icon={<User className="w-5 h-5 text-gray-400" />}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        label="Email"
                        disabled
                        className="bg-gray-50"
                      />
                    )}
                  />
                </div>

                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Bio"
                      placeholder="Tell us about yourself, your interests, and what motivates you..."
                      rows={4}
                      error={errors.bio?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        error={errors.phone?.message}
                      />
                    )}
                  />

                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Location"
                        placeholder="City, Country"
                        error={errors.location?.message}
                        icon={<MapPin className="w-5 h-5 text-gray-400" />}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Educational Background</h2>
                  <p className="text-gray-600">Share your educational journey</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="education.degree"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Degree"
                        placeholder="Bachelor's, Master's, PhD, etc."
                      />
                    )}
                  />

                  <Controller
                    name="education.fieldOfStudy"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Field of Study"
                        placeholder="Computer Science, Business, etc."
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="education.institution"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Institution"
                        placeholder="University or School name"
                      />
                    )}
                  />

                  <Controller
                    name="education.graduationYear"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Graduation Year"
                        placeholder="2023"
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Career Goals */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Career Goals</h2>
                  <p className="text-gray-600">What do you want to achieve?</p>
                </div>

                <Controller
                  name="careerGoals.targetRole"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Target Role"
                      placeholder="UI Designer, Frontend Developer, Data Scientist, etc."
                      error={errors.careerGoals?.targetRole?.message}
                      icon={<Briefcase className="w-5 h-5 text-gray-400" />}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="careerGoals.industry"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Preferred Industry"
                        placeholder="Tech, Healthcare, Finance, etc."
                      />
                    )}
                  />

                  <Controller
                    name="careerGoals.timeframe"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Timeframe"
                        options={[
                          { value: '', label: 'Select timeframe' },
                          { value: '3-months', label: '3 months' },
                          { value: '6-months', label: '6 months' },
                          { value: '1-year', label: '1 year' },
                          { value: '2-years', label: '2+ years' },
                        ]}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="careerGoals.description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Career Description"
                      placeholder="Describe your career aspirations and what success looks like to you..."
                      rows={4}
                    />
                  )}
                />
              </div>
            )}

            {/* Step 4: Skills & Experience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Star className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Skills & Experience</h2>
                  <p className="text-gray-600">Tell us about your expertise</p>
                </div>

                <Controller
                  name="experience.level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Experience Level"
                      error={errors.experience?.level?.message}
                      options={[
                        { value: 'entry', label: 'Entry Level (0-1 years)' },
                        { value: 'junior', label: 'Junior (1-3 years)' },
                        { value: 'mid', label: 'Mid Level (3-5 years)' },
                        { value: 'senior', label: 'Senior (5-8 years)' },
                        { value: 'expert', label: 'Expert (8+ years)' },
                      ]}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="experience.currentRole"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Current Role"
                        placeholder="Software Engineer, Student, etc."
                      />
                    )}
                  />

                  <Controller
                    name="experience.currentCompany"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Current Company"
                        placeholder="Company name or 'Student'"
                      />
                    )}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills {errors.skills && <span className="text-red-600">*</span>}
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g., JavaScript, Design, etc.)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  {errors.skills && (
                    <p className="text-sm text-red-600 mb-2">{errors.skills.message}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {watchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Add an interest (e.g., AI, Startups, etc.)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <Button type="button" onClick={addInterest} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" loading={isSubmitting}>
                  Complete Profile
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;