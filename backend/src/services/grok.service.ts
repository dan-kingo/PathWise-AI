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
  pace?: 'slow' | 'normal' | 'fast';
}

interface ProfileAnalysisRequest {
  profileUrl: string;
  profileType: 'linkedin' | 'github';
  additionalContext?: string;
  linkedinData?: {
    headline?: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field: string;
      year?: string;
    }>;
    skills?: string[];
    recommendations?: number;
    connections?: string;
    posts?: Array<{
      content: string;
      engagement: number;
    }>;
  };
}

interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  company: string;
  location: string;
  email: string;
  blog: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  has_readme: boolean;
  has_wiki: boolean;
  has_issues: boolean;
  open_issues_count: number;
}

interface GitHubLanguageStats {
  [language: string]: number;
}

interface GitHubCommitActivity {
  total: number;
  week: number;
  days: number[];
}

interface WeeklyPlan {
  week: number;
  title: string;
  description: string;
  focus?: string;
  goals?: string[];
  tasks?: string[];
  skills?: string[];
  resources?: {
    title: string;
    type: 'video' | 'article' | 'course' | 'practice' | 'project';
    url: string;
    duration: string;
    description: string;
    source: string;
    difficulty?: string;
    rating?: string;
  }[];
  milestones?: string[];
  projects?: string[];
  project?: string;
  hours?: number;
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

interface ProfileAnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
  }[];
  industryBenchmarks: {
    metric: string;
    userScore: number;
    industryAverage: number;
    recommendation: string;
  }[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
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
            content: "You are an expert career advisor and profile optimization specialist. You analyze professional profiles (LinkedIn/GitHub) and provide actionable insights to improve visibility, professionalism, and career prospects. Always provide specific, measurable recommendations with clear impact explanations. IMPORTANT: Always return valid JSON format without any markdown formatting or extra text.",
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.7,
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

  private cleanJsonResponse(response: string): string {
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const startIndex = cleaned.indexOf('{');
    const lastIndex = cleaned.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error("No valid JSON object found in response");
    }
    
    cleaned = cleaned.substring(startIndex, lastIndex + 1);
    
    cleaned = cleaned
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  }

  private async fetchGitHubProfile(username: string): Promise<GitHubProfile> {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Job-Ready-AI-Coach'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Job-Ready-AI-Coach'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchGitHubLanguages(username: string, repoName: string): Promise<GitHubLanguageStats> {
    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/languages`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Job-Ready-AI-Coach'
        }
      });

      if (!response.ok) {
        return {};
      }

      return response.json();
    } catch (error) {
      return {};
    }
  }

  private async fetchGitHubCommitActivity(username: string, repoName: string): Promise<GitHubCommitActivity[]> {
    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/stats/commit_activity`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Job-Ready-AI-Coach'
        }
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch (error) {
      return [];
    }
  }

  private extractGitHubUsername(profileUrl: string): string {
    try {
      const url = new URL(profileUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length === 0) {
        throw new Error('Invalid GitHub profile URL');
      }
      
      return pathParts[0];
    } catch (error) {
      throw new Error('Invalid GitHub profile URL format');
    }
  }

  private async analyzeGitHubProfile(profileUrl: string, additionalContext?: string): Promise<ProfileAnalysisResult> {
    const username = this.extractGitHubUsername(profileUrl);
    
    try {
      const [profile, repos] = await Promise.all([
        this.fetchGitHubProfile(username),
        this.fetchGitHubRepos(username)
      ]);

      const languageStats: { [key: string]: number } = {};
      const repoAnalysis = [];

      for (const repo of repos.slice(0, 20)) {
        const languages = await this.fetchGitHubLanguages(username, repo.name);
        
        Object.entries(languages).forEach(([lang, bytes]) => {
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
        });

        repoAnalysis.push({
          name: repo.name,
          description: repo.description || 'No description',
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastUpdated: repo.updated_at,
          topics: repo.topics || [],
          hasReadme: repo.has_readme,
          hasIssues: repo.has_issues,
          openIssues: repo.open_issues_count
        });
      }

      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      const recentActivity = repos.filter(repo => {
        const lastUpdate = new Date(repo.updated_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastUpdate > sixMonthsAgo;
      }).length;

      const topLanguages = Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang);

      const profileData = {
        username: profile.login,
        name: profile.name || 'Not provided',
        bio: profile.bio || 'No bio',
        company: profile.company || 'Not specified',
        location: profile.location || 'Not specified',
        email: profile.email || 'Not public',
        blog: profile.blog || 'None',
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        accountAge: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)),
        totalStars,
        totalForks,
        recentActivity,
        topLanguages,
        repoAnalysis: repoAnalysis.slice(0, 10),
        hasReadmeInRepos: repos.filter(r => r.has_readme).length,
        averageRepoSize: repos.length > 0 ? Math.round(repos.reduce((sum, r) => sum + r.size, 0) / repos.length) : 0
      };

      const prompt = `Analyze this GitHub profile and provide comprehensive improvement recommendations.

GitHub Profile Data:
${JSON.stringify(profileData, null, 2)}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Based on this REAL GitHub data, provide a detailed analysis in VALID JSON format with the following structure:

{
  "overallScore": 75,
  "strengths": ["Specific strengths based on actual data"],
  "weaknesses": ["Specific weaknesses based on actual data"],
  "suggestions": [
    {
      "category": "Repository Quality",
      "priority": "high",
      "suggestion": "Specific actionable recommendation based on the data",
      "impact": "Expected impact of implementing this suggestion"
    }
  ],
  "industryBenchmarks": [
    {
      "metric": "Repository count",
      "userScore": ${profileData.publicRepos},
      "industryAverage": 25,
      "recommendation": "Specific recommendation based on comparison"
    },
    {
      "metric": "Followers",
      "userScore": ${profileData.followers},
      "industryAverage": 50,
      "recommendation": "How to improve follower count"
    },
    {
      "metric": "Stars received",
      "userScore": ${profileData.totalStars},
      "industryAverage": 100,
      "recommendation": "How to create more valuable repositories"
    }
  ],
  "actionPlan": {
    "immediate": ["Actions based on current state"],
    "shortTerm": ["2-4 week improvements"],
    "longTerm": ["1-3 month goals"]
  }
}

Focus your analysis on:
1. Profile completeness (bio, location, company, email)
2. Repository quality and documentation
3. Code diversity and language skills
4. Community engagement (stars, forks, followers)
5. Recent activity and consistency
6. Project showcase and pinned repositories
7. README quality and project descriptions
8. Open source contributions and collaboration

Provide specific, data-driven recommendations based on the actual GitHub metrics provided.`;

      const response = await this.makeGrokRequest(prompt);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      let analysisResult: ProfileAnalysisResult;
      
      try {
        analysisResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Cleaned Response:", cleanedResponse);
        
        analysisResult = this.generateFallbackGitHubAnalysis(profileData);
      }
      
      analysisResult.overallScore = Math.max(0, Math.min(100, analysisResult.overallScore || 70));
      analysisResult.strengths = analysisResult.strengths || [];
      analysisResult.weaknesses = analysisResult.weaknesses || [];
      analysisResult.suggestions = analysisResult.suggestions || [];
      analysisResult.industryBenchmarks = analysisResult.industryBenchmarks || [];
      analysisResult.actionPlan = analysisResult.actionPlan || {
        immediate: [],
        shortTerm: [],
        longTerm: []
      };

      return analysisResult;
    } catch (error) {
      console.error("GitHub profile analysis failed:", error);
      throw new Error(`Failed to analyze GitHub profile: ${error.message}`);
    }
  }

  private generateFallbackGitHubAnalysis(profileData: any): ProfileAnalysisResult {
    const score = this.calculateGitHubScore(profileData);
    
    return {
      overallScore: score,
      strengths: this.identifyGitHubStrengths(profileData),
      weaknesses: this.identifyGitHubWeaknesses(profileData),
      suggestions: this.generateGitHubSuggestions(profileData),
      industryBenchmarks: [
        {
          metric: "Public Repositories",
          userScore: profileData.publicRepos,
          industryAverage: 25,
          recommendation: profileData.publicRepos < 25 ? "Create more public repositories to showcase your skills" : "Good repository count"
        },
        {
          metric: "Followers",
          userScore: profileData.followers,
          industryAverage: 50,
          recommendation: profileData.followers < 50 ? "Engage more with the community to gain followers" : "Good follower count"
        },
        {
          metric: "Total Stars",
          userScore: profileData.totalStars,
          industryAverage: 100,
          recommendation: profileData.totalStars < 100 ? "Create more valuable projects to earn stars" : "Excellent star count"
        }
      ],
      actionPlan: {
        immediate: [
          !profileData.bio || profileData.bio === 'No bio' ? "Add a compelling bio" : null,
          !profileData.location || profileData.location === 'Not specified' ? "Add your location" : null,
          profileData.publicRepos < 5 ? "Create more public repositories" : null
        ].filter(Boolean),
        shortTerm: [
          "Improve README files for top repositories",
          "Add more descriptive commit messages",
          "Pin your best repositories"
        ],
        longTerm: [
          "Contribute to popular open source projects",
          "Create a portfolio website",
          "Build projects that solve real problems"
        ]
      }
    };
  }

  private calculateGitHubScore(profileData: any): number {
    let score = 0;
    
    if (profileData.name && profileData.name !== 'Not provided') score += 5;
    if (profileData.bio && profileData.bio !== 'No bio') score += 10;
    if (profileData.location && profileData.location !== 'Not specified') score += 5;
    if (profileData.company && profileData.company !== 'Not specified') score += 5;
    if (profileData.email && profileData.email !== 'Not public') score += 3;
    if (profileData.blog && profileData.blog !== 'None') score += 2;
    
    score += Math.min(20, profileData.publicRepos * 0.5);
    score += Math.min(10, profileData.recentActivity * 2);
    score += Math.min(10, profileData.hasReadmeInRepos * 0.5);
    
    score += Math.min(10, profileData.followers * 0.2);
    score += Math.min(10, profileData.totalStars * 0.1);
    score += Math.min(10, profileData.totalForks * 0.2);
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private identifyGitHubStrengths(profileData: any): string[] {
    const strengths = [];
    
    if (profileData.publicRepos > 20) strengths.push("Prolific contributor with many public repositories");
    if (profileData.totalStars > 100) strengths.push("Creates valuable projects that receive community recognition");
    if (profileData.followers > 50) strengths.push("Strong community following and engagement");
    if (profileData.topLanguages.length > 3) strengths.push("Diverse programming language skills");
    if (profileData.recentActivity > 10) strengths.push("Consistently active with recent contributions");
    if (profileData.hasReadmeInRepos / profileData.publicRepos > 0.7) strengths.push("Good documentation practices");
    if (profileData.accountAge > 2) strengths.push("Experienced GitHub user with established presence");
    
    return strengths.length > 0 ? strengths : ["Active GitHub user with public repositories"];
  }

  private identifyGitHubWeaknesses(profileData: any): string[] {
    const weaknesses = [];
    
    if (!profileData.bio || profileData.bio === 'No bio') weaknesses.push("Missing profile bio");
    if (!profileData.location || profileData.location === 'Not specified') weaknesses.push("Location not specified");
    if (profileData.publicRepos < 5) weaknesses.push("Limited number of public repositories");
    if (profileData.totalStars < 10) weaknesses.push("Projects lack community engagement");
    if (profileData.followers < 10) weaknesses.push("Limited follower base");
    if (profileData.recentActivity < 3) weaknesses.push("Low recent activity");
    if (profileData.hasReadmeInRepos / profileData.publicRepos < 0.5) weaknesses.push("Many repositories lack proper documentation");
    
    return weaknesses.length > 0 ? weaknesses : ["Profile could benefit from more detailed information"];
  }

  private generateGitHubSuggestions(profileData: any): any[] {
    const suggestions = [];
    
    if (!profileData.bio || profileData.bio === 'No bio') {
      suggestions.push({
        category: "Profile Information",
        priority: "high",
        suggestion: "Add a compelling bio that describes your skills, interests, and what you're working on",
        impact: "Helps visitors understand your background and expertise"
      });
    }
    
    if (profileData.publicRepos < 10) {
      suggestions.push({
        category: "Repository Portfolio",
        priority: "high",
        suggestion: "Create more public repositories to showcase your skills and projects",
        impact: "Demonstrates your coding abilities and project experience to potential employers"
      });
    }
    
    if (profileData.hasReadmeInRepos / profileData.publicRepos < 0.7) {
      suggestions.push({
        category: "Documentation",
        priority: "medium",
        suggestion: "Add comprehensive README files to your repositories with setup instructions and project descriptions",
        impact: "Makes your projects more accessible and professional"
      });
    }
    
    if (profileData.totalStars < 20) {
      suggestions.push({
        category: "Project Quality",
        priority: "medium",
        suggestion: "Focus on creating useful, well-documented projects that solve real problems",
        impact: "Increases community engagement and demonstrates your problem-solving skills"
      });
    }
    
    if (profileData.followers < 25) {
      suggestions.push({
        category: "Community Engagement",
        priority: "low",
        suggestion: "Engage with other developers by contributing to open source projects and following interesting developers",
        impact: "Builds your professional network and increases visibility"
      });
    }
    
    return suggestions;
  }

  private async analyzeLinkedInProfile(profileUrl: string, linkedinData: any, additionalContext?: string): Promise<ProfileAnalysisResult> {
    if (!linkedinData || Object.keys(linkedinData).length === 0) {
      throw new Error("LinkedIn profile analysis requires additional profile information. Please provide your LinkedIn profile details through the form.");
    }

    const prompt = `Analyze this LinkedIn profile and provide comprehensive improvement recommendations.

LinkedIn Profile Data:
- Profile URL: ${profileUrl}
- Headline: ${linkedinData.headline || 'Not provided'}
- Summary: ${linkedinData.summary || 'Not provided'}
- Experience: ${JSON.stringify(linkedinData.experience || [])}
- Education: ${JSON.stringify(linkedinData.education || [])}
- Skills: ${JSON.stringify(linkedinData.skills || [])}
- Recommendations: ${linkedinData.recommendations || 0}
- Connections: ${linkedinData.connections || 'Not specified'}
- Recent Posts: ${JSON.stringify(linkedinData.posts || [])}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Based on this LinkedIn profile data, provide a detailed analysis in VALID JSON format:

{
  "overallScore": 75,
  "strengths": ["Specific strengths based on profile data"],
  "weaknesses": ["Specific areas for improvement"],
  "suggestions": [
    {
      "category": "Profile Headline",
      "priority": "high",
      "suggestion": "Specific recommendation for improvement",
      "impact": "Expected impact of this change"
    }
  ],
  "industryBenchmarks": [
    {
      "metric": "Profile completeness",
      "userScore": 80,
      "industryAverage": 85,
      "recommendation": "How to improve this metric"
    }
  ],
  "actionPlan": {
    "immediate": ["Actions to take today"],
    "shortTerm": ["2-4 week improvements"],
    "longTerm": ["1-3 month goals"]
  }
}

Focus your analysis on:
1. Profile headline optimization with keywords
2. Summary/About section engagement and storytelling
3. Experience descriptions with quantified achievements
4. Skills section optimization and endorsements
5. Education relevance and presentation
6. Recommendation quality and quantity
7. Network size and engagement
8. Content creation and thought leadership
9. Profile photo professionalism
10. Contact information completeness

Provide specific, actionable advice that will measurably improve their professional visibility and opportunities.`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      let analysisResult: ProfileAnalysisResult;
      
      try {
        analysisResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        
        analysisResult = this.generateFallbackLinkedInAnalysis(linkedinData);
      }
      
      analysisResult.overallScore = Math.max(0, Math.min(100, analysisResult.overallScore || 70));
      analysisResult.strengths = analysisResult.strengths || [];
      analysisResult.weaknesses = analysisResult.weaknesses || [];
      analysisResult.suggestions = analysisResult.suggestions || [];
      analysisResult.industryBenchmarks = analysisResult.industryBenchmarks || [];
      analysisResult.actionPlan = analysisResult.actionPlan || {
        immediate: [],
        shortTerm: [],
        longTerm: []
      };

      return analysisResult;
    } catch (error) {
      console.error("LinkedIn profile analysis failed:", error);
      throw new Error(`Failed to analyze LinkedIn profile: ${error.message}`);
    }
  }

  private generateFallbackLinkedInAnalysis(linkedinData: any): ProfileAnalysisResult {
    const score = this.calculateLinkedInScore(linkedinData);
    
    return {
      overallScore: score,
      strengths: this.identifyLinkedInStrengths(linkedinData),
      weaknesses: this.identifyLinkedInWeaknesses(linkedinData),
      suggestions: this.generateLinkedInSuggestions(linkedinData),
      industryBenchmarks: [
        {
          metric: "Profile Completeness",
          userScore: score,
          industryAverage: 85,
          recommendation: score < 85 ? "Complete missing profile sections" : "Well-completed profile"
        },
        {
          metric: "Skills Listed",
          userScore: (linkedinData.skills || []).length,
          industryAverage: 15,
          recommendation: (linkedinData.skills || []).length < 15 ? "Add more relevant skills" : "Good skill coverage"
        },
        {
          metric: "Recommendations",
          userScore: linkedinData.recommendations || 0,
          industryAverage: 5,
          recommendation: (linkedinData.recommendations || 0) < 5 ? "Request more recommendations" : "Good recommendation count"
        }
      ],
      actionPlan: {
        immediate: [
          !linkedinData.headline ? "Write a compelling headline" : null,
          !linkedinData.summary ? "Add a professional summary" : null,
          (linkedinData.skills || []).length < 5 ? "Add more skills" : null
        ].filter(Boolean),
        shortTerm: [
          "Optimize experience descriptions with achievements",
          "Request recommendations from colleagues",
          "Share industry-relevant content"
        ],
        longTerm: [
          "Build thought leadership through regular posting",
          "Expand professional network strategically",
          "Engage with industry discussions"
        ]
      }
    };
  }

  private calculateLinkedInScore(linkedinData: any): number {
    let score = 0;
    
    if (linkedinData.headline) score += 15;
    if (linkedinData.summary && linkedinData.summary.length > 100) score += 15;
    if (linkedinData.experience && linkedinData.experience.length > 0) score += 10;
    
    const skillCount = (linkedinData.skills || []).length;
    score += Math.min(20, skillCount * 1.5);
    
    if (linkedinData.education && linkedinData.education.length > 0) score += 10;
    
    const recommendations = linkedinData.recommendations || 0;
    score += Math.min(10, recommendations * 2);
    
    const connections = this.parseConnectionCount(linkedinData.connections);
    score += Math.min(10, connections / 50);
    
    if (linkedinData.posts && linkedinData.posts.length > 0) score += 10;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private parseConnectionCount(connections: string): number {
    if (!connections) return 0;
    if (connections.includes('500+')) return 500;
    const match = connections.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private identifyLinkedInStrengths(linkedinData: any): string[] {
    const strengths = [];
    
    if (linkedinData.headline && linkedinData.headline.length > 50) {
      strengths.push("Detailed and descriptive headline");
    }
    if (linkedinData.summary && linkedinData.summary.length > 200) {
      strengths.push("Comprehensive professional summary");
    }
    if (linkedinData.experience && linkedinData.experience.length > 2) {
      strengths.push("Extensive work experience documented");
    }
    if ((linkedinData.skills || []).length > 10) {
      strengths.push("Diverse skill set listed");
    }
    if ((linkedinData.recommendations || 0) > 3) {
      strengths.push("Strong professional recommendations");
    }
    if (linkedinData.posts && linkedinData.posts.length > 0) {
      strengths.push("Active content creator and thought leader");
    }
    
    return strengths.length > 0 ? strengths : ["Professional LinkedIn presence"];
  }

  private identifyLinkedInWeaknesses(linkedinData: any): string[] {
    const weaknesses = [];
    
    if (!linkedinData.headline) {
      weaknesses.push("Missing professional headline");
    }
    if (!linkedinData.summary) {
      weaknesses.push("No professional summary provided");
    }
    if (!linkedinData.experience || linkedinData.experience.length === 0) {
      weaknesses.push("Work experience not documented");
    }
    if ((linkedinData.skills || []).length < 5) {
      weaknesses.push("Limited skills listed");
    }
    if ((linkedinData.recommendations || 0) === 0) {
      weaknesses.push("No professional recommendations");
    }
    if (!linkedinData.posts || linkedinData.posts.length === 0) {
      weaknesses.push("No content creation or engagement");
    }
    
    return weaknesses.length > 0 ? weaknesses : ["Profile could be more comprehensive"];
  }

  private generateLinkedInSuggestions(linkedinData: any): any[] {
    const suggestions = [];
    
    if (!linkedinData.headline) {
      suggestions.push({
        category: "Profile Headline",
        priority: "high",
        suggestion: "Create a compelling headline that includes your role, key skills, and value proposition",
        impact: "Increases profile visibility in searches and makes a strong first impression"
      });
    }
    
    if (!linkedinData.summary || linkedinData.summary.length < 100) {
      suggestions.push({
        category: "Professional Summary",
        priority: "high",
        suggestion: "Write a detailed summary that tells your professional story, highlights achievements, and includes relevant keywords",
        impact: "Helps visitors understand your background and expertise quickly"
      });
    }
    
    if ((linkedinData.skills || []).length < 10) {
      suggestions.push({
        category: "Skills Section",
        priority: "medium",
        suggestion: "Add more relevant skills to your profile and seek endorsements from colleagues",
        impact: "Improves searchability and validates your expertise"
      });
    }
    
    if ((linkedinData.recommendations || 0) < 3) {
      suggestions.push({
        category: "Recommendations",
        priority: "medium",
        suggestion: "Request recommendations from former colleagues, managers, or clients",
        impact: "Provides social proof and credibility to your profile"
      });
    }
    
    if (!linkedinData.posts || linkedinData.posts.length === 0) {
      suggestions.push({
        category: "Content Strategy",
        priority: "low",
        suggestion: "Start sharing industry insights, commenting on posts, and creating original content",
        impact: "Builds thought leadership and increases network engagement"
      });
    }
    
    return suggestions;
  }

  async analyzeProfile(request: ProfileAnalysisRequest): Promise<ProfileAnalysisResult> {
    const { profileUrl, profileType, additionalContext, linkedinData } = request;
    
    if (profileType === 'github') {
      return this.analyzeGitHubProfile(profileUrl, additionalContext);
    } else if (profileType === 'linkedin') {
      return this.analyzeLinkedInProfile(profileUrl, linkedinData, additionalContext);
    } else {
      throw new Error('Unsupported profile type');
    }
  }

  private async fetchYouTubeResources(skill: string, level: string): Promise<any[]> {
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
        return Math.ceil(baseWeeks * 1.5);
      case 'fast':
        return Math.ceil(baseWeeks * 0.75);
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
    
    return 8;
  }

  private normalizeDifficulty(difficulty: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const difficultyLower = difficulty.toLowerCase();
    
    if (difficultyLower.includes('beginner') || difficultyLower.includes('entry') || difficultyLower.includes('basic')) {
      return 'Beginner';
    } else if (difficultyLower.includes('advanced') || difficultyLower.includes('expert') || difficultyLower.includes('senior')) {
      return 'Advanced';
    } else {
      return 'Intermediate';
    }
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    const { targetRole, currentSkills, experienceLevel, timeframe, interests, pace = 'normal' } = request;
    
    const adjustedWeeks = this.adjustTimeframeForPace(timeframe, pace);
    
    const prompt = `Create a comprehensive, personalized career learning path for someone who wants to become a ${targetRole}.

IMPORTANT: Generate UNIQUE and SPECIFIC content based on the user's profile. Do NOT use generic templates.

CRITICAL REQUIREMENT: For the "difficulty" field, you MUST use EXACTLY one of these three values: "Beginner", "Intermediate", or "Advanced". No other variations, combinations, or descriptions are allowed.

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
  "difficulty": "MUST be exactly one of: Beginner, Intermediate, or Advanced",
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
9. Make content relevant to user's interests: ${interests.join(', ')}
10. DIFFICULTY FIELD MUST BE EXACTLY: "Beginner", "Intermediate", or "Advanced" - no other values allowed`;

    try {
      const response = await this.makeGrokRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON format from response");

      const careerPath: CareerPath = JSON.parse(jsonMatch[0]);
      
      if (!careerPath?.title || !Array.isArray(careerPath.weeklyPlan)) {
        throw new Error("Invalid structure in career path");
      }

      careerPath.difficulty = this.normalizeDifficulty(careerPath.difficulty);

      for (let week of careerPath.weeklyPlan) {
        const additionalResources = await this.getEnhancedResources(week.skills, targetRole);
        week.resources = [...(week.resources || []), ...additionalResources];
        
        if (!week.projects || week.projects.length === 0) {
          week.projects = this.generateRoleSpecificProjects(targetRole, week.week, week.skills);
        }
        
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
    
    for (const skill of skills.slice(0, 2)) {
      try {
        const [youtube, udemy, coursera, mdn, community] = await Promise.all([
          this.fetchYouTubeResources(skill, 'beginner'),
          this.fetchUdemyResources(skill),
          this.fetchCourseraResources(skill),
          this.fetchMDNResources(skill),
          this.fetchCommunityResources(skill)
        ]);
        
        if (youtube.length > 0) enhancedResources.push(youtube[0]);
        if (udemy.length > 0) enhancedResources.push(udemy[0]);
        if (mdn.length > 0) enhancedResources.push(mdn[0]);
        if (community.length > 0) enhancedResources.push(community[0]);
      } catch (error) {
        console.error(`Failed to fetch resources for ${skill}:`, error);
      }
    }
    
    return enhancedResources.slice(0, 3);
  }

  async generateResourceRecommendations(skill: string, level: string): Promise<any[]> {
    try {
      const [youtube, udemy, coursera, mdn, community] = await Promise.all([
        this.fetchYouTubeResources(skill, level),
        this.fetchUdemyResources(skill),
        this.fetchCourseraResources(skill),
        this.fetchMDNResources(skill),
        this.fetchCommunityResources(skill)
      ]);
      
      const allResources = [...youtube, ...udemy, ...coursera, ...mdn, ...community];
      return allResources.slice(0, 8);
    } catch (err) {
      console.error("Resource recommendation failed:", err);
      return [];
    }
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    throw new Error("Skill gap analysis is not implemented yet. This feature will be available soon.");
  }
}

export default new GrokService();