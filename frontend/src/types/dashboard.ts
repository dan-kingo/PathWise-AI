export type DashboardTab = 'overview' | 'profile' | 'career' | 'profile-reviewer' | 'resume-reviewer';

export interface NavigationItem {
  id: DashboardTab;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}