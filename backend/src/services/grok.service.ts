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
  private generateDynamicCareerPath(request: CareerPathRequest): CareerPath {
    const { targetRole, currentSkills, experienceLevel, timeframe, interests } = request;
    
    // Parse timeframe to get number of weeks
    const totalWeeks = this.parseTimeframeToWeeks(timeframe);
    
    // Determine difficulty based on experience level
    const difficulty = this.getDifficultyLevel(experienceLevel);
    
    // Generate role-specific content
    const roleData = this.getRoleSpecificData(targetRole);
    
    // Generate weekly plan based on the target role and timeframe
    const weeklyPlan = this.generateWeeklyPlan(targetRole, totalWeeks, currentSkills, interests);
    
    return {
      title: `${targetRole} Career Path`,
      description: `A comprehensive ${totalWeeks}-week program to become a proficient ${targetRole.toLowerCase()}. This path is tailored to your current skills and interests.`,
      duration: timeframe,
      difficulty,
      totalWeeks,
      prerequisites: this.generatePrerequisites(targetRole, experienceLevel),
      outcomes: this.generateOutcomes(targetRole),
      skillsToLearn: this.generateSkillsToLearn(targetRole, currentSkills),
      weeklyPlan,
      marketDemand: roleData.marketDemand,
      averageSalary: roleData.averageSalary,
      jobTitles: roleData.jobTitles
    };
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
    
    // Default to 8 weeks if can't parse
    return 8;
  }

  private getDifficultyLevel(experienceLevel: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    switch (experienceLevel.toLowerCase()) {
      case 'entry':
      case 'beginner':
        return 'Beginner';
      case 'junior':
      case 'mid':
        return 'Intermediate';
      case 'senior':
      case 'expert':
        return 'Advanced';
      default:
        return 'Intermediate';
    }
  }

  private getRoleSpecificData(targetRole: string) {
    const roleLower = targetRole.toLowerCase();
    
    // Frontend Developer
    if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
      return {
        marketDemand: "High demand with 22% growth expected over next 5 years",
        averageSalary: "$75,000 - $130,000",
        jobTitles: ["Frontend Developer", "React Developer", "UI Developer", "JavaScript Developer"]
      };
    }
    
    // Backend Developer
    if (roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('server')) {
      return {
        marketDemand: "Very high demand with 25% growth expected",
        averageSalary: "$80,000 - $140,000",
        jobTitles: ["Backend Developer", "API Developer", "Server Engineer", "Node.js Developer"]
      };
    }
    
    // Full Stack Developer
    if (roleLower.includes('full') || roleLower.includes('stack')) {
      return {
        marketDemand: "Extremely high demand with 30% growth expected",
        averageSalary: "$85,000 - $150,000",
        jobTitles: ["Full Stack Developer", "Software Engineer", "Web Developer", "Application Developer"]
      };
    }
    
    // Data Scientist
    if (roleLower.includes('data') || roleLower.includes('scientist') || roleLower.includes('analytics')) {
      return {
        marketDemand: "High demand with 35% growth expected",
        averageSalary: "$95,000 - $160,000",
        jobTitles: ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Research Scientist"]
      };
    }
    
    // UX/UI Designer
    if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui')) {
      return {
        marketDemand: "Strong demand with 18% growth expected",
        averageSalary: "$65,000 - $120,000",
        jobTitles: ["UX Designer", "UI Designer", "Product Designer", "Visual Designer"]
      };
    }
    
    // DevOps Engineer
    if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('infrastructure')) {
      return {
        marketDemand: "Very high demand with 28% growth expected",
        averageSalary: "$90,000 - $155,000",
        jobTitles: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer", "Infrastructure Engineer"]
      };
    }
    
    // Default for any other role
    return {
      marketDemand: "Good demand with steady growth expected",
      averageSalary: "$70,000 - $120,000",
      jobTitles: [targetRole, "Software Developer", "Technical Specialist"]
    };
  }

  private generatePrerequisites(targetRole: string, experienceLevel: string): string[] {
    const roleLower = targetRole.toLowerCase();
    const basePrereqs = ["Basic computer literacy", "Problem-solving mindset", "Willingness to learn"];
    
    if (experienceLevel === 'entry') {
      return basePrereqs;
    }
    
    if (roleLower.includes('frontend') || roleLower.includes('ui')) {
      return [...basePrereqs, "Basic HTML/CSS knowledge", "Understanding of web browsers"];
    }
    
    if (roleLower.includes('backend') || roleLower.includes('api')) {
      return [...basePrereqs, "Basic programming concepts", "Understanding of databases"];
    }
    
    if (roleLower.includes('data')) {
      return [...basePrereqs, "Basic mathematics/statistics", "Analytical thinking"];
    }
    
    if (roleLower.includes('design')) {
      return [...basePrereqs, "Creative mindset", "Basic design principles"];
    }
    
    return basePrereqs;
  }

  private generateOutcomes(targetRole: string): string[] {
    const roleLower = targetRole.toLowerCase();
    
    if (roleLower.includes('frontend') || roleLower.includes('ui')) {
      return [
        "Build responsive web applications",
        "Master modern JavaScript frameworks",
        "Create intuitive user interfaces",
        "Deploy production-ready applications",
        "Optimize web performance"
      ];
    }
    
    if (roleLower.includes('backend') || roleLower.includes('api')) {
      return [
        "Design and build APIs",
        "Manage databases effectively",
        "Implement security best practices",
        "Deploy scalable server applications",
        "Handle data processing and storage"
      ];
    }
    
    if (roleLower.includes('data')) {
      return [
        "Analyze complex datasets",
        "Build machine learning models",
        "Create data visualizations",
        "Extract actionable insights",
        "Present findings to stakeholders"
      ];
    }
    
    if (roleLower.includes('design')) {
      return [
        "Create user-centered designs",
        "Conduct user research",
        "Build interactive prototypes",
        "Design accessible interfaces",
        "Collaborate with development teams"
      ];
    }
    
    return [
      "Master core technical skills",
      "Build portfolio projects",
      "Understand industry best practices",
      "Develop problem-solving abilities",
      "Prepare for job interviews"
    ];
  }

  private generateSkillsToLearn(targetRole: string, currentSkills: string[]): string[] {
    const roleLower = targetRole.toLowerCase();
    let skillsToLearn: string[] = [];
    
    if (roleLower.includes('frontend') || roleLower.includes('ui')) {
      skillsToLearn = ["JavaScript", "React", "CSS", "HTML", "TypeScript", "Responsive Design", "Git", "Testing"];
    } else if (roleLower.includes('backend') || roleLower.includes('api')) {
      skillsToLearn = ["Node.js", "Python", "Databases", "API Design", "Authentication", "Cloud Services", "Docker", "Testing"];
    } else if (roleLower.includes('data')) {
      skillsToLearn = ["Python", "SQL", "Machine Learning", "Data Visualization", "Statistics", "Pandas", "NumPy", "Jupyter"];
    } else if (roleLower.includes('design')) {
      skillsToLearn = ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "Usability Testing"];
    } else {
      skillsToLearn = ["Programming", "Problem Solving", "Version Control", "Testing", "Documentation"];
    }
    
    // Filter out skills the user already has
    return skillsToLearn.filter(skill => 
      !currentSkills.some(currentSkill => 
        currentSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(currentSkill.toLowerCase())
      )
    );
  }

  private generateWeeklyPlan(targetRole: string, totalWeeks: number, currentSkills: string[], interests: string[]): WeeklyPlan[] {
    const roleLower = targetRole.toLowerCase();
    const weeklyPlan: WeeklyPlan[] = [];
    
    // Generate content based on role type
    if (roleLower.includes('frontend') || roleLower.includes('ui')) {
      return this.generateFrontendWeeklyPlan(totalWeeks);
    } else if (roleLower.includes('backend') || roleLower.includes('api')) {
      return this.generateBackendWeeklyPlan(totalWeeks);
    } else if (roleLower.includes('data')) {
      return this.generateDataScienceWeeklyPlan(totalWeeks);
    } else if (roleLower.includes('design')) {
      return this.generateDesignWeeklyPlan(totalWeeks);
    } else {
      return this.generateGenericWeeklyPlan(totalWeeks, targetRole);
    }
  }

  private generateFrontendWeeklyPlan(totalWeeks: number): WeeklyPlan[] {
    const baseWeeks = [
      {
        week: 1,
        title: "HTML & CSS Fundamentals",
        description: "Master the building blocks of web development",
        skills: ["HTML5", "CSS3", "Responsive Design"],
        resources: [
          {
            title: "HTML & CSS Crash Course",
            type: "course" as const,
            url: "https://www.freecodecamp.org/learn/responsive-web-design/",
            duration: "6 hours",
            description: "Complete guide to HTML and CSS fundamentals",
            source: "freeCodeCamp"
          },
          {
            title: "CSS Grid and Flexbox",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=css+grid+flexbox+tutorial",
            duration: "3 hours",
            description: "Modern CSS layout techniques",
            source: "YouTube"
          }
        ],
        milestones: ["Create semantic HTML structure", "Style with CSS", "Build responsive layouts"],
        projects: ["Personal Portfolio Landing Page"]
      },
      {
        week: 2,
        title: "JavaScript Essentials",
        description: "Learn the programming language of the web",
        skills: ["JavaScript", "DOM Manipulation", "ES6+"],
        resources: [
          {
            title: "JavaScript Fundamentals",
            type: "course" as const,
            url: "https://javascript.info/",
            duration: "8 hours",
            description: "Comprehensive JavaScript tutorial",
            source: "JavaScript.info"
          },
          {
            title: "DOM Manipulation Guide",
            type: "article" as const,
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
            duration: "2 hours",
            description: "Learn to interact with web pages",
            source: "MDN Web Docs"
          }
        ],
        milestones: ["Understand JavaScript syntax", "Manipulate DOM elements", "Handle events"],
        projects: ["Interactive To-Do List"]
      },
      {
        week: 3,
        title: "React Fundamentals",
        description: "Introduction to the most popular frontend framework",
        skills: ["React", "JSX", "Components", "Props"],
        resources: [
          {
            title: "React Official Tutorial",
            type: "course" as const,
            url: "https://react.dev/learn",
            duration: "5 hours",
            description: "Official React documentation and tutorial",
            source: "React.dev"
          },
          {
            title: "React Components Deep Dive",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=react+components+tutorial",
            duration: "4 hours",
            description: "Understanding React component architecture",
            source: "YouTube"
          }
        ],
        milestones: ["Create React components", "Manage component state", "Handle props"],
        projects: ["React Weather App"]
      }
    ];

    // Extend or trim based on total weeks
    return this.adjustWeeklyPlan(baseWeeks, totalWeeks, "frontend");
  }

  private generateBackendWeeklyPlan(totalWeeks: number): WeeklyPlan[] {
    const baseWeeks = [
      {
        week: 1,
        title: "Server-Side Programming Basics",
        description: "Introduction to backend development concepts",
        skills: ["Node.js", "Express.js", "HTTP"],
        resources: [
          {
            title: "Node.js Crash Course",
            type: "course" as const,
            url: "https://nodejs.org/en/docs/guides/getting-started-guide/",
            duration: "4 hours",
            description: "Getting started with Node.js",
            source: "Node.js Official"
          },
          {
            title: "Express.js Tutorial",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=express+js+tutorial",
            duration: "3 hours",
            description: "Building web servers with Express",
            source: "YouTube"
          }
        ],
        milestones: ["Set up Node.js environment", "Create basic server", "Handle HTTP requests"],
        projects: ["Simple REST API"]
      },
      {
        week: 2,
        title: "Database Integration",
        description: "Learn to work with databases",
        skills: ["MongoDB", "SQL", "Database Design"],
        resources: [
          {
            title: "Database Design Fundamentals",
            type: "course" as const,
            url: "https://www.freecodecamp.org/learn/relational-database/",
            duration: "6 hours",
            description: "Understanding database concepts",
            source: "freeCodeCamp"
          },
          {
            title: "MongoDB Tutorial",
            type: "article" as const,
            url: "https://docs.mongodb.com/manual/tutorial/",
            duration: "4 hours",
            description: "Working with MongoDB",
            source: "MongoDB Docs"
          }
        ],
        milestones: ["Design database schema", "Perform CRUD operations", "Connect database to API"],
        projects: ["Blog API with Database"]
      }
    ];

    return this.adjustWeeklyPlan(baseWeeks, totalWeeks, "backend");
  }

  private generateDataScienceWeeklyPlan(totalWeeks: number): WeeklyPlan[] {
    const baseWeeks = [
      {
        week: 1,
        title: "Python for Data Science",
        description: "Master Python programming for data analysis",
        skills: ["Python", "Pandas", "NumPy"],
        resources: [
          {
            title: "Python Data Science Handbook",
            type: "course" as const,
            url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
            duration: "8 hours",
            description: "Comprehensive Python for data science",
            source: "GitHub"
          },
          {
            title: "Pandas Tutorial",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=pandas+tutorial",
            duration: "4 hours",
            description: "Data manipulation with Pandas",
            source: "YouTube"
          }
        ],
        milestones: ["Set up Python environment", "Load and clean data", "Basic data analysis"],
        projects: ["Data Cleaning Project"]
      },
      {
        week: 2,
        title: "Data Visualization",
        description: "Create compelling visualizations",
        skills: ["Matplotlib", "Seaborn", "Data Storytelling"],
        resources: [
          {
            title: "Data Visualization with Python",
            type: "course" as const,
            url: "https://matplotlib.org/stable/tutorials/index.html",
            duration: "5 hours",
            description: "Creating charts and graphs",
            source: "Matplotlib"
          }
        ],
        milestones: ["Create basic plots", "Design interactive visualizations", "Tell stories with data"],
        projects: ["Sales Data Dashboard"]
      }
    ];

    return this.adjustWeeklyPlan(baseWeeks, totalWeeks, "data");
  }

  private generateDesignWeeklyPlan(totalWeeks: number): WeeklyPlan[] {
    const baseWeeks = [
      {
        week: 1,
        title: "Design Fundamentals",
        description: "Learn core design principles and theory",
        skills: ["Design Principles", "Color Theory", "Typography"],
        resources: [
          {
            title: "Design Principles Guide",
            type: "article" as const,
            url: "https://www.interaction-design.org/literature/topics/design-principles",
            duration: "3 hours",
            description: "Understanding fundamental design principles",
            source: "Interaction Design Foundation"
          },
          {
            title: "Color Theory for Designers",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=color+theory+design",
            duration: "2 hours",
            description: "Mastering color in design",
            source: "YouTube"
          }
        ],
        milestones: ["Understand design principles", "Create color palettes", "Choose appropriate typography"],
        projects: ["Brand Identity Design"]
      },
      {
        week: 2,
        title: "Design Tools Mastery",
        description: "Master industry-standard design tools",
        skills: ["Figma", "Prototyping", "Design Systems"],
        resources: [
          {
            title: "Figma Complete Course",
            type: "course" as const,
            url: "https://www.figma.com/resources/learn-design/",
            duration: "6 hours",
            description: "Complete Figma tutorial",
            source: "Figma"
          }
        ],
        milestones: ["Create designs in Figma", "Build interactive prototypes", "Develop design systems"],
        projects: ["Mobile App Design"]
      }
    ];

    return this.adjustWeeklyPlan(baseWeeks, totalWeeks, "design");
  }

  private generateGenericWeeklyPlan(totalWeeks: number, targetRole: string): WeeklyPlan[] {
    const baseWeeks = [
      {
        week: 1,
        title: "Fundamentals & Setup",
        description: `Introduction to ${targetRole} concepts and environment setup`,
        skills: ["Basic Concepts", "Environment Setup", "Tools"],
        resources: [
          {
            title: `${targetRole} Getting Started Guide`,
            type: "course" as const,
            url: "https://www.freecodecamp.org/",
            duration: "4 hours",
            description: `Introduction to ${targetRole}`,
            source: "freeCodeCamp"
          },
          {
            title: `${targetRole} Best Practices`,
            type: "article" as const,
            url: "https://developer.mozilla.org/en-US/docs/Learn",
            duration: "2 hours",
            description: "Industry best practices and standards",
            source: "MDN Web Docs"
          }
        ],
        milestones: ["Complete environment setup", "Understand basic concepts", "Create first project"],
        projects: [`Basic ${targetRole} Project`]
      },
      {
        week: 2,
        title: "Core Skills Development",
        description: "Building essential skills and knowledge",
        skills: ["Core Technologies", "Problem Solving", "Best Practices"],
        resources: [
          {
            title: "Advanced Concepts",
            type: "video" as const,
            url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(targetRole),
            duration: "5 hours",
            description: "Deep dive into advanced topics",
            source: "YouTube"
          }
        ],
        milestones: ["Master core concepts", "Build intermediate projects", "Apply best practices"],
        projects: [`Intermediate ${targetRole} Application`]
      }
    ];

    return this.adjustWeeklyPlan(baseWeeks, totalWeeks, "generic");
  }

  private adjustWeeklyPlan(baseWeeks: WeeklyPlan[], totalWeeks: number, type: string): WeeklyPlan[] {
    if (totalWeeks <= baseWeeks.length) {
      return baseWeeks.slice(0, totalWeeks);
    }

    // Extend the plan for longer timeframes
    const extendedPlan = [...baseWeeks];
    
    for (let week = baseWeeks.length + 1; week <= totalWeeks; week++) {
      let weekData: WeeklyPlan;
      
      if (type === "frontend") {
        weekData = this.generateAdvancedFrontendWeek(week);
      } else if (type === "backend") {
        weekData = this.generateAdvancedBackendWeek(week);
      } else if (type === "data") {
        weekData = this.generateAdvancedDataWeek(week);
      } else if (type === "design") {
        weekData = this.generateAdvancedDesignWeek(week);
      } else {
        weekData = this.generateAdvancedGenericWeek(week);
      }
      
      extendedPlan.push(weekData);
    }

    return extendedPlan;
  }

  private generateAdvancedFrontendWeek(week: number): WeeklyPlan {
    const topics = [
      { title: "State Management", skills: ["Redux", "Context API", "State Patterns"] },
      { title: "Testing & Quality", skills: ["Jest", "React Testing Library", "E2E Testing"] },
      { title: "Performance Optimization", skills: ["Code Splitting", "Lazy Loading", "Performance Metrics"] },
      { title: "Advanced React Patterns", skills: ["Hooks", "HOCs", "Render Props"] },
      { title: "Build Tools & Deployment", skills: ["Webpack", "Vite", "CI/CD"] },
      { title: "TypeScript Integration", skills: ["TypeScript", "Type Safety", "Advanced Types"] },
      { title: "Mobile Development", skills: ["React Native", "Progressive Web Apps"] },
      { title: "Portfolio & Job Prep", skills: ["Portfolio Development", "Interview Prep"] }
    ];

    const topicIndex = (week - 3) % topics.length;
    const topic = topics[topicIndex];

    return {
      week,
      title: topic.title,
      description: `Advanced frontend development: ${topic.title.toLowerCase()}`,
      skills: topic.skills,
      resources: [
        {
          title: `${topic.title} Masterclass`,
          type: "course",
          url: "https://www.freecodecamp.org/",
          duration: "6 hours",
          description: `Deep dive into ${topic.title.toLowerCase()}`,
          source: "freeCodeCamp"
        },
        {
          title: `${topic.title} Best Practices`,
          type: "article",
          url: "https://developer.mozilla.org/en-US/docs/Learn",
          duration: "2 hours",
          description: `Industry best practices for ${topic.title.toLowerCase()}`,
          source: "MDN Web Docs"
        }
      ],
      milestones: [`Master ${topic.title.toLowerCase()}`, "Build advanced features", "Optimize performance"],
      projects: [`Advanced ${topic.title} Project`]
    };
  }

  private generateAdvancedBackendWeek(week: number): WeeklyPlan {
    const topics = [
      { title: "Authentication & Security", skills: ["JWT", "OAuth", "Security Best Practices"] },
      { title: "API Design & Documentation", skills: ["REST", "GraphQL", "API Documentation"] },
      { title: "Database Optimization", skills: ["Indexing", "Query Optimization", "Caching"] },
      { title: "Microservices Architecture", skills: ["Service Design", "Communication", "Deployment"] },
      { title: "Testing & Quality Assurance", skills: ["Unit Testing", "Integration Testing", "TDD"] },
      { title: "DevOps & Deployment", skills: ["Docker", "CI/CD", "Cloud Deployment"] },
      { title: "Performance & Scaling", skills: ["Load Balancing", "Caching", "Monitoring"] },
      { title: "Portfolio & Job Preparation", skills: ["Portfolio Projects", "Interview Skills"] }
    ];

    const topicIndex = (week - 3) % topics.length;
    const topic = topics[topicIndex];

    return {
      week,
      title: topic.title,
      description: `Advanced backend development: ${topic.title.toLowerCase()}`,
      skills: topic.skills,
      resources: [
        {
          title: `${topic.title} Guide`,
          type: "course",
          url: "https://nodejs.org/en/docs/",
          duration: "5 hours",
          description: `Comprehensive guide to ${topic.title.toLowerCase()}`,
          source: "Node.js Docs"
        }
      ],
      milestones: [`Implement ${topic.title.toLowerCase()}`, "Build scalable solutions", "Optimize performance"],
      projects: [`${topic.title} Implementation Project`]
    };
  }

  private generateAdvancedDataWeek(week: number): WeeklyPlan {
    const topics = [
      { title: "Machine Learning Basics", skills: ["Scikit-learn", "Model Training", "Evaluation"] },
      { title: "Statistical Analysis", skills: ["Hypothesis Testing", "Statistical Models", "A/B Testing"] },
      { title: "Advanced Visualization", skills: ["Interactive Charts", "Dashboards", "Storytelling"] },
      { title: "Big Data Processing", skills: ["Spark", "Distributed Computing", "Data Pipelines"] },
      { title: "Deep Learning", skills: ["Neural Networks", "TensorFlow", "PyTorch"] },
      { title: "Data Engineering", skills: ["ETL Processes", "Data Warehousing", "Pipeline Design"] },
      { title: "Business Intelligence", skills: ["KPI Development", "Reporting", "Business Metrics"] },
      { title: "Portfolio & Career Prep", skills: ["Project Portfolio", "Data Science Interview Prep"] }
    ];

    const topicIndex = (week - 3) % topics.length;
    const topic = topics[topicIndex];

    return {
      week,
      title: topic.title,
      description: `Advanced data science: ${topic.title.toLowerCase()}`,
      skills: topic.skills,
      resources: [
        {
          title: `${topic.title} Course`,
          type: "course",
          url: "https://www.kaggle.com/learn",
          duration: "6 hours",
          description: `Learn ${topic.title.toLowerCase()} techniques`,
          source: "Kaggle Learn"
        }
      ],
      milestones: [`Master ${topic.title.toLowerCase()}`, "Apply to real datasets", "Build predictive models"],
      projects: [`${topic.title} Analysis Project`]
    };
  }

  private generateAdvancedDesignWeek(week: number): WeeklyPlan {
    const topics = [
      { title: "User Research Methods", skills: ["User Interviews", "Surveys", "Usability Testing"] },
      { title: "Information Architecture", skills: ["Site Mapping", "User Flows", "Navigation Design"] },
      { title: "Interaction Design", skills: ["Micro-interactions", "Animation", "Gesture Design"] },
      { title: "Design Systems", skills: ["Component Libraries", "Style Guides", "Design Tokens"] },
      { title: "Accessibility Design", skills: ["WCAG Guidelines", "Inclusive Design", "Screen Readers"] },
      { title: "Mobile Design", skills: ["Responsive Design", "Mobile Patterns", "Touch Interfaces"] },
      { title: "Design Leadership", skills: ["Design Strategy", "Team Collaboration", "Stakeholder Management"] },
      { title: "Portfolio & Career", skills: ["Case Studies", "Design Portfolio", "Interview Preparation"] }
    ];

    const topicIndex = (week - 3) % topics.length;
    const topic = topics[topicIndex];

    return {
      week,
      title: topic.title,
      description: `Advanced UX/UI design: ${topic.title.toLowerCase()}`,
      skills: topic.skills,
      resources: [
        {
          title: `${topic.title} Masterclass`,
          type: "course",
          url: "https://www.interaction-design.org/",
          duration: "5 hours",
          description: `Advanced ${topic.title.toLowerCase()} techniques`,
          source: "IxDF"
        }
      ],
      milestones: [`Master ${topic.title.toLowerCase()}`, "Apply to real projects", "Build design expertise"],
      projects: [`${topic.title} Design Challenge`]
    };
  }

  private generateAdvancedGenericWeek(week: number): WeeklyPlan {
    return {
      week,
      title: `Advanced Skills - Week ${week}`,
      description: "Continuing skill development and specialization",
      skills: ["Advanced Concepts", "Specialization", "Best Practices"],
      resources: [
        {
          title: "Advanced Tutorial",
          type: "course",
          url: "https://www.freecodecamp.org/",
          duration: "5 hours",
          description: "Advanced concepts and techniques",
          source: "freeCodeCamp"
        }
      ],
      milestones: ["Master advanced concepts", "Build complex projects", "Prepare for specialization"],
      projects: [`Week ${week} Advanced Project`]
    };
  }

  async generateCareerPath(request: CareerPathRequest): Promise<CareerPath> {
    try {
      // Generate dynamic career path based on user input
      const careerPath = this.generateDynamicCareerPath(request);
      
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
      throw err;
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

  // Remove skill gap analysis implementation as requested
  async analyzeSkillGap(currentSkills: string[], targetRole: string): Promise<any> {
    throw new Error("Skill gap analysis is not implemented yet. This feature will be available soon.");
  }
}

export default new GrokService();