import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient, DatabaseConnection, QueryResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Bot, 
  User, 
  Database, 
  Mail, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  query_response?: QueryResponse;
  conversation_id?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [emailRecipient, setEmailRecipient] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConnections();
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await apiClient.getChatHistory('chat');
      const historyMessages: Message[] = history.map((item, index) => [
        {
          id: `user-${index}`,
          type: 'user' as const,
          content: item.user_input,
          timestamp: new Date(item.created_at),
        },
        {
          id: `assistant-${index}`,
          type: 'assistant' as const,
          content: item.response_data.message || 'Response received',
          timestamp: new Date(item.created_at),
          query_response: item.response_data,
          conversation_id: item.conversation_id,
        },
      ]).flat();
      
      setMessages(historyMessages);
    } catch (error: any) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (selectedConnections.length === 0) {
      toast({
        title: 'No database selected',
        description: 'Please select at least one database connection.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.processQuery({
        question: input,
        database_connection_ids: selectedConnections,
        page_name: 'chat',
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        query_response: response,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.suggest_email) {
        toast({
          title: 'Email Suggestion',
          description: response.email_suggestion_message || 'This data might be useful to share via email.',
        });
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Query failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (conversationId: string) => {
    if (!emailRecipient.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiClient.sendEmail({
        chat_history_id: conversationId,
        recipient_email: emailRecipient,
      });

      toast({
        title: 'Email sent',
        description: `Query results sent to ${emailRecipient}`,
      });
      setEmailRecipient('');
    } catch (error: any) {
      toast({
        title: 'Email failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <div key={message.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isSystem ? 'bg-chat-system' : 'bg-primary'
          }`}>
            {isSystem ? (
              <AlertCircle className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Bot className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
        )}

        <div className={`flex-1 max-w-3xl ${isUser ? 'order-first' : ''}`}>
          <Card className={`${
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : isSystem
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-chat-assistant'
          }`}>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.query_response && (
                <div className="mt-4 space-y-4">
                  {message.query_response.explanation && (
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        {message.query_response.explanation}
                      </p>
                    </div>
                  )}

                  {message.query_response.sql_query && (
                    <div className="p-3 rounded-lg bg-muted font-mono text-sm">
                      <p className="text-muted-foreground mb-2">Generated SQL:</p>
                      <code>{message.query_response.sql_query}</code>
                    </div>
                  )}

                  {message.query_response.results_table && (
                    <div 
                      className="p-3 rounded-lg bg-muted overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: message.query_response.results_table }}
                    />
                  )}

                  {message.query_response.visualization && (
                    <div 
                      className="p-3 rounded-lg bg-muted"
                      dangerouslySetInnerHTML={{ __html: message.query_response.visualization }}
                    />
                  )}

                  {message.query_response.suggest_email && message.conversation_id && (
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Enter email to share results"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSendEmail(message.conversation_id!)}
                        size="sm"
                        variant="outline"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <p className="text-xs text-muted-foreground mt-2 px-4">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>

        {isUser && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Chat Assistant</h1>
            <p className="text-muted-foreground">
              Ask questions about your database and get intelligent insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedConnections.join(',')}
                onValueChange={(value) => setSelectedConnections(value ? value.split(',') : [])}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select database connections" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem key={conn.db_id} value={conn.db_id}>
                      {conn.connection_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedConnections.length > 0 && (
              <Badge variant="secondary">
                {selectedConnections.length} selected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Ready to help with your database queries
            </h3>
            <p className="text-muted-foreground">
              Select a database connection and start asking questions about your data
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <Card className="bg-chat-assistant">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing your query...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your database..."
            className="flex-1"
            disabled={isLoading || selectedConnections.length === 0}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim() || selectedConnections.length === 0}
            className="bg-gradient-primary hover:shadow-glow"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;