import React from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { DashboardTab, NavigationItem } from '../../types/dashboard';

interface NavbarTabs {
  navigation: NavigationItem[];
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarTabs> = ({
  navigation,
  activeTab,
  onTabChange,
  onLogout
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-[10px] md:text-xl font-bold text-gray-900">
              Job Ready AI Coach
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => onTabChange(e.target.value as DashboardTab)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {navigation.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;