import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { Plus, Trash2, Save, Linkedin } from 'lucide-react';

interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  year?: string;
}

interface Post {
  content: string;
  engagement: number;
}

interface LinkedInData {
  headline?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  recommendations?: number;
  connections?: string;
  posts?: Post[];
}

interface LinkedInDataFormProps {
  data: LinkedInData;
  onChange: (data: LinkedInData) => void;
  onSubmit: () => void;
}

const LinkedInDataForm: React.FC<LinkedInDataFormProps> = ({ data, onChange, onSubmit }) => {
  const [skillInput, setSkillInput] = useState('');

  const updateData = (field: keyof LinkedInData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addExperience = () => {
    const newExperience: Experience = {
      title: '',
      company: '',
      duration: '',
      description: ''
    };
    updateData('experience', [...(data.experience || []), newExperience]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...(data.experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateData('experience', updated);
  };

  const removeExperience = (index: number) => {
    const updated = [...(data.experience || [])];
    updated.splice(index, 1);
    updateData('experience', updated);
  };

  const addEducation = () => {
    const newEducation: Education = {
      school: '',
      degree: '',
      field: '',
      year: ''
    };
    updateData('education', [...(data.education || []), newEducation]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...(data.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateData('education', updated);
  };

  const removeEducation = (index: number) => {
    const updated = [...(data.education || [])];
    updated.splice(index, 1);
    updateData('education', updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !(data.skills || []).includes(skillInput.trim())) {
      updateData('skills', [...(data.skills || []), skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateData('skills', (data.skills || []).filter(s => s !== skill));
  };

  const addPost = () => {
    const newPost: Post = {
      content: '',
      engagement: 0
    };
    updateData('posts', [...(data.posts || []), newPost]);
  };

  const updatePost = (index: number, field: keyof Post, value: string | number) => {
    const updated = [...(data.posts || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateData('posts', updated);
  };

  const removePost = (index: number) => {
    const updated = [...(data.posts || [])];
    updated.splice(index, 1);
    updateData('posts', updated);
  };

  const isFormValid = () => {
    return data.headline && 
           data.summary && 
           data.experience && 
           data.experience.length > 0 &&
           data.skills && 
           data.skills.length > 0;
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Linkedin className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Required Information</h4>
            <p className="text-blue-800 text-sm">
              Please provide the following information from your LinkedIn profile. Fields marked with * are required for analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <Input
          label="Professional Headline *"
          value={data.headline || ''}
          onChange={(e) => updateData('headline', e.target.value)}
          placeholder="e.g., Senior Software Engineer at Google | Full-Stack Developer"
        />

        <Textarea
          label="Professional Summary *"
          value={data.summary || ''}
          onChange={(e) => updateData('summary', e.target.value)}
          placeholder="Your LinkedIn About section content..."
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Number of Recommendations"
            type="number"
            value={data.recommendations || ''}
            onChange={(e) => updateData('recommendations', parseInt(e.target.value) || 0)}
            placeholder="0"
          />

          <Select
            label="Connection Count"
            value={data.connections || ''}
            onChange={(e) => updateData('connections', e.target.value)}
            options={[
              { value: '', label: 'Select connection count' },
              { value: '0-50', label: '0-50 connections' },
              { value: '50-100', label: '50-100 connections' },
              { value: '100-500', label: '100-500 connections' },
              { value: '500+', label: '500+ connections' }
            ]}
          />
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Work Experience *</h3>
          <Button onClick={addExperience} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Experience
          </Button>
        </div>

        {(data.experience || []).map((exp, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
              <Button
                onClick={() => removeExperience(index)}
                size="sm"
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                value={exp.title}
                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />

              <Input
                label="Company"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="e.g., Google"
              />
            </div>

            <Input
              label="Duration"
              value={exp.duration}
              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
              placeholder="e.g., Jan 2020 - Present (3 years)"
            />

            <Textarea
              label="Description (Optional)"
              value={exp.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Brief description of your role and achievements..."
              rows={3}
            />
          </div>
        ))}

        {(data.experience || []).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No work experience added yet</p>
            <Button onClick={addExperience} icon={<Plus className="w-4 h-4" />}>
              Add Your First Experience
            </Button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <Button onClick={addEducation} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Education
          </Button>
        </div>

        {(data.education || []).map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
              <Button
                onClick={() => removeEducation(index)}
                size="sm"
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="School/University"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="e.g., Stanford University"
              />

              <Input
                label="Degree"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="e.g., Bachelor's Degree"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Field of Study"
                value={edu.field}
                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                placeholder="e.g., Computer Science"
              />

              <Input
                label="Year (Optional)"
                value={edu.year || ''}
                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Skills *</h3>
        
        <div className="flex gap-3">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill from your LinkedIn profile"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button onClick={addSkill} icon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(data.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {(data.skills || []).length === 0 && (
          <p className="text-gray-500 text-sm">No skills added yet. Add at least one skill to continue.</p>
        )}
      </div>

      {/* Recent Posts (Optional) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Posts (Optional)</h3>
            <p className="text-sm text-gray-600">Add your recent LinkedIn posts to analyze your content engagement</p>
          </div>
          <Button onClick={addPost} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Post
          </Button>
        </div>

        {(data.posts || []).map((post, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Post {index + 1}</h4>
              <Button
                onClick={() => removePost(index)}
                size="sm"
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>

            <Textarea
              label="Post Content"
              value={post.content}
              onChange={(e) => updatePost(index, 'content', e.target.value)}
              placeholder="Copy and paste your LinkedIn post content here..."
              rows={3}
            />

            <Input
              label="Engagement (Likes + Comments + Shares)"
              type="number"
              value={post.engagement}
              onChange={(e) => updatePost(index, 'engagement', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Button
          onClick={onSubmit}
          disabled={!isFormValid()}
          className="flex-1 py-4 text-lg"
          icon={<Save className="w-5 h-5" />}
        >
          Analyze LinkedIn Profile
        </Button>
      </div>

      {!isFormValid() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Please fill in all required fields (marked with *) to continue with the analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default LinkedInDataForm;