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
  pace?: 'slow' | 'normal' | 'fast'; // New pace field
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
    difficulty?: string;
    rating?: string;
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
            content: "You are an expert career advisor and learning path designer. Create detailed, practical career roadmaps with real resources and actionable steps. Always provide comprehensive weekly plans with specific skills, detailed resources with real URLs, clear milestones, and practical projects. Generate unique content based on the user's specific role, skills, interests, and experience level.",
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.8, // Increased for more creativity
        top_p: 0.9,
        model: this.modelName,
      }
    });

    if (isUnexpected(response)) {
      console.error("Grok model API error:", response.body.error);
      throw new Error("Model response failed");
    }

    return response.body.choices[0]?.message?.content || '';
  }

  private async fetchYouTubeResources(skill: string, level: string): Promise<any[]> {
    // Mock YouTube API integration - replace with actual YouTube Data API
    const searchQuery = `${skill} ${level} tutorial`;
    return [
      {
        title: `${skill} Complete Tutorial for ${level}s`,
        type: "video",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        duration: "2-4 hours",
        description: `Comprehensive ${skill} tutorial series`,
        source: "YouTube",
        difficulty: level,
        rating: "4.7/5"
      }
    ];
  }

  private async fetchUdemyResources(skill: string): Promise<any[]> {
    // Mock Udemy API integration - replace with actual Udemy API
    return [
      {
        title: `Master ${skill} - Complete Course`,
        type: "course",
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
        duration: "10-20 hours",
        description: `Professional ${skill} course with hands-on projects`,
        source: "Udemy",
        difficulty: "All Levels",
        rating: "4.6/5"
      }
    ];
  }

  private async fetchCourseraResources(skill: string): Promise<any[]> {
    // Mock Coursera API integration - replace with actual Coursera API
    return [
      {
        title: `${skill} Specialization`,
        type: "course",
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        duration: "4-6 weeks",
        description: `University-level ${skill} specialization`,
        source: "Coursera",
        difficulty: "Intermediate",
        rating: "4.8/5"
      }
    ];
  }

  private async fetchMDNResources(skill: string): Promise<any[]> {
    // MDN Web Docs integration for web technologies
    const webSkills = ['javascript', 'html', 'css', 'web', 'api', 'dom'];
    if (!webSkills.some(webSkill => skill.toLowerCase().includes(webSkill))) {
      return [];
    }

    return [
      {
        title: `${skill} - MDN Web Docs`,
        type: "article",
        url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skill)}`,
        duration: "1-2 hours",
        description: `Official documentation and guides for ${skill}`,
        source: "MDN Web Docs",
        difficulty: "All Levels",
        rating: "4.9/5"
      }
    ];
  }

  private async fetchCommunityResources(skill: string): Promise<any[]> {
    // Mock community-sourced content from DEV.to/Reddit
    return [
      {
        title: `${skill} Community Guide`,
        type: "article",
        url: `https://dev.to/search?q=${encodeURIComponent(skill)}`,
        duration: "30-60 minutes",
        description: `Community-driven ${skill} tutorials and insights`,
        source: "DEV.to",
        difficulty: "Varies",
        rating: "4.4/5"
      },
      {
        title: `r/${skill.replace(/\s+/g, '')} - Reddit Community`,
        type: "practice",
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(skill)}`,
        duration: "Ongoing",
        description: `Join the ${skill} community for discussions and help`,
        source: "Reddit",
        difficulty: "Community",
        rating: "4.2/5"
      }
    ];
  }

  private generateRoleSpecificProjects(targetRole: string, week: number, skills: string[]): string[] {
    const roleLower = targetRole.toLowerCase();
    
    // Frontend Developer Projects
    if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
      const frontendProjects = [
        "Personal Portfolio Website",
        "Todo App with Local Storage",
        "Weather Dashboard with API",
        "E-commerce Product Catalog",
        "Social Media Dashboard",
        "Recipe Finder App",
        "Movie Database Browser",
        "Real-time Chat Application",
        "Expense Tracker with Charts",
        "Blog Platform with CMS",
        "Task Management Board",
        "Music Player Interface",
        "Photo Gallery with Filters",
        "Calculator with History",
        "Quiz Application with Timer"
      ];
      return [frontendProjects[week % frontendProjects.length]];
    }
    
    // Backend Developer Projects
    if (roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('server')) {
      const backendProjects = [
        "RESTful API for Blog",
        "User Authentication System",
        "File Upload Service",
        "Real-time Notification System",
        "Payment Processing API",
        "Inventory Management System",
        "Social Media API",
        "Email Service Integration",
        "Data Analytics Dashboard API",
        "Microservice Architecture",
        "GraphQL API Server",
        "WebSocket Chat Server",
        "Caching Layer Implementation",
        "Database Migration Tool",
        "API Rate Limiting Service"
      ];
      return [backendProjects[week % backendProjects.length]];
    }
    
    // Data Science Projects
    if (roleLower.includes('data') || roleLower.includes('scientist') || roleLower.includes('analytics')) {
      const dataProjects = [
        "Sales Data Analysis",
        "Customer Segmentation Model",
        "Predictive Analytics Dashboard",
        "Sentiment Analysis Tool",
        "Recommendation Engine",
        "Time Series Forecasting",
        "A/B Testing Framework",
        "Fraud Detection System",
        "Market Basket Analysis",
        "Social Media Analytics",
        "Healthcare Data Insights",
        "Financial Risk Assessment",
        "Supply Chain Optimization",
        "Image Classification Model",
        "Natural Language Processing Tool"
      ];
      return [dataProjects[week % dataProjects.length]];
    }
    
    // UX/UI Designer Projects
    if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui')) {
      const designProjects = [
        "Mobile App Redesign",
        "E-commerce User Journey",
        "Accessibility Audit & Redesign",
        "Design System Creation",
        "User Research Study",
        "Prototype Testing Session",
        "Brand Identity Design",
        "Dashboard Interface Design",
        "Responsive Web Design",
        "Voice Interface Design",
        "AR/VR Experience Design",
        "Service Design Blueprint",
        "Information Architecture",
        "Usability Testing Report",
        "Design Portfolio Website"
      ];
      return [designProjects[week % designProjects.length]];
    }
    
    // DevOps Projects
    if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('infrastructure')) {
      const devopsProjects = [
        "CI/CD Pipeline Setup",
        "Container Orchestration",
        "Infrastructure as Code",
        "Monitoring & Alerting System",
        "Auto-scaling Configuration",
        "Security Scanning Pipeline",
        "Backup & Recovery System",
        "Load Balancer Configuration",
        "Database Migration Pipeline",
        "Disaster Recovery Plan",
        "Performance Optimization",
        "Cost Optimization Analysis",
        "Multi-environment Setup",
        "Service Mesh Implementation",
        "Compliance Automation"
      ];
      return [devopsProjects[week % devopsProjects.length]];
    }
    
    // Generic projects for other roles
    const genericProjects = [
      `${targetRole} Portfolio Project`,
      `Industry-specific ${targetRole} Tool`,
      `${targetRole} Case Study`,
      `Professional ${targetRole} Application`,
      `${targetRole} Best Practices Implementation`
    ];
    
    return [genericProjects[week % genericProjects.length]];
  }

  private adjustTimeframeForPace(timeframe: string, pace: string): number {
    let baseWeeks = this.parseTimeframeToWeeks(timeframe);
    
    switch (pace) {
      case 'slow':
        return Math.ceil(baseWeeks * 1.5); // 50% more time
      case 'fast':
        return Math.ceil(baseWeeks * 0.75); // 25% less time
      case 'normal':
      default:
        return baseWeeks;
    }
  }

  private parseTimeframeToWeeks(timeframe: string): number {
    const timeframeLower = timeframe.toLowerCase();
    
    if (timeframeLower.includes('week')) {
      const match = timeframeLower.match(/(\d+)\s*week/);
      return match ? parseInt(match[1]) : 8;
    } else if (timeframeLower.includes('month')) {
      const match = timeframeLower.match(/(\d+)\s*month/);
      return match ? parseInt(match[1]) * 4 : 8;
    }
    
    return 8; // Default to 8 weeks
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    const { targetRole, currentSkills, experienceLevel, timeframe, interests, pace = 'normal' } = request;
    
    // Adjust timeframe based on pace
    const adjustedWeeks = this.adjustTimeframeForPace(timeframe, pace);
    
    const prompt = `Create a comprehensive, personalized career learning path for someone who wants to become a ${targetRole}.

IMPORTANT: Generate UNIQUE and SPECIFIC content based on the user's profile. Do NOT use generic templates.

User Profile:
- Target Role: ${targetRole}
- Current Skills: ${currentSkills.join(', ')}
- Experience Level: ${experienceLevel}
- Desired Timeframe: ${timeframe} (${adjustedWeeks} weeks)
- Learning Pace: ${pace}
- Interests: ${interests.join(', ')}

Generate a detailed response in JSON format with COMPLETE weekly plans for ALL ${adjustedWeeks} weeks:

{
  "title": "Unique title specific to ${targetRole} and user's background",
  "description": "Personalized description considering user's current skills: ${currentSkills.join(', ')} and interests: ${interests.join(', ')}",
  "duration": "${timeframe}",
  "difficulty": "Based on experience level: ${experienceLevel}",
  "totalWeeks": ${adjustedWeeks},
  "prerequisites": ["Specific to ${targetRole} and ${experienceLevel} level - NOT generic"],
  "outcomes": ["Specific outcomes for ${targetRole} considering user's interests: ${interests.join(', ')}"],
  "skillsToLearn": ["Skills needed for ${targetRole} that user doesn't have from: ${currentSkills.join(', ')}"],
  "marketDemand": "Current market demand for ${targetRole} with specific statistics",
  "averageSalary": "Realistic salary range for ${targetRole}",
  "jobTitles": ["Specific job titles related to ${targetRole}"],
  "weeklyPlan": [
    // Generate ${adjustedWeeks} unique weeks, each with:
    {
      "week": 1,
      "title": "Week-specific title for ${targetRole}",
      "description": "What will be learned this week specific to ${targetRole}",
      "skills": ["Specific skills for this week"],
      "resources": [
        {
          "title": "Specific resource title",
          "type": "video|article|course|practice|project",
          "url": "Real URL from YouTube, Coursera, freeCodeCamp, MDN, etc.",
          "duration": "Realistic duration",
          "description": "Specific description of what this resource covers",
          "source": "Platform name"
        }
        // Include 3-5 resources per week with REAL URLs
      ],
      "milestones": ["Specific, measurable milestones for this week"],
      "projects": ["Specific project for ${targetRole} - week ${1}"]
    }
    // Continue for all ${adjustedWeeks} weeks with DIFFERENT content each week
  ]
}

CRITICAL REQUIREMENTS:
1. Make prerequisites SPECIFIC to ${targetRole} and ${experienceLevel} - not generic
2. Make outcomes SPECIFIC to ${targetRole} and user's interests
3. Filter skillsToLearn to exclude skills user already has: ${currentSkills.join(', ')}
4. Generate ${adjustedWeeks} COMPLETE weeks with different content
5. Use REAL URLs from actual platforms
6. Make each week build upon previous weeks
7. Consider user's pace: ${pace} (adjust complexity accordingly)
8. Include projects specific to ${targetRole}
9. Make content relevant to user's interests: ${interests.join(', ')}`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON format from response");

      const careerPath: CareerPath = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure all required fields are present
      if (!careerPath?.title || !Array.isArray(careerPath.weeklyPlan)) {
        throw new Error("Invalid structure in career path");
      }

      // Enhance resources with additional platform integrations
      for (let week of careerPath.weeklyPlan) {
        // Add community resources and platform-specific content
        const additionalResources = await this.getEnhancedResources(week.skills, targetRole);
        week.resources = [...(week.resources || []), ...additionalResources];
        
        // Generate role-specific projects using AI/rules engine
        if (!week.projects || week.projects.length === 0) {
          week.projects = this.generateRoleSpecificProjects(targetRole, week.week, week.skills);
        }
        
        // Ensure all required fields
        week.skills = week.skills || [];
        week.resources = week.resources || [];
        week.milestones = week.milestones || [];
        week.projects = week.projects || [];
      }

      return careerPath;
    } catch (err) {
      console.error("Career path generation failed:", err);
      throw err;
    }
  }

  private async getEnhancedResources(skills: string[], targetRole: string): Promise<any[]> {
    const enhancedResources: any[] = [];
    
    for (const skill of skills.slice(0, 2)) { // Limit to avoid too many resources
      try {
        // Fetch from multiple platforms
        const [youtube, udemy, coursera, mdn, community] = await Promise.all([
          this.fetchYouTubeResources(skill, 'beginner'),
          this.fetchUdemyResources(skill),
          this.fetchCourseraResources(skill),
          this.fetchMDNResources(skill),
          this.fetchCommunityResources(skill)
        ]);
        
        // Add one resource from each platform (if available)
        if (youtube.length > 0) enhancedResources.push(youtube[0]);
        if (udemy.length > 0) enhancedResources.push(udemy[0]);
        if (mdn.length > 0) enhancedResources.push(mdn[0]);
        if (community.length > 0) enhancedResources.push(community[0]);
      } catch (error) {
        console.error(`Failed to fetch resources for ${skill}:`, error);
      }
    }
    
    return enhancedResources.slice(0, 3); // Limit to 3 additional resources per week
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    try {
      // Get resources from multiple platforms
      const [youtube, udemy, coursera, mdn, community] = await Promise.all([
        this.fetchYouTubeResources(skill, level),
        this.fetchUdemyResources(skill),
        this.fetchCourseraResources(skill),
        this.fetchMDNResources(skill),
        this.fetchCommunityResources(skill)
      ]);
      
      // Combine and return diverse resources
      const allResources = [...youtube, ...udemy, ...coursera, ...mdn, ...community];
      return allResources.slice(0, 8); // Return top 8 resources
    } catch (err) {
      console.error("Resource recommendation failed:", err);
      return [];
    }
  }

  // Skill gap analysis removed as requested
  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    throw new Error("Skill gap analysis is not implemented yet. This feature will be available soon.");
  }
}

export default new GrokService();