import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';

dotenv.config();

interface ResumeAnalysisRequest {
  extractedText: string;
  extractedSections: any;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: string;
  additionalContext?: string;
  fileName: string;
  fileType: string;
}

interface ResumeAnalysisResult {
  overallScore: number;
  contentAnalysis: any;
  sectionAnalysis: any[];
  skillsAnalysis: any;
  experienceAnalysis: any;
  atsAnalysis: any;
  industryAnalysis: any;
  formattingAnalysis: any;
  recommendations: any;
  industryBenchmarks: any[];
  improvementPlan: any;
}

class ResumeAnalyzerService {
  private client: ReturnType<typeof ModelClient>;
  private modelName: string = "gpt-4o";

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = "https://models.inference.ai.azure.com";

    if (!token) throw new Error("Missing GITHUB_TOKEN in environment");

    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  private async makeAIRequest(prompt: string): Promise<string> {
    try {
      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            {
              role: "system",
              content: "You are an expert resume analyzer and career coach. You provide comprehensive analysis of resumes including ATS compatibility, content quality, skills assessment, and actionable recommendations. Always return valid JSON format without any markdown formatting or extra text.",
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
        console.error("GitHub Models API error:", response.body.error);
        throw new Error(`GitHub Models API error: ${response.body.error?.message || 'Unknown error'}`);
      }

      return response.body.choices[0]?.message?.content || '';
    } catch (error) {
      console.error("AI request failed:", error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResult> {
    const {
      extractedText,
      targetRole,
      targetIndustry,
      experienceLevel,
      fileType
    } = request;

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text content found in the resume. Please ensure the file is readable and contains text.");
    }

    try {
      // Create comprehensive analysis prompt
      const analysisPrompt = `Analyze this resume comprehensively and provide detailed insights in JSON format.

Resume Content:
${extractedText}

Target Role: ${targetRole || 'Not specified'}
Target Industry: ${targetIndustry || 'Not specified'}
Experience Level: ${experienceLevel || 'mid'}
File Type: ${fileType}

Provide analysis in this exact JSON structure:

{
  "overallScore": 75,
  "contentAnalysis": {
    "totalWords": 450,
    "readabilityScore": 85,
    "grammarIssues": ["List any grammar issues found"],
    "spellingErrors": ["List any spelling errors"],
    "toneAnalysis": "Professional/Casual/Mixed",
    "clarityScore": 80
  },
  "sectionAnalysis": [
    {
      "section": "summary",
      "score": 80,
      "strengths": ["List of strengths"],
      "weaknesses": ["List of weaknesses"],
      "suggestions": ["List of suggestions"],
      "wordCount": 50
    }
  ],
  "skillsAnalysis": {
    "identifiedSkills": [
      {
        "skill": "JavaScript",
        "relevance": "high",
        "frequency": 3,
        "context": "Used in multiple projects"
      }
    ],
    "skillsGap": ["Skills missing for target role"],
    "recommendedSkills": ["Skills to add"],
    "technicalSkills": ["List of technical skills"],
    "softSkills": ["List of soft skills"]
  },
  "experienceAnalysis": {
    "totalYears": 5,
    "careerProgression": "Shows clear progression",
    "achievementCount": 8,
    "quantifiedAchievements": 4,
    "actionVerbsUsed": ["achieved", "managed", "developed"],
    "improvementSuggestions": ["Add more quantified results"]
  },
  "atsAnalysis": {
    "overallScore": 75,
    "keywordMatch": 70,
    "formatting": 85,
    "readability": 80,
    "recommendations": ["Use more industry keywords"],
    "missingKeywords": ["List of missing keywords"],
    "foundKeywords": ["List of found keywords"]
  },
  "industryAnalysis": {
    "targetIndustry": "${targetIndustry || 'Technology'}",
    "industryRelevance": 80,
    "industryKeywords": ["List of industry-specific keywords"],
    "competitorAnalysis": "Analysis of how resume compares",
    "marketTrends": ["Current market trends"]
  },
  "formattingAnalysis": {
    "structure": "Well-structured",
    "consistency": 85,
    "visualAppeal": 80,
    "length": "Appropriate length",
    "fontAnalysis": "Professional formatting",
    "spacingAnalysis": "Good spacing"
  },
  "recommendations": {
    "immediate": ["Actions to take today"],
    "shortTerm": ["Actions for next 1-2 weeks"],
    "longTerm": ["Actions for next 1-3 months"],
    "priorityActions": ["Most important actions"]
  },
  "industryBenchmarks": [
    {
      "metric": "Overall Score",
      "userScore": 75,
      "industryAverage": 70,
      "topPercentile": 90,
      "recommendation": "Good score, focus on specific improvements"
    }
  ],
  "improvementPlan": {
    "weeklyGoals": ["Goals for each week"],
    "monthlyGoals": ["Goals for each month"],
    "skillDevelopment": ["Skills to develop"],
    "networkingAdvice": ["Networking recommendations"]
  }
}

Focus on:
1. ATS compatibility and keyword optimization
2. Content quality and readability
3. Skills assessment and gap analysis
4. Achievement quantification
5. Industry-specific recommendations
6. Actionable improvement suggestions

Provide specific, measurable recommendations based on the actual resume content.`;

      // Get AI analysis
      const response = await this.makeAIRequest(analysisPrompt);
      
      // Clean and parse JSON response
      const cleanedResponse = this.cleanJsonResponse(response);
      let analysisResult: ResumeAnalysisResult;
      
      try {
        analysisResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Cleaned Response:", cleanedResponse);
        
        // Generate fallback analysis
        analysisResult = this.generateFallbackAnalysis(extractedText, targetRole, experienceLevel);
      }
      
      // Validate and normalize the analysis result
      analysisResult = this.validateAnalysisResult(analysisResult);

      return analysisResult;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to analyze resume: ${error.message}`);
      } else {
        throw new Error('Failed to analyze resume: Unknown error');
      }
    }
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

  private generateFallbackAnalysis(extractedText: string, targetRole?: string, _experienceLevel?: string): ResumeAnalysisResult {
    const wordCount = extractedText.trim().split(/\s+/).length;
    const skillsFound = this.extractBasicSkills(extractedText);
    
    return {
      overallScore: 70,
      contentAnalysis: {
        totalWords: wordCount,
        readabilityScore: 75,
        grammarIssues: [],
        spellingErrors: [],
        toneAnalysis: "Professional",
        clarityScore: 75
      },
      sectionAnalysis: [
        {
          section: "overall",
          score: 70,
          strengths: ["Professional content"],
          weaknesses: ["Could be more specific"],
          suggestions: ["Add more quantified achievements"],
          wordCount: wordCount
        }
      ],
      skillsAnalysis: {
        identifiedSkills: skillsFound.map(skill => ({
          skill,
          relevance: "medium" as const,
          frequency: 1,
          context: "Found in resume"
        })),
        skillsGap: ["Industry-specific skills"],
        recommendedSkills: ["Leadership", "Communication"],
        technicalSkills: skillsFound.filter(skill => 
          ['javascript', 'python', 'react', 'sql'].some(tech => 
            skill.toLowerCase().includes(tech)
          )
        ),
        softSkills: ["Communication", "Leadership"]
      },
      experienceAnalysis: {
        totalYears: this.estimateExperience(extractedText),
        careerProgression: "Shows progression",
        achievementCount: 5,
        quantifiedAchievements: 2,
        actionVerbsUsed: ["managed", "developed", "achieved"],
        improvementSuggestions: ["Add more quantified results"]
      },
      atsAnalysis: {
        overallScore: 70,
        keywordMatch: 65,
        formatting: 75,
        readability: 80,
        recommendations: ["Add more industry keywords"],
        missingKeywords: ["Industry-specific terms"],
        foundKeywords: skillsFound.slice(0, 5)
      },
      industryAnalysis: {
        targetIndustry: targetRole || "Technology",
        industryRelevance: 70,
        industryKeywords: ["professional", "experience"],
        competitorAnalysis: "Competitive resume",
        marketTrends: ["Remote work", "Digital skills"]
      },
      formattingAnalysis: {
        structure: "Well-structured",
        consistency: 75,
        visualAppeal: 70,
        length: wordCount > 800 ? "Too long" : wordCount < 300 ? "Too short" : "Appropriate",
        fontAnalysis: "Professional formatting",
        spacingAnalysis: "Good spacing"
      },
      recommendations: {
        immediate: ["Proofread for errors", "Add contact information"],
        shortTerm: ["Quantify achievements", "Add relevant keywords"],
        longTerm: ["Gain additional skills", "Build portfolio"],
        priorityActions: ["Focus on quantified achievements"]
      },
      industryBenchmarks: [
        {
          metric: "Overall Score",
          userScore: 70,
          industryAverage: 75,
          topPercentile: 90,
          recommendation: "Good foundation, focus on improvements"
        }
      ],
      improvementPlan: {
        weeklyGoals: ["Update one section per week"],
        monthlyGoals: ["Complete resume overhaul"],
        skillDevelopment: ["Learn industry-relevant skills"],
        networkingAdvice: ["Connect with industry professionals"]
      }
    };
  }

  private extractBasicSkills(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'Leadership', 'Management', 'Communication', 'Project Management',
      'Marketing', 'Sales', 'Design', 'Analytics', 'Excel', 'PowerPoint'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private estimateExperience(text: string): number {
    const yearMatches = text.match(/(\d+)\s*(?:years?|yrs?)/gi);
    if (yearMatches) {
      const years = yearMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
      return Math.max(...years);
    }
    
    // Count job positions as rough estimate
    const jobCount = (text.match(/\b(?:at|@)\s+[A-Z]/g) || []).length;
    return Math.min(jobCount * 2, 15); // Assume 2 years per job, max 15 years
  }

  private validateAnalysisResult(result: any): ResumeAnalysisResult {
    // Ensure all required fields exist with defaults
    return {
      overallScore: Math.max(0, Math.min(100, result.overallScore || 70)),
      contentAnalysis: result.contentAnalysis || {
        totalWords: 0,
        readabilityScore: 70,
        grammarIssues: [],
        spellingErrors: [],
        toneAnalysis: "Professional",
        clarityScore: 70
      },
      sectionAnalysis: Array.isArray(result.sectionAnalysis) ? result.sectionAnalysis : [],
      skillsAnalysis: result.skillsAnalysis || {
        identifiedSkills: [],
        skillsGap: [],
        recommendedSkills: [],
        technicalSkills: [],
        softSkills: []
      },
      experienceAnalysis: result.experienceAnalysis || {
        totalYears: 0,
        careerProgression: "Unknown",
        achievementCount: 0,
        quantifiedAchievements: 0,
        actionVerbsUsed: [],
        improvementSuggestions: []
      },
      atsAnalysis: result.atsAnalysis || {
        overallScore: 70,
        keywordMatch: 70,
        formatting: 70,
        readability: 70,
        recommendations: [],
        missingKeywords: [],
        foundKeywords: []
      },
      industryAnalysis: result.industryAnalysis || {
        targetIndustry: "General",
        industryRelevance: 70,
        industryKeywords: [],
        competitorAnalysis: "Standard",
        marketTrends: []
      },
      formattingAnalysis: result.formattingAnalysis || {
        structure: "Standard",
        consistency: 70,
        visualAppeal: 70,
        length: "Appropriate",
        fontAnalysis: "Standard",
        spacingAnalysis: "Standard"
      },
      recommendations: result.recommendations || {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        priorityActions: []
      },
      industryBenchmarks: Array.isArray(result.industryBenchmarks) ? result.industryBenchmarks : [],
      improvementPlan: result.improvementPlan || {
        weeklyGoals: [],
        monthlyGoals: [],
        skillDevelopment: [],
        networkingAdvice: []
      }
    };
  }
}

export default new ResumeAnalyzerService();