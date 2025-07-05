import dotenv from 'dotenv';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

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
  private client: ReturnType<typeof ModelClient>;
  private modelName: string = "xai/grok-3";

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = "https://models.github.ai/inference";

    if (!token) throw new Error("Missing GITHUB_TOKEN in environment");

    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  private async makeGrokRequest(prompt: string): Promise<string> {
    const response = await this.client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor and learning path designer. Create detailed, practical career roadmaps with real resources and actionable steps. Always provide comprehensive weekly plans with specific skills, detailed resources with real URLs, clear milestones, and practical projects.",
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.7,
        top_p: 1,
        model: this.modelName,
      }
    });

    if (isUnexpected(response)) {
      console.error("Grok model API error:", response.body.error);
      throw new Error("Model response failed");
    }

    return response.body.choices[0]?.message?.content || '';
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    const prompt = `Create a comprehensive career learning path for someone who wants to become a ${request.targetRole}.

Current context:
- Target Role: ${request.targetRole}
- Current Skills: ${request.currentSkills.join(', ')}
- Experience Level: ${request.experienceLevel}
- Desired Timeframe: ${request.timeframe}
- Interests: ${request.interests.join(', ')}

Please provide a detailed response in the following JSON format with COMPLETE weekly plans:

{
  "title": "Career path title",
  "description": "Detailed description of the career path",
  "duration": "${request.timeframe}",
  "difficulty": "Beginner|Intermediate|Advanced",
  "totalWeeks": number_of_weeks,
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "outcomes": ["outcome1", "outcome2", "outcome3"],
  "skillsToLearn": ["skill1", "skill2", "skill3"],
  "marketDemand": "High demand with X% growth expected",
  "averageSalary": "$XX,000 - $XX,000",
  "jobTitles": ["title1", "title2", "title3"],
  "weeklyPlan": [
    {
      "week": 1,
      "title": "Week title",
      "description": "What will be learned this week",
      "skills": ["skill1", "skill2"],
      "resources": [
        {
          "title": "Resource title",
          "type": "video|article|course|practice|project",
          "url": "https://real-url.com",
          "duration": "X hours",
          "description": "What this resource covers",
          "source": "Platform name"
        }
      ],
      "milestones": ["milestone1", "milestone2"],
      "projects": ["project1", "project2"]
    }
  ]
}

IMPORTANT: 
- Provide REAL URLs for resources (YouTube, Coursera, freeCodeCamp, MDN, etc.)
- Include 3-5 resources per week
- Make sure each week has specific skills, milestones, and projects
- Ensure the weekly plan covers the full timeframe requested`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON format from response");

      const careerPath: CareerPath = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure all required fields are present
      if (!careerPath?.title || !Array.isArray(careerPath.weeklyPlan)) {
        throw new Error("Invalid structure in career path");
      }

      // Ensure each week has all required fields
      careerPath.weeklyPlan = careerPath.weeklyPlan.map(week => ({
        ...week,
        skills: week.skills || [],
        resources: week.resources || [],
        milestones: week.milestones || [],
        projects: week.projects || []
      }));

      return careerPath;
    } catch (err) {
      console.error("Career path generation failed:", err);
      throw err;
    }
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    const prompt = `Find the best learning resources for "${skill}" at ${level} level.
Return a JSON array of up to 8 items with REAL URLs. Format:
[
  {
    "title": "Resource title",
    "type": "video|article|course|practice",
    "url": "https://real-url.com",
    "duration": "X hours/minutes",
    "description": "What this resource covers",
    "source": "Platform name",
    "difficulty": "Beginner|Intermediate|Advanced",
    "rating": "X.X/5"
  }
]

Provide REAL URLs from platforms like:
- YouTube (specific video URLs)
- Coursera, Udemy, edX courses
- freeCodeCamp
- MDN Web Docs
- Official documentation
- GitHub repositories
- Interactive coding platforms`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (err) {
      console.error("Resource recommendation failed:", err);
      return [];
    }
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    const prompt = `Analyze the skill gap for someone with skills: ${currentSkills.join(', ')} who wants to become a ${targetRole}.

Provide a comprehensive analysis in JSON format:
{
  "missingSkills": ["skill1", "skill2", "skill3"],
  "skillsToImprove": ["skill1", "skill2"],
  "strongSkills": ["skill1", "skill2"],
  "learningPriority": [
    {
      "skill": "Skill name",
      "priority": "High|Medium|Low",
      "reason": "Why this skill is important",
      "timeToLearn": "X weeks/months"
    }
  ],
  "recommendations": "Detailed paragraph with specific advice on learning path and strategy"
}

Focus on:
- Technical skills specific to ${targetRole}
- Soft skills needed for the role
- Industry-specific knowledge
- Tools and technologies
- Certifications that might be valuable`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (err) {
      console.error("Skill gap analysis failed:", err);
      throw err;
    }
  }
}

export default new GrokService();