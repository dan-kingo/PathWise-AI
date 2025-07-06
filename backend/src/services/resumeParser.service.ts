import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

interface ParsedResume {
  text: string;
  sections: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
    other?: string;
  };
  metadata: {
    wordCount: number;
    pageCount?: number;
    hasFormatting: boolean;
  };
}

class ResumeParserService {
  async parseResume(filePath: string, fileType: string): Promise<ParsedResume> {
    let text = '';
    let metadata: any = {};

    try {
      switch (fileType.toLowerCase()) {
        case 'pdf':
          const pdfData = await this.parsePDF(filePath);
          text = pdfData.text;
          metadata = {
            wordCount: this.countWords(text),
            pageCount: pdfData.numpages,
            hasFormatting: this.detectFormatting(text)
          };
          break;

        case 'doc':
        case 'docx':
          const docData = await this.parseDocx(filePath);
          text = docData.text;
          metadata = {
            wordCount: this.countWords(text),
            hasFormatting: this.detectFormatting(text)
          };
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      const sections = this.extractSections(text);

      return {
        text: text.trim(),
        sections,
        metadata
      };
    } catch (error) {
      console.error('Resume parsing error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to parse resume: ${error.message}`);
      } else {
        throw new Error('Failed to parse resume: Unknown error');
      }
    }
  }

  private async parsePDF(filePath: string): Promise<any> {
    const dataBuffer = fs.readFileSync(filePath);
    return await pdf(dataBuffer);
  }

  private async parseDocx(filePath: string): Promise<any> {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
      messages: result.messages
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectFormatting(text: string): boolean {
    // Simple heuristic to detect if the resume has good formatting
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const shortLines = nonEmptyLines.filter(line => line.trim().length < 50);
    
    // If more than 30% of lines are short, likely has good formatting/structure
    return (shortLines.length / nonEmptyLines.length) > 0.3;
  }

  private extractSections(text: string): ParsedResume['sections'] {
    const sections: ParsedResume['sections'] = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Common section headers and their variations
    const sectionPatterns = {
      contact: /^(contact|personal\s+information|contact\s+information)/i,
      summary: /^(summary|profile|objective|professional\s+summary|career\s+objective|about)/i,
      experience: /^(experience|work\s+experience|professional\s+experience|employment|career\s+history)/i,
      education: /^(education|academic\s+background|qualifications|academic\s+qualifications)/i,
      skills: /^(skills|technical\s+skills|core\s+competencies|expertise|proficiencies)/i,
      projects: /^(projects|personal\s+projects|key\s+projects|notable\s+projects)/i,
      certifications: /^(certifications|certificates|licenses|credentials)/i
    };

    let currentSection = 'other';
    let sectionContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let foundSection = false;

      // Check if this line is a section header
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          // Save previous section content
          if (sectionContent.length > 0) {
            sections[currentSection as keyof ParsedResume['sections']] = sectionContent.join('\n');
          }
          
          currentSection = sectionName;
          sectionContent = [];
          foundSection = true;
          break;
        }
      }

      if (!foundSection) {
        sectionContent.push(line);
      }
    }

    // Save the last section
    if (sectionContent.length > 0) {
      sections[currentSection as keyof ParsedResume['sections']] = sectionContent.join('\n');
    }

    // Extract contact information from the beginning if not found
    if (!sections.contact && lines.length > 0) {
      const contactLines = lines.slice(0, 5).filter(line => 
        this.isContactInfo(line)
      );
      if (contactLines.length > 0) {
        sections.contact = contactLines.join('\n');
      }
    }

    return sections;
  }

  private isContactInfo(line: string): boolean {
    const contactPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /\b(?:linkedin\.com|github\.com|twitter\.com)\b/i, // Social profiles
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/i // Address
    ];

    return contactPatterns.some(pattern => pattern.test(line));
  }

  extractSkills(text: string): string[] {
    const skillPatterns = [
      // Programming languages
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB|SQL|HTML|CSS)\b/gi,
      
      // Frameworks and libraries
      /\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|Rails|jQuery|Bootstrap|Tailwind)\b/gi,
      
      // Databases
      /\b(?:MySQL|PostgreSQL|MongoDB|Redis|SQLite|Oracle|SQL Server|DynamoDB|Cassandra|Neo4j)\b/gi,
      
      // Cloud and DevOps
      /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitLab|GitHub|Terraform|Ansible|Chef|Puppet)\b/gi,
      
      // Tools and Software
      /\b(?:Git|Jira|Confluence|Slack|Figma|Adobe|Photoshop|Illustrator|Sketch|InVision|Tableau|Power BI)\b/gi,
      
      // Methodologies
      /\b(?:Agile|Scrum|Kanban|DevOps|CI\/CD|TDD|BDD|Microservices|REST|GraphQL|API)\b/gi
    ];

    const skills = new Set<string>();
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => skills.add(match));
      }
    });

    return Array.from(skills);
  }

  extractExperience(experienceSection: string): any[] {
    if (!experienceSection) return [];

    const experiences = [];
    const lines = experienceSection.split('\n').filter(line => line.trim().length > 0);
    
    let currentExperience: any = null;
    
    for (const line of lines) {
      // Check if line looks like a job title/company
      if (this.isJobTitle(line)) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        currentExperience = {
          title: line,
          description: [],
          achievements: []
        };
      } else if (currentExperience) {
        // Check if it's an achievement (starts with bullet point or action verb)
        if (this.isAchievement(line)) {
          currentExperience.achievements.push(line);
        } else {
          currentExperience.description.push(line);
        }
      }
    }

    if (currentExperience) {
      experiences.push(currentExperience);
    }

    return experiences;
  }

  private isJobTitle(line: string): boolean {
    // Heuristics to identify job titles
    const jobTitlePatterns = [
      /\b(?:Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior)\b/i,
      /\b(?:at|@)\s+[A-Z][A-Za-z\s&]+$/i, // "Position at Company"
      /^\s*[A-Z][A-Za-z\s]+(,|\s+\|\s+|\s+-\s+)[A-Z][A-Za-z\s&]+/i // "Position, Company" or "Position | Company"
    ];

    return jobTitlePatterns.some(pattern => pattern.test(line));
  }

  private isAchievement(line: string): boolean {
    const achievementPatterns = [
      /^\s*[•·▪▫◦‣⁃]\s+/, // Bullet points
      /^\s*[-*]\s+/, // Dash or asterisk bullets
      /^\s*\d+[\.)]\s+/, // Numbered lists
      /^(?:Achieved|Improved|Increased|Decreased|Reduced|Developed|Implemented|Led|Managed|Created|Built|Designed|Optimized)/i // Action verbs
    ];

    return achievementPatterns.some(pattern => pattern.test(line));
  }

  extractQuantifiedAchievements(text: string): string[] {
    const quantifiedPatterns = [
      /\b\d+%\b/g, // Percentages
      /\$[\d,]+(?:\.\d{2})?\b/g, // Dollar amounts
      /\b\d+(?:,\d{3})*\s+(?:users|customers|clients|employees|projects|hours|days|months|years)\b/gi,
      /\b(?:increased|decreased|improved|reduced|saved|generated|grew)\s+(?:by\s+)?\d+/gi
    ];

    const achievements: string[] = [];
    
    quantifiedPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        achievements.push(...matches);
      }
    });

    return achievements;
  }

  extractActionVerbs(text: string): string[] {
    const actionVerbs = [
      'achieved', 'administered', 'analyzed', 'built', 'collaborated', 'created', 'delivered',
      'developed', 'directed', 'established', 'executed', 'generated', 'implemented', 'improved',
      'increased', 'initiated', 'launched', 'led', 'managed', 'optimized', 'organized',
      'planned', 'produced', 'reduced', 'resolved', 'streamlined', 'supervised', 'trained'
    ];

    const foundVerbs = new Set<string>();
    const words = text.toLowerCase().split(/\s+/);
    
    actionVerbs.forEach(verb => {
      if (words.includes(verb) || words.includes(verb + 'd') || words.includes(verb + 'ed')) {
        foundVerbs.add(verb);
      }
    });

    return Array.from(foundVerbs);
  }
}

export default new ResumeParserService();