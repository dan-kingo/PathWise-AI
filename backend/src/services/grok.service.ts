import dotenv from 'dotenv';

dotenv.config();

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
  private async makeGrokRequest(prompt: string): Promise<string> {
    // For now, return mock data since we don't have a working AI service
    // This ensures the app works without external dependencies
    return JSON.stringify({
      title: "AI-Generated Career Path",
      description: "A comprehensive learning path tailored to your goals",
      duration: "8 weeks",
      difficulty: "Intermediate",
      totalWeeks: 8,
      prerequisites: ["Basic computer skills", "Willingness to learn"],
      outcomes: ["Master core skills", "Build portfolio projects", "Job-ready expertise"],
      skillsToLearn: ["Core Technologies", "Best Practices", "Industry Tools"],
      marketDemand: "High demand with 20% growth expected",
      averageSalary: "$70,000 - $120,000",
      jobTitles: ["Software Developer", "Frontend Developer", "Full Stack Developer"],
      weeklyPlan: [
        {
          week: 1,
          title: "Fundamentals",
          description: "Learn the core concepts and foundations",
          skills: ["Basic Concepts", "Setup", "Environment"],
          resources: [
            {
              title: "Getting Started Guide",
              type: "course",
              url: "https://developer.mozilla.org/en-US/docs/Learn",
              duration: "4 hours",
              description: "Comprehensive introduction to web development",
              source: "MDN Web Docs"
            },
            {
              title: "Interactive Tutorial",
              type: "practice",
              url: "https://www.freecodecamp.org/",
              duration: "6 hours",
              description: "Hands-on coding exercises",
              source: "freeCodeCamp"
            }
          ],
          milestones: ["Complete setup", "Understand basics", "First project"],
          projects: ["Hello World Application"]
        },
        {
          week: 2,
          title: "Building Skills",
          description: "Develop intermediate capabilities",
          skills: ["Advanced Concepts", "Tools", "Frameworks"],
          resources: [
            {
              title: "Advanced Techniques",
              type: "video",
              url: "https://www.youtube.com/results?search_query=web+development+tutorial",
              duration: "5 hours",
              description: "Deep dive into advanced topics",
              source: "YouTube"
            }
          ],
          milestones: ["Master intermediate concepts", "Build complex features"],
          projects: ["Interactive Web Application"]
        }
      ]
    });
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    const prompt = `Create a comprehensive career learning path for someone who wants to become a ${request.targetRole}.

Current context:
- Target Role: ${request.targetRole}
- Current Skills: ${request.currentSkills.join(', ')}
- Experience Level: ${request.experienceLevel}
- Desired Timeframe: ${request.timeframe}
- Interests: ${request.interests.join(', ')}

Please provide a detailed response in JSON format with COMPLETE weekly plans.`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const careerPath: CareerPath = JSON.parse(response);
      
      // Customize based on user input
      careerPath.title = `${request.targetRole} Career Path`;
      careerPath.duration = request.timeframe;
      
      // Ensure all required fields are present
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
      
      // Return a fallback career path
      return {
        title: `${request.targetRole} Learning Path`,
        description: `A structured learning path to become a ${request.targetRole}`,
        duration: request.timeframe,
        difficulty: 'Intermediate',
        totalWeeks: 8,
        prerequisites: ["Basic computer skills", "Motivation to learn"],
        outcomes: ["Job-ready skills", "Portfolio projects", "Industry knowledge"],
        skillsToLearn: ["Core Technologies", "Best Practices", "Problem Solving"],
        marketDemand: "High demand in the current market",
        averageSalary: "$60,000 - $100,000",
        jobTitles: [request.targetRole, "Junior Developer", "Software Engineer"],
        weeklyPlan: [
          {
            week: 1,
            title: "Getting Started",
            description: "Introduction to the field and basic concepts",
            skills: ["Fundamentals", "Setup", "Basic Tools"],
            resources: [
              {
                title: "Introduction Course",
                type: "course",
                url: "https://www.freecodecamp.org/",
                duration: "4 hours",
                description: "Comprehensive introduction course",
                source: "freeCodeCamp"
              }
            ],
            milestones: ["Complete setup", "Understand basics"],
            projects: ["First project"]
          }
        ]
      };
    }
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    try {
      // Return mock resources for now
      return [
        {
          title: `${skill} Fundamentals`,
          type: "course",
          url: "https://www.freecodecamp.org/",
          duration: "4 hours",
          description: `Learn ${skill} from the ground up`,
          source: "freeCodeCamp",
          difficulty: level,
          rating: "4.8/5"
        },
        {
          title: `${skill} Tutorial`,
          type: "video",
          url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(skill),
          duration: "2 hours",
          description: `Video tutorial series for ${skill}`,
          source: "YouTube",
          difficulty: level,
          rating: "4.6/5"
        },
        {
          title: `${skill} Documentation`,
          type: "article",
          url: "https://developer.mozilla.org/en-US/docs/Learn",
          duration: "1 hour",
          description: `Official documentation and guides for ${skill}`,
          source: "MDN Web Docs",
          difficulty: level,
          rating: "4.9/5"
        }
      ];
    } catch (err) {
      console.error("Resource recommendation failed:", err);
      return [];
    }
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    try {
      // Return mock analysis for now
      return {
        missingSkills: ["Advanced Concepts", "Industry Tools", "Best Practices"],
        skillsToImprove: ["Problem Solving", "Code Quality"],
        strongSkills: currentSkills.slice(0, 3),
        learningPriority: [
          {
            skill: "Core Technology",
            priority: "High",
            reason: `Essential for ${targetRole} role`,
            timeToLearn: "4-6 weeks"
          },
          {
            skill: "Best Practices",
            priority: "Medium",
            reason: "Important for professional development",
            timeToLearn: "2-3 weeks"
          }
        ],
        recommendations: `Based on your current skills and target role of ${targetRole}, focus on building strong fundamentals first, then advance to specialized tools and frameworks. Your existing skills provide a good foundation to build upon.`
      };
    } catch (err) {
      console.error("Skill gap analysis failed:", err);
      throw err;
    }
  }
}

export default new GrokService();