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
            content: "You are an expert career advisor and learning path designer. Create detailed, practical career roadmaps with real resources and actionable steps.",
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

Please provide a detailed response in the following JSON format:
{
  "title": "...",
  "description": "...",
  "duration": "...",
  "difficulty": "Beginner|Intermediate|Advanced",
  "totalWeeks": number,
  "prerequisites": ["..."],
  "outcomes": ["..."],
  "skillsToLearn": ["..."],
  "marketDemand": "...",
  "averageSalary": "...",
  "jobTitles": ["..."],
  "weeklyPlan": [ { ... } ]
}`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON format from response");

      const careerPath: CareerPath = JSON.parse(jsonMatch[0]);
      if (!careerPath?.title || !Array.isArray(careerPath.weeklyPlan)) {
        throw new Error("Invalid structure in career path");
      }

      return careerPath;
    } catch (err) {
      console.error("Career path generation failed:", err);
      throw err;
    }
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    const prompt = `Find the best learning resources for "${skill}" at ${level} level.
Return a JSON array of up to 8 items. Format:
[
  {
    "title": "...",
    "type": "...",
    "url": "...",
    "duration": "...",
    "description": "...",
    "source": "...",
    "difficulty": "...",
    "rating": "..."
  }
]`;

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
Respond in JSON:
{
  "missingSkills": [...],
  "skillsToImprove": [...],
  "strongSkills": [...],
  "learningPriority": [
    {
      "skill": "...",
      "priority": "High|Medium|Low",
      "reason": "...",
      "timeToLearn": "..."
    }
  ],
  "recommendations": "..."
}`;

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
