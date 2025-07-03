import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Database, 
  MessageSquare, 
  History, 
  Settings, 
  LogOut,
  User,
  Bot
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Connections', href: '/connections', icon: Database },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">InsightEdge</h1>
              <p className="text-sm text-muted-foreground">AI Database Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-8 h-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;