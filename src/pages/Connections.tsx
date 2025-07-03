import React, { useState, useEffect } from 'react';
import { apiClient, DatabaseConnection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Database, 
  Edit, 
  Trash2, 
  TestTube, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Server
} from 'lucide-react';

const Connections = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    connection_name: '',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await apiClient.getDatabaseConnections();
      setConnections(data);
    } catch (error: any) {
      toast({
        title: 'Error loading connections',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingConnection) {
        await apiClient.updateDatabaseConnection(editingConnection.db_id, formData);
        toast({
          title: 'Connection updated',
          description: 'Database connection updated successfully.',
        });
      } else {
        await apiClient.createDatabaseConnection(formData);
        toast({
          title: 'Connection created',
          description: 'Database connection created successfully.',
        });
      }
      
      setIsDialogOpen(false);
      setEditingConnection(null);
      resetForm();
      loadConnections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (connection: DatabaseConnection) => {
    setEditingConnection(connection);
    setFormData({
      connection_name: connection.connection_name,
      host: connection.host,
      port: connection.port,
      database_name: connection.database_name,
      username: connection.username,
      password: '', // Don't prefill password for security
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      await apiClient.deleteDatabaseConnection(connectionId);
      toast({
        title: 'Connection deleted',
        description: 'Database connection deleted successfully.',
      });
      loadConnections();
    } catch (error: any) {
      toast({
        title: 'Error deleting connection',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnections(prev => new Set(prev).add(connectionId));
    
    try {
      const result = await apiClient.testDatabaseConnection(connectionId);
      
      if (result.status === 'success') {
        toast({
          title: 'Connection successful',
          description: result.message,
        });
      } else {
        toast({
          title: 'Connection failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTestingConnections(prev => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      connection_name: '',
      host: '',
      port: 5432,
      database_name: '',
      username: '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Database Connections</h1>
          <p className="text-muted-foreground">
            Manage your database connections for AI-powered queries
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingConnection(null);
                resetForm();
              }}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingConnection ? 'Edit Connection' : 'New Database Connection'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="connection_name">Connection Name</Label>
                <Input
                  id="connection_name"
                  name="connection_name"
                  value={formData.connection_name}
                  onChange={handleInputChange}
                  placeholder="My Database"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleInputChange}
                  placeholder="localhost"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  value={formData.port}
                  onChange={handleInputChange}
                  placeholder="5432"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="database_name">Database Name</Label>
                <Input
                  id="database_name"
                  name="database_name"
                  value={formData.database_name}
                  onChange={handleInputChange}
                  placeholder="mydb"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="postgres"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingConnection ? 'Update' : 'Create'} Connection
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {connections.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No database connections
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first database connection to start using the AI assistant
            </p>
            <Button 
              onClick={() => {
                setEditingConnection(null);
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.db_id} className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Server className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{connection.connection_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {connection.database_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={connection.is_active ? "default" : "secondary"}>
                    {connection.is_active ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {connection.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Host:</span>
                    <span className="font-mono">{connection.host}:{connection.port}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-mono">{connection.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(connection.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(connection.db_id)}
                    disabled={testingConnections.has(connection.db_id)}
                    className="flex-1"
                  >
                    {testingConnections.has(connection.db_id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(connection)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(connection.db_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;