import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Shield, 
  Database, 
  Bell, 
  Moon, 
  Sun, 
  Palette,
  Save,
  LogOut,
  Key,
  Activity
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const settingSections = [
    {
      title: 'Profile Information',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                defaultValue={user?.full_name}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                defaultValue={user?.username}
                placeholder="Enter your username"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email}
              placeholder="Enter your email"
            />
          </div>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ),
    },
    {
      title: 'Account Security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user?.is_active ? "default" : "destructive"}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div>
            <Label>Theme Preference</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified about query completions
              </p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Updates</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly insights and summaries
              </p>
            </div>
            <Button
              variant={emailUpdates ? 'default' : 'outline'}
              onClick={() => setEmailUpdates(!emailUpdates)}
            >
              {emailUpdates ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      ),
    },
    {
      title: 'Database Preferences',
      icon: Database,
      content: (
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-2">Query Timeout</h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue="30"
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-2">Result Limit</h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue="1000"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">rows</span>
            </div>
          </div>
          
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="space-y-6">
        {settingSections.map((section, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.content}
            </CardContent>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card className="shadow-card border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-destructive">
              <LogOut className="w-5 h-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Sign Out</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will log you out of your current session.
                </p>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;