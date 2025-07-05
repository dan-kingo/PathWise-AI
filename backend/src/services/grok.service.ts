import dotenv from 'dotenv';

dotenv.config();

interface GrokResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface CareerPathRequest {
  targetRole: string;
  currentSkills: string[];
  experienceLevel: string;
  timeframe: string;
  interests: string[];
}

interface WeeklyPlan {
  week: number;
  title: string;
  description: string;
  skills: string[];
  resources: {
    title: string;
    type: 'video' | 'article' | 'course' | 'practice' | 'project';
    url: string;
    duration: string;
    description: string;
    source: string;
  }[];
  milestones: string[];
  projects: string[];
}

interface CareerPath {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalWeeks: number;
  prerequisites: string[];
  outcomes: string[];
  skillsToLearn: string[];
  weeklyPlan: WeeklyPlan[];
  marketDemand: string;
  averageSalary: string;
  jobTitles: string[];
}

class GrokService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || '';
    this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1';
  }

  private async makeGrokRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career advisor and learning path designer. Create detailed, practical career roadmaps with real resources and actionable steps.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.statusText}`);
      }

      const data: GrokResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Grok API request failed:', error);
      throw new Error('Failed to generate career path with AI');
    }
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    const prompt = `
Create a comprehensive career learning path for someone who wants to become a ${request.targetRole}.

Current context:
- Target Role: ${request.targetRole}
- Current Skills: ${request.currentSkills.join(', ')}
- Experience Level: ${request.experienceLevel}
- Desired Timeframe: ${request.timeframe}
- Interests: ${request.interests.join(', ')}

Please provide a detailed response in the following JSON format:
{
  "title": "Career path title",
  "description": "Brief description of the career path",
  "duration": "Total duration (e.g., '8 weeks', '3 months')",
  "difficulty": "Beginner|Intermediate|Advanced",
  "totalWeeks": number,
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "outcomes": ["outcome1", "outcome2"],
  "skillsToLearn": ["skill1", "skill2"],
  "marketDemand": "High|Medium|Low with brief explanation",
  "averageSalary": "Salary range",
  "jobTitles": ["related job title 1", "related job title 2"],
  "weeklyPlan": [
    {
      "week": 1,
      "title": "Week title",
      "description": "What will be covered this week",
      "skills": ["skill1", "skill2"],
      "resources": [
        {
          "title": "Resource title",
          "type": "video|article|course|practice|project",
          "url": "https://example.com or 'Search: keyword'",
          "duration": "estimated time",
          "description": "What this resource covers",
          "source": "YouTube|Coursera|FreeCodeCamp|MDN|etc"
        }
      ],
      "milestones": ["milestone1", "milestone2"],
      "projects": ["project1", "project2"]
    }
  ]
}

Focus on:
1. Real, accessible resources (YouTube tutorials, free courses, documentation)
2. Practical projects and hands-on learning
3. Progressive skill building
4. Industry-relevant tools and technologies
5. Portfolio-building opportunities

Make sure the path is realistic for the given timeframe and experience level.
`;

    try {
      const response = await this.makeGrokRequest(prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const careerPath: CareerPath = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!careerPath.title || !careerPath.weeklyPlan || !Array.isArray(careerPath.weeklyPlan)) {
        throw new Error('Invalid career path structure');
      }

      return careerPath;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to generate valid career path');
    }
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    const prompt = `
Find the best learning resources for "${skill}" at ${level} level.

Provide a JSON array of resources in this format:
[
  {
    "title": "Resource title",
    "type": "video|article|course|practice|documentation",
    "url": "actual URL or 'Search: specific search term'",
    "duration": "estimated time",
    "description": "What this resource covers",
    "source": "Platform name",
    "difficulty": "Beginner|Intermediate|Advanced",
    "rating": "estimated rating out of 5"
  }
]

Focus on free, high-quality resources from platforms like:
- YouTube (specific channels and videos)
- FreeCodeCamp
- MDN Web Docs
- Coursera (free courses)
- edX
- Khan Academy
- Official documentation
- GitHub repositories with tutorials

Limit to 5-8 best resources.
`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        return [];
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to generate resource recommendations:', error);
      return [];
    }
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    const prompt = `
Analyze the skill gap for someone with skills: ${currentSkills.join(', ')} 
who wants to become a ${targetRole}.

Provide analysis in JSON format:
{
  "missingSkills": ["skill1", "skill2"],
  "skillsToImprove": ["skill1", "skill2"],
  "strongSkills": ["skill1", "skill2"],
  "learningPriority": [
    {
      "skill": "skill name",
      "priority": "High|Medium|Low",
      "reason": "why this skill is important",
      "timeToLearn": "estimated time"
    }
  ],
  "recommendations": "Overall recommendations"
}
`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to analyze skill gap:', error);
      throw new Error('Failed to analyze skills');
    }
  }
}

export default new GrokService();