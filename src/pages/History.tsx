import React, { useState, useEffect } from 'react';
import { apiClient, ConversationHistory } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  Database, 
  Mail, 
  BarChart3,
  Loader2,
  Calendar,
  Filter,
  Bot,
  User,
  Code
} from 'lucide-react';

const History = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, selectedPage]);

  const loadHistory = async () => {
    try {
      // Load history for all pages - you might want to modify this based on your needs
      const chatHistory = await apiClient.getChatHistory('chat', 100);
      setConversations(chatHistory);
    } catch (error: any) {
      toast({
        title: 'Error loading history',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.user_input.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.response_data.explanation && 
         conv.response_data.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by page
    if (selectedPage !== 'all') {
      filtered = filtered.filter(conv => conv.page_name === selectedPage);
    }

    setFilteredConversations(filtered);
  };

  const getUniquePages = () => {
    const pages = [...new Set(conversations.map(conv => conv.page_name))];
    return pages.filter(Boolean);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getQueryStats = () => {
    const totalQueries = conversations.length;
    const successfulQueries = conversations.filter(conv => 
      conv.response_data.sql_query && conv.response_data.sql_query !== 'NOT_RELEVANT'
    ).length;
    const graphQueries = conversations.filter(conv => 
      conv.response_data.is_graph_query
    ).length;
    const emailSuggestions = conversations.filter(conv => 
      conv.response_data.suggest_email
    ).length;

    return { totalQueries, successfulQueries, graphQueries, emailSuggestions };
  };

  const renderConversation = (conversation: ConversationHistory) => {
    const response = conversation.response_data;
    const hasResults = response.results_table || response.visualization;
    const isSuccessful = response.sql_query && response.sql_query !== 'NOT_RELEVANT';

    return (
      <Card key={conversation.conversation_id} className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Query</span>
                <Badge variant="outline" className="text-xs">
                  {conversation.page_name}
                </Badge>
              </div>
              <p className="text-foreground font-medium line-clamp-2">
                {conversation.user_input}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(conversation.created_at)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Response */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Response</span>
                {isSuccessful && (
                  <Badge variant="default" className="text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    SQL Generated
                  </Badge>
                )}
                {response.is_graph_query && (
                  <Badge variant="secondary" className="text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Chart
                  </Badge>
                )}
                {response.suggest_email && (
                  <Badge variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Suggested
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {response.message || response.explanation || 'No response message'}
              </p>
            </div>

            {/* SQL Query */}
            {response.sql_query && response.sql_query !== 'NOT_RELEVANT' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Generated SQL</span>
                </div>
                <div className="p-3 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                  <code>{response.sql_query}</code>
                </div>
              </div>
            )}

            {/* Results Preview */}
            {hasResults && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Results Available</span>
                <div className="p-3 rounded-lg bg-muted text-xs">
                  {response.results_table && (
                    <div className="mb-2">
                      <span className="text-muted-foreground">📊 Data table with results</span>
                    </div>
                  )}
                  {response.visualization && (
                    <div>
                      <span className="text-muted-foreground">📈 Visualization generated</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email suggestion */}
            {response.suggest_email && response.email_suggestion_message && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Email Suggestion</span>
                </div>
                <p className="text-xs text-primary/80">
                  {response.email_suggestion_message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading conversation history...</p>
        </div>
      </div>
    );
  }

  const stats = getQueryStats();
  const uniquePages = getUniquePages();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Conversation History</h1>
        <p className="text-muted-foreground">
          Review your previous queries and AI responses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalQueries}</p>
                <p className="text-xs text-muted-foreground">Total Queries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.successfulQueries}</p>
                <p className="text-xs text-muted-foreground">SQL Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.graphQueries}</p>
                <p className="text-xs text-muted-foreground">Visualizations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.emailSuggestions}</p>
                <p className="text-xs text-muted-foreground">Email Suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
          >
            <option value="all">All Pages</option>
            {uniquePages.map(page => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversations */}
      {filteredConversations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
            </h3>
            <p className="text-muted-foreground">
              {conversations.length === 0 
                ? 'Start chatting with the AI to see your conversation history here'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map(renderConversation)}
        </div>
      )}
    </div>
  );
};

export default History;