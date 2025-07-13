import ResumeParserService from './resumeParser.service.js';
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
  }

  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResult> {
    const {
      extractedText,
      extractedSections,
      targetRole,
      targetIndustry,
      experienceLevel,
      fileType
    } = request;

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

  private generateFallbackAnalysis(extractedText: string, targetRole?: string, experienceLevel?: string): ResumeAnalysisResult {
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

  // Keep all the existing helper methods for backward compatibility
  private async analyzeContent(text: string): Promise<any> {
    const wordCount = text.trim().split(/\s+/).length;
    
    // Basic readability analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const readabilityScore = this.calculateReadabilityScore(avgWordsPerSentence, wordCount);

    // Grammar and spelling analysis (simplified)
    const grammarIssues = this.detectGrammarIssues(text);
    const spellingErrors = this.detectSpellingErrors(text);

    // Tone analysis
    const toneAnalysis = this.analyzeTone(text);

    return {
      totalWords: wordCount,
      readabilityScore,
      grammarIssues,
      spellingErrors,
      toneAnalysis,
      clarityScore: this.calculateClarityScore(text)
    };
  }

  private async analyzeSkills(text: string, skillsSection: string, targetRole?: string): Promise<any> {
    const identifiedSkills = ResumeParserService.extractSkills(text);
    const skillsFromSection = skillsSection ? ResumeParserService.extractSkills(skillsSection) : [];
    
    const allSkills = [...new Set([...identifiedSkills, ...skillsFromSection])];
    
    // Categorize skills
    const technicalSkills = this.categorizeTechnicalSkills(allSkills);
    const softSkills = this.categorizeSoftSkills(text);

    // Analyze skill relevance for target role
    const skillsAnalysis = allSkills.map(skill => ({
      skill,
      relevance: this.assessSkillRelevance(skill, targetRole),
      frequency: this.countSkillMentions(skill, text),
      context: this.getSkillContext(skill, text)
    }));

    // Identify skills gap
    const recommendedSkills = this.getRecommendedSkills(targetRole, allSkills);
    const skillsGap = recommendedSkills.filter(skill => 
      !allSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return {
      identifiedSkills: skillsAnalysis,
      skillsGap,
      recommendedSkills,
      technicalSkills,
      softSkills
    };
  }

  private async analyzeExperience(experienceSection: string): Promise<any> {
    const experiences = ResumeParserService.extractExperience(experienceSection);
    const quantifiedAchievements = ResumeParserService.extractQuantifiedAchievements(experienceSection);
    const actionVerbs = ResumeParserService.extractActionVerbs(experienceSection);

    // Calculate total years of experience
    const totalYears = this.calculateTotalExperience(experienceSection);

    // Analyze career progression
    const careerProgression = this.analyzeCareerProgression(experiences);

    return {
      totalYears,
      careerProgression,
      achievementCount: experiences.reduce((sum, exp) => sum + (exp.achievements?.length || 0), 0),
      quantifiedAchievements: quantifiedAchievements.length,
      actionVerbsUsed: actionVerbs,
      improvementSuggestions: this.generateExperienceImprovements(experiences, quantifiedAchievements)
    };
  }

  private async analyzeATSCompatibility(text: string, targetRole?: string): Promise<any> {
    const keywords = this.extractRelevantKeywords(targetRole);
    const foundKeywords = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    const missingKeywords = keywords.filter(keyword => 
      !text.toLowerCase().includes(keyword.toLowerCase())
    );

    const keywordMatch = keywords.length > 0 ? (foundKeywords.length / keywords.length) * 100 : 0;
    const formatting = this.assessATSFormatting(text);
    const readability = this.assessATSReadability(text);

    const overallScore = (keywordMatch + formatting + readability) / 3;

    return {
      overallScore: Math.round(overallScore),
      keywordMatch: Math.round(keywordMatch),
      formatting: Math.round(formatting),
      readability: Math.round(readability),
      recommendations: this.generateATSRecommendations(keywordMatch, formatting, readability),
      missingKeywords: missingKeywords.slice(0, 10),
      foundKeywords: foundKeywords.slice(0, 10)
    };
  }

  private async analyzeFormatting(text: string, fileType: string): Promise<any> {
    const lines = text.split('\n');
    
    const structure = this.assessStructure(text);
    const consistency = this.assessConsistency(lines);
    const visualAppeal = this.assessVisualAppeal(text, fileType);
    const length = this.assessLength(text);

    return {
      structure,
      consistency,
      visualAppeal,
      length,
      fontAnalysis: 'Standard formatting detected',
      spacingAnalysis: this.analyzeSpacing(lines)
    };
  }

  private async analyzeSections(sections: any): Promise<any[]> {
    const sectionAnalysis = [];

    for (const [sectionName, content] of Object.entries(sections)) {
      if (content && typeof content === 'string') {
        const analysis = await this.analyzeSingleSection(sectionName, content);
        sectionAnalysis.push({
          section: sectionName,
          ...analysis
        });
      }
    }

    return sectionAnalysis;
  }

  private async analyzeSingleSection(sectionName: string, content: string): Promise<any> {
    const wordCount = content.trim().split(/\s+/).length;
    const score = this.scoreSectionContent(sectionName, content);
    
    return {
      score,
      strengths: this.identifySectionStrengths(sectionName, content),
      weaknesses: this.identifySectionWeaknesses(sectionName, content),
      suggestions: this.generateSectionSuggestions(sectionName, content),
      content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      wordCount,
      keywordDensity: this.calculateKeywordDensity(content)
    };
  }

  private async analyzeIndustryRelevance(text: string, targetRole?: string, targetIndustry?: string): Promise<any> {
    const industryKeywords = this.getIndustryKeywords(targetIndustry);
    const relevanceScore = this.calculateIndustryRelevance(text, industryKeywords);

    return {
      targetIndustry: targetIndustry || 'General',
      industryRelevance: relevanceScore,
      industryKeywords: industryKeywords.slice(0, 10),
      competitorAnalysis: this.generateCompetitorAnalysis(targetRole, targetIndustry),
      marketTrends: this.getMarketTrends(targetIndustry)
    };
  }

  private calculateOverallScore(analyses: any): number {
    const weights = {
      content: 0.15,
      sections: 0.20,
      skills: 0.20,
      experience: 0.20,
      ats: 0.15,
      formatting: 0.10
    };

    const contentScore = analyses.contentAnalysis.readabilityScore || 70;
    const sectionsScore = analyses.sectionAnalysis.reduce((sum: number, section: any) => sum + section.score, 0) / analyses.sectionAnalysis.length || 70;
    const skillsScore = this.calculateSkillsScore(analyses.skillsAnalysis);
    const experienceScore = this.calculateExperienceScore(analyses.experienceAnalysis);
    const atsScore = analyses.atsAnalysis.overallScore || 70;
    const formattingScore = this.calculateFormattingScore(analyses.formattingAnalysis);

    const overallScore = (
      contentScore * weights.content +
      sectionsScore * weights.sections +
      skillsScore * weights.skills +
      experienceScore * weights.experience +
      atsScore * weights.ats +
      formattingScore * weights.formatting
    );

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  private async generateRecommendations(data: any): Promise<any> {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];
    const priorityActions = [];

    // Immediate actions (can be done today)
    if (data.overallScore < 60) {
      immediate.push('Fix critical formatting and structure issues');
    }
    if (data.atsAnalysis.overallScore < 70) {
      immediate.push('Optimize for ATS compatibility by adding relevant keywords');
    }
    if (data.contentAnalysis.grammarIssues.length > 0) {
      immediate.push('Proofread and fix grammar/spelling errors');
    }

    // Short-term actions (1-2 weeks)
    if (data.skillsAnalysis.skillsGap.length > 0) {
      shortTerm.push('Add missing skills relevant to your target role');
    }
    if (data.experienceAnalysis.quantifiedAchievements < 3) {
      shortTerm.push('Quantify your achievements with specific numbers and metrics');
    }

    // Long-term actions (1-3 months)
    if (data.experienceAnalysis.totalYears < 2) {
      longTerm.push('Gain more relevant experience through projects or internships');
    }
    if (data.skillsAnalysis.technicalSkills.length < 5) {
      longTerm.push('Develop additional technical skills for your field');
    }

    // Priority actions
    if (data.overallScore < 50) {
      priorityActions.push('Complete resume restructure and content overhaul');
    } else if (data.overallScore < 70) {
      priorityActions.push('Focus on ATS optimization and keyword integration');
    } else {
      priorityActions.push('Fine-tune content and add more quantified achievements');
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      priorityActions
    };
  }

  private async generateImprovementPlan(data: any): Promise<any> {
    return {
      weeklyGoals: [
        'Review and update one section of your resume',
        'Research and add 2-3 relevant keywords',
        'Quantify one achievement with specific metrics'
      ],
      monthlyGoals: [
        'Complete a comprehensive resume review and update',
        'Tailor resume for 3-5 specific job applications',
        'Get feedback from industry professionals'
      ],
      skillDevelopment: data.skillsAnalysis.skillsGap.slice(0, 5),
      networkingAdvice: [
        'Connect with professionals in your target industry',
        'Join relevant professional associations',
        'Attend industry events and conferences'
      ]
    };
  }

  private generateIndustryBenchmarks(overallScore: number, _targetRole?: string, _targetIndustry?: string, _experienceLevel?: string): any[] {
    const benchmarks = [
      {
        metric: 'Overall Resume Score',
        userScore: overallScore,
        industryAverage: 75,
        topPercentile: 90,
        recommendation: overallScore < 75 ? 'Focus on improving weak sections' : 'Excellent overall score'
      },
      {
        metric: 'ATS Compatibility',
        userScore: 80, // This would come from actual analysis
        industryAverage: 70,
        topPercentile: 85,
        recommendation: 'Good ATS compatibility, continue optimizing keywords'
      },
      {
        metric: 'Skills Relevance',
        userScore: 75,
        industryAverage: 80,
        topPercentile: 95,
        recommendation: 'Add more industry-specific skills'
      }
    ];

    return benchmarks;
  }

  // Helper methods for analysis
  private calculateReadabilityScore(avgWordsPerSentence: number, totalWords: number): number {
    // Simplified readability calculation
    let score = 100;
    
    if (avgWordsPerSentence > 20) score -= 10;
    if (avgWordsPerSentence > 25) score -= 10;
    if (totalWords < 300) score -= 15;
    if (totalWords > 800) score -= 10;
    
    return Math.max(0, score);
  }

  private detectGrammarIssues(text: string): string[] {
    const issues = [];
    
    // Simple grammar checks
    if (text.includes(' i ')) issues.push('Lowercase "i" should be capitalized');
    if (text.includes('  ')) issues.push('Multiple spaces detected');
    if (!/[.!?]$/.test(text.trim())) issues.push('Missing punctuation at end');
    
    return issues;
  }

  private detectSpellingErrors(text: string): string[] {
    // This would integrate with a spell-checking library in production
    const commonErrors = ['recieve', 'seperate', 'occured', 'managment'];
    const errors: string[] = [];
    
    commonErrors.forEach(error => {
      if (text.toLowerCase().includes(error)) {
        errors.push(error);
      }
    });
    
    return errors;
  }

  private analyzeTone(text: string): string {
    const professionalWords = ['achieved', 'managed', 'developed', 'implemented', 'led'];
    const casualWords = ['helped', 'worked on', 'did', 'was responsible'];
    
    const professionalCount = professionalWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    const casualCount = casualWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    if (professionalCount > casualCount) return 'Professional';
    if (casualCount > professionalCount) return 'Casual';
    return 'Neutral';
  }

  private calculateClarityScore(text: string): number {
    // Simple clarity assessment
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    if (avgLength < 50) return 90;
    if (avgLength < 100) return 80;
    if (avgLength < 150) return 70;
    return 60;
  }

  private categorizeTechnicalSkills(skills: string[]): string[] {
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'api', 'database', 'cloud', 'devops'
    ];
    
    return skills.filter(skill => 
      technicalKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword)
      )
    );
  }

  private categorizeSoftSkills(text: string): string[] {
    const softSkillKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'analytical', 'creative', 'adaptable', 'organized'
    ];
    
    return softSkillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private assessSkillRelevance(skill: string, targetRole?: string): 'high' | 'medium' | 'low' {
    if (!targetRole) return 'medium';
    
    const roleKeywords = this.getRoleKeywords(targetRole);
    const isRelevant = roleKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(skill.toLowerCase())
    );
    
    return isRelevant ? 'high' : 'medium';
  }

  private countSkillMentions(skill: string, text: string): number {
    const regex = new RegExp(skill, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  private getSkillContext(skill: string, text: string): string {
    const sentences = text.split(/[.!?]+/);
    const contextSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(skill.toLowerCase())
    );
    
    return contextSentence ? contextSentence.trim().substring(0, 100) + '...' : '';
  }

  private getRecommendedSkills(targetRole?: string, _currentSkills: string[] = []): string[] {
    const roleSkillMap: { [key: string]: string[] } = {
      'frontend developer': ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript', 'Vue', 'Angular'],
      'backend developer': ['Node.js', 'Python', 'Java', 'SQL', 'API', 'Docker', 'AWS'],
      'data scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy'],
      'product manager': ['Agile', 'Scrum', 'Analytics', 'User Research', 'Roadmapping', 'Stakeholder Management'],
      'designer': ['Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'User Research', 'Design Systems']
    };
    
    if (!targetRole) return [];
    
    const roleKey = Object.keys(roleSkillMap).find(key => 
      targetRole.toLowerCase().includes(key)
    );
    
    return roleKey ? roleSkillMap[roleKey] : [];
  }

  private calculateTotalExperience(experienceSection: string): number {
    // Simple heuristic to calculate years of experience
    const yearMatches = experienceSection.match(/(\d+)\s*(?:years?|yrs?)/gi);
    if (yearMatches) {
      const years = yearMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
      return Math.max(...years);
    }
    
    // Count job positions as rough estimate
    const jobCount = (experienceSection.match(/\b(?:at|@)\s+[A-Z]/g) || []).length;
    return Math.min(jobCount * 2, 15); // Assume 2 years per job, max 15 years
  }

  private analyzeCareerProgression(experiences: any[]): string {
    if (experiences.length < 2) return 'Limited experience to assess progression';
    
    const titles = experiences.map(exp => exp.title?.toLowerCase() || '');
    const hasProgression = titles.some(title => 
      title.includes('senior') || title.includes('lead') || title.includes('manager')
    );
    
    return hasProgression ? 'Shows clear career progression' : 'Consider highlighting growth and advancement';
  }

  private generateExperienceImprovements(experiences: any[], quantifiedAchievements: string[]): string[] {
    const improvements = [];
    
    if (quantifiedAchievements.length < 3) {
      improvements.push('Add more quantified achievements with specific numbers');
    }
    
    if (experiences.length > 0 && experiences[0].achievements?.length < 3) {
      improvements.push('Include more bullet points highlighting your accomplishments');
    }
    
    improvements.push('Use strong action verbs to start each bullet point');
    improvements.push('Focus on results and impact rather than just responsibilities');
    
    return improvements;
  }

  private extractRelevantKeywords(targetRole?: string): string[] {
    if (!targetRole) return [];
    
    const commonKeywords = ['experience', 'skills', 'team', 'project', 'development', 'management'];
    const roleSpecificKeywords = this.getRoleKeywords(targetRole);
    
    return [...commonKeywords, ...roleSpecificKeywords];
  }

  private getRoleKeywords(targetRole: string): string[] {
    const roleKeywordMap: { [key: string]: string[] } = {
      'software engineer': ['programming', 'coding', 'development', 'software', 'technical'],
      'product manager': ['product', 'strategy', 'roadmap', 'stakeholder', 'analytics'],
      'data scientist': ['data', 'analysis', 'machine learning', 'statistics', 'modeling'],
      'designer': ['design', 'user experience', 'visual', 'creative', 'prototype'],
      'marketing': ['marketing', 'campaign', 'brand', 'digital', 'analytics']
    };
    
    const roleKey = Object.keys(roleKeywordMap).find(key => 
      targetRole.toLowerCase().includes(key)
    );
    
    return roleKey ? roleKeywordMap[roleKey] : [];
  }

  private assessATSFormatting(text: string): number {
    let score = 100;
    
    // Check for ATS-unfriendly elements
    if (text.includes('│') || text.includes('┌') || text.includes('└')) score -= 20; // Tables/boxes
    if (text.includes('•') && text.split('•').length > 20) score -= 10; // Too many bullets
    if (text.length < 500) score -= 15; // Too short
    
    return Math.max(0, score);
  }

  private assessATSReadability(text: string): number {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    
    let score = 100;
    if (avgLineLength > 100) score -= 10;
    if (avgLineLength < 20) score -= 15;
    
    return Math.max(0, score);
  }

  private generateATSRecommendations(keywordMatch: number, formatting: number, readability: number): string[] {
    const recommendations = [];
    
    if (keywordMatch < 70) {
      recommendations.push('Add more relevant keywords from the job description');
    }
    if (formatting < 80) {
      recommendations.push('Simplify formatting and avoid complex layouts');
    }
    if (readability < 80) {
      recommendations.push('Improve text structure and line length consistency');
    }
    
    return recommendations;
  }

  private assessStructure(text: string): string {
    const sections = ['contact', 'summary', 'experience', 'education', 'skills'];
    const foundSections = sections.filter(section => 
      text.toLowerCase().includes(section)
    );
    
    if (foundSections.length >= 4) return 'Well-structured';
    if (foundSections.length >= 2) return 'Adequately structured';
    return 'Needs better structure';
  }

  private assessConsistency(lines: string[]): number {
    // Check for consistent formatting patterns
    const bulletPoints = lines.filter(line => /^\s*[•·▪▫◦‣⁃*\-]\s+/.test(line));
    const dates = lines.filter(line => /\b\d{4}\b/.test(line));
    
    let score = 80;
    if (bulletPoints.length > 0 && bulletPoints.length < lines.length * 0.1) score += 10;
    if (dates.length > 2) score += 10;
    
    return Math.min(100, score);
  }

  private assessVisualAppeal(text: string, fileType: string): number {
    let score = 70; // Base score
    
    if (fileType === 'pdf') score += 10; // PDFs generally look better
    if (text.includes('\n\n')) score += 5; // Good spacing
    if (text.length > 1000 && text.length < 2000) score += 10; // Good length
    
    return Math.min(100, score);
  }

  private assessLength(text: string): string {
    const wordCount = text.trim().split(/\s+/).length;
    
    if (wordCount < 300) return 'Too short - add more detail';
    if (wordCount > 800) return 'Too long - consider condensing';
    return 'Appropriate length';
  }

  private analyzeSpacing(lines: string[]): string {
    const emptyLines = lines.filter(line => line.trim().length === 0).length;
    const ratio = emptyLines / lines.length;
    
    if (ratio > 0.3) return 'Too much white space';
    if (ratio < 0.1) return 'Needs more spacing between sections';
    return 'Good spacing balance';
  }

  private scoreSectionContent(sectionName: string, content: string): number {
    const wordCount = content.trim().split(/\s+/).length;
    let score = 70; // Base score
    
    switch (sectionName.toLowerCase()) {
      case 'summary':
        if (wordCount >= 50 && wordCount <= 150) score += 20;
        if (content.includes('experienced') || content.includes('skilled')) score += 10;
        break;
      case 'experience':
        if (wordCount >= 100) score += 15;
        if (content.includes('achieved') || content.includes('improved')) score += 15;
        break;
      case 'skills':
        const skillCount = content.split(/[,\n]/).length;
        if (skillCount >= 5 && skillCount <= 15) score += 20;
        break;
      case 'education':
        if (content.includes('degree') || content.includes('university')) score += 15;
        break;
    }
    
    return Math.min(100, score);
  }

  private identifySectionStrengths(_sectionName: string, content: string): string[] {
    const strengths = [];
    
    if (content.length > 100) strengths.push('Comprehensive content');
    if (content.includes('achieved') || content.includes('improved')) {
      strengths.push('Includes achievement-focused language');
    }
    if (/\d+/.test(content)) strengths.push('Contains quantifiable metrics');
    
    return strengths;
  }

  private identifySectionWeaknesses(_sectionName: string, content: string): string[] {
    const weaknesses = [];
    
    if (content.length < 50) weaknesses.push('Too brief, needs more detail');
    if (!content.includes('.')) weaknesses.push('Lacks proper sentence structure');
    if (!/[A-Z]/.test(content)) weaknesses.push('Missing capitalization');
    
    return weaknesses;
  }

  private generateSectionSuggestions(sectionName: string, _content: string): string[] {
    const suggestions = [];
    
    switch (sectionName.toLowerCase()) {
      case 'summary':
        suggestions.push('Include your years of experience and key skills');
        suggestions.push('Mention your career goals and value proposition');
        break;
      case 'experience':
        suggestions.push('Start each bullet point with a strong action verb');
        suggestions.push('Quantify your achievements with specific numbers');
        break;
      case 'skills':
        suggestions.push('Organize skills by category (technical, soft skills)');
        suggestions.push('Include skill proficiency levels where relevant');
        break;
    }
    
    return suggestions;
  }

  private calculateKeywordDensity(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return (uniqueWords.size / words.length) * 100;
  }

  private calculateIndustryRelevance(text: string, industryKeywords: string[]): number {
    const foundKeywords = industryKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return industryKeywords.length > 0 ? 
      (foundKeywords.length / industryKeywords.length) * 100 : 0;
  }

  private getIndustryKeywords(industry?: string): string[] {
    const industryKeywordMap: { [key: string]: string[] } = {
      'technology': ['software', 'development', 'programming', 'technical', 'digital', 'innovation'],
      'healthcare': ['patient', 'medical', 'clinical', 'healthcare', 'treatment', 'diagnosis'],
      'finance': ['financial', 'investment', 'banking', 'analysis', 'risk', 'portfolio'],
      'marketing': ['campaign', 'brand', 'digital marketing', 'analytics', 'customer', 'engagement'],
      'education': ['teaching', 'curriculum', 'student', 'learning', 'educational', 'instruction']
    };
    
    return industry ? (industryKeywordMap[industry.toLowerCase()] || []) : [];
  }

  private generateCompetitorAnalysis(targetRole?: string, targetIndustry?: string): string {
    return `For ${targetRole || 'your target role'} in ${targetIndustry || 'the industry'}, ` +
           'focus on highlighting relevant experience and skills that differentiate you from other candidates.';
  }

  private getMarketTrends(industry?: string): string[] {
    const trendMap: { [key: string]: string[] } = {
      'technology': ['AI/ML adoption', 'Cloud migration', 'Remote work tools', 'Cybersecurity focus'],
      'healthcare': ['Telemedicine growth', 'Digital health records', 'Personalized medicine',   'AI diagnostics'],
      'finance': ['Fintech innovation', 'Cryptocurrency adoption', 'Regulatory compliance', 'Digital banking'],
      'marketing': ['Influencer marketing', 'Video content', 'Personalization', 'Privacy-first advertising']
    };
    
    return industry ? (trendMap[industry.toLowerCase()] || ['Digital transformation', 'Remote collaboration']) : 
           ['Digital transformation', 'Remote collaboration'];
  }

  private calculateSkillsScore(skillsAnalysis: any): number {
    const relevantSkills = skillsAnalysis.identifiedSkills.filter((skill: any) => 
      skill.relevance === 'high'
    ).length;
    
    const totalSkills = skillsAnalysis.identifiedSkills.length;
    const gapPenalty = skill sAnalysis.skillsGap.length * 5;
    
    let score = 70;
    if (totalSkills >= 10) score += 15;
    if (relevantSkills >= 5) score += 15;
    score -= gapPenalty;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateExperienceScore(experience Analysis: any): number {
    let score = 60;
    
    if (experienceAnalysis.totalYears >= 2) score += 15;
    if (experienceAnalysis.totalYears >= 5) score += 10;
    if (experienceAnalysis.quantifiedAchievements >= 3) score += 15;
    if (experienceAnalysis.actionVerbsUsed.length >=  5) score += 10;
    
    return Math.min(100, score);
  }

  private calculateFormattingScore(formattingAnalysis: any): number {
    let score = 70;
    
    if (formattingAnalysis.structure === 'Well-structured') score += 15;
    if (formattingAnalysis.consistency >= 80) score += 10;
    if (formattingAnalysis.visualAppeal >= 80) score += 5;
    
    return Math.min(100, score);
  }
}

export default new ResumeAnalyzerService();