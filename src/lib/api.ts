const API_BASE_URL = 'http://localhost:8000';

export interface User {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseConnection {
  db_id: string;
  connection_name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface QueryResponse {
  message: string;
  explanation: string;
  results_table?: string;
  is_graph_query: boolean;
  sql_query?: string;
  suggest_email?: boolean;
  email_suggestion_message?: string;
  data_info?: any;
  visualization?: string;
}

export interface ConversationHistory {
  conversation_id: string;
  page_name: string;
  user_input: string;
  response_data: any;
  created_at: string;
}

class ApiClient {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name: string;
  }): Promise<User> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { username: string; password: string }): Promise<{ access_token: string; token_type: string }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/api/auth/me');
  }

  // Database connection endpoints
  async createDatabaseConnection(connection: {
    connection_name: string;
    host: string;
    port: number;
    database_name: string;
    username: string;
    password: string;
  }): Promise<DatabaseConnection> {
    return this.request('/api/database-connections', {
      method: 'POST',
      body: JSON.stringify(connection),
    });
  }

  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    return this.request('/api/database-connections');
  }

  async deleteDatabaseConnection(connectionId: string): Promise<{ message: string }> {
    return this.request(`/api/database-connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  async updateDatabaseConnection(connectionId: string, data: Partial<DatabaseConnection>): Promise<any> {
    return this.request(`/api/database-connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testDatabaseConnection(connectionId: string): Promise<{ status: string; message: string }> {
    return this.request(`/api/database-connections/${connectionId}/test`, {
      method: 'POST',
    });
  }

  // Query endpoints
  async processQuery(request: {
    question: string;
    database_connection_ids: string[];
    page_name: string;
  }): Promise<QueryResponse> {
    return this.request('/api/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async sendEmail(request: {
    chat_history_id: string;
    recipient_email: string;
  }): Promise<{ success: boolean; message: string; email_sent_to: string }> {
    return this.request('/api/send-email', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Chat history endpoints
  async getChatHistory(pageName: string, limit: number = 50): Promise<ConversationHistory[]> {
    return this.request(`/api/chat/history?page_name=${encodeURIComponent(pageName)}&limit=${limit}`);
  }

  // Database schema endpoints
  async getTables(connectionId: string): Promise<{ tables: Record<string, any> }> {
    return this.request(`/api/tables/${connectionId}`);
  }

  async getColumns(connectionId: string): Promise<{ columns: Record<string, any> }> {
    return this.request(`/api/columns/${connectionId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();