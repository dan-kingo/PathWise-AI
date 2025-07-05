import { create } from 'zustand';

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  roadmap: {
    week: number;
    title: string;
    description: string;
    resources: {
      title: string;
      type: 'article' | 'video' | 'course' | 'practice';
      url: string;
      duration?: string;
    }[];
    milestones: string[];
  }[];
  prerequisites: string[];
  outcomes: string[];
}

interface CareerState {
  availablePaths: CareerPath[];
  recommendedPaths: CareerPath[];
  selectedPath: CareerPath | null;
  loading: boolean;
  setAvailablePaths: (paths: CareerPath[]) => void;
  setRecommendedPaths: (paths: CareerPath[]) => void;
  setSelectedPath: (path: CareerPath | null) => void;
  setLoading: (loading: boolean) => void;
  generateRecommendations: (userProfile: any) => void;
}

export const useCareerStore = create<CareerState>((set, get) => ({
  availablePaths: [],
  recommendedPaths: [],
  selectedPath: null,
  loading: false,

  setAvailablePaths: (paths) => set({ availablePaths: paths }),
  setRecommendedPaths: (paths) => set({ recommendedPaths: paths }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setLoading: (loading) => set({ loading }),

  generateRecommendations: (userProfile) => {
    const { availablePaths } = get();
    
    if (!userProfile || !availablePaths.length) {
      set({ recommendedPaths: [] });
      return;
    }
    
    // Simple recommendation algorithm based on user profile
    const recommended = availablePaths.filter(path => {
      const targetRole = userProfile?.careerGoals?.targetRole?.toLowerCase() || '';
      const userSkills = userProfile?.skills || [];
      const userInterests = userProfile?.interests || [];
      
      // Check if path matches target role
      const roleMatch = path.title.toLowerCase().includes(targetRole) ||
                       path.description.toLowerCase().includes(targetRole);
      
      // Check skill overlap
      const skillOverlap = path.skills.some(skill => 
        userSkills.some((userSkill: string) => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      // Check interest overlap
      const interestOverlap = userInterests.some((interest: string) =>
        path.title.toLowerCase().includes(interest.toLowerCase()) ||
        path.description.toLowerCase().includes(interest.toLowerCase())
      );
      
      return roleMatch || skillOverlap || interestOverlap;
    });
    
    set({ recommendedPaths: recommended.slice(0, 3) }); // Top 3 recommendations
  },
}));

// Mock career paths data
export const mockCareerPaths: CareerPath[] = [
  {
    id: '1',
    title: 'UI/UX Designer',
    description: 'Learn to create beautiful and user-friendly interfaces',
    duration: '4 weeks',
    difficulty: 'Beginner',
    skills: ['Design Thinking', 'Figma', 'Prototyping', 'User Research'],
    prerequisites: ['Basic computer skills', 'Creative mindset'],
    outcomes: ['Create professional UI designs', 'Conduct user research', 'Build interactive prototypes'],
    roadmap: [
      {
        week: 1,
        title: 'Design Fundamentals',
        description: 'Learn the basics of design principles and color theory',
        resources: [
          {
            title: 'Design Principles for Beginners',
            type: 'article',
            url: '#',
            duration: '30 min'
          },
          {
            title: 'Color Theory Masterclass',
            type: 'video',
            url: '#',
            duration: '2 hours'
          },
          {
            title: 'Typography Basics',
            type: 'course',
            url: '#',
            duration: '1 hour'
          }
        ],
        milestones: ['Understand design principles', 'Create color palettes', 'Choose appropriate fonts']
      },
      {
        week: 2,
        title: 'Figma Mastery',
        description: 'Master the most popular design tool in the industry',
        resources: [
          {
            title: 'Figma for Beginners',
            type: 'course',
            url: '#',
            duration: '3 hours'
          },
          {
            title: 'Advanced Figma Techniques',
            type: 'video',
            url: '#',
            duration: '1.5 hours'
          },
          {
            title: 'Figma Component System',
            type: 'practice',
            url: '#',
            duration: '2 hours'
          }
        ],
        milestones: ['Create basic designs in Figma', 'Use components and variants', 'Build design systems']
      },
      {
        week: 3,
        title: 'User Research & Testing',
        description: 'Learn to understand your users and validate designs',
        resources: [
          {
            title: 'User Research Methods',
            type: 'article',
            url: '#',
            duration: '45 min'
          },
          {
            title: 'Conducting User Interviews',
            type: 'video',
            url: '#',
            duration: '1 hour'
          },
          {
            title: 'Usability Testing Guide',
            type: 'course',
            url: '#',
            duration: '2 hours'
          }
        ],
        milestones: ['Plan user research', 'Conduct interviews', 'Analyze user feedback']
      },
      {
        week: 4,
        title: 'Portfolio & Job Prep',
        description: 'Build a portfolio and prepare for job applications',
        resources: [
          {
            title: 'Building a Design Portfolio',
            type: 'course',
            url: '#',
            duration: '2 hours'
          },
          {
            title: 'Design Interview Tips',
            type: 'video',
            url: '#',
            duration: '45 min'
          },
          {
            title: 'Portfolio Review Checklist',
            type: 'article',
            url: '#',
            duration: '20 min'
          }
        ],
        milestones: ['Complete portfolio website', 'Prepare case studies', 'Practice design challenges']
      }
    ]
  },
  {
    id: '2',
    title: 'Frontend Developer',
    description: 'Build modern web applications with React and TypeScript',
    duration: '6 weeks',
    difficulty: 'Intermediate',
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML'],
    prerequisites: ['Basic programming knowledge', 'HTML/CSS fundamentals'],
    outcomes: ['Build responsive web apps', 'Master React ecosystem', 'Deploy production applications'],
    roadmap: [
      {
        week: 1,
        title: 'JavaScript Fundamentals',
        description: 'Master modern JavaScript concepts',
        resources: [
          {
            title: 'ES6+ Features',
            type: 'course',
            url: '#',
            duration: '4 hours'
          },
          {
            title: 'Async JavaScript',
            type: 'video',
            url: '#',
            duration: '2 hours'
          }
        ],
        milestones: ['Understand ES6+ syntax', 'Work with promises and async/await']
      },
      {
        week: 2,
        title: 'React Basics',
        description: 'Learn React fundamentals and hooks',
        resources: [
          {
            title: 'React Official Tutorial',
            type: 'course',
            url: '#',
            duration: '5 hours'
          }
        ],
        milestones: ['Build React components', 'Manage state with hooks']
      }
    ]
  },
  {
    id: '3',
    title: 'Data Scientist',
    description: 'Analyze data and build machine learning models',
    duration: '8 weeks',
    difficulty: 'Advanced',
    skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
    prerequisites: ['Mathematics background', 'Programming experience'],
    outcomes: ['Analyze complex datasets', 'Build ML models', 'Create data visualizations'],
    roadmap: [
      {
        week: 1,
        title: 'Python for Data Science',
        description: 'Learn Python libraries for data analysis',
        resources: [
          {
            title: 'Pandas Tutorial',
            type: 'course',
            url: '#',
            duration: '6 hours'
          }
        ],
        milestones: ['Master pandas and numpy', 'Clean and manipulate data']
      }
    ]
  }
];