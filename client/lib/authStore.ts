// Authentication and User Management System - Updated for MySQL Database with localStorage fallback
import { apiService } from './apiService';
import { localAuthStore } from './localAuthStore';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'admin' | 'staff';
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  permissions: string[];
  assignedClasses?: string[];
  assignedSubjects?: string[];
  allowCrossClass?: boolean;
}

export interface Session {
  id: string;
  userId: number;
  username: string;
  userType: 'admin' | 'staff';
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'admin' | 'staff';
  department?: string;
  position?: string;
}

interface AuthState {
  currentUser: User | null;
  currentSession: Session | null;
  isAuthenticated: boolean;
  token: string | null;
}

type AuthChangeListener = () => void;

class AuthStore {
  private state: AuthState;
  private listeners: AuthChangeListener[] = [];
  private storageKey = 'school_auth_state';

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): AuthState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored session is not expired
        if (parsed.currentSession && new Date(parsed.currentSession.expiresAt) > new Date()) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading auth state from storage:', error);
    }

    return {
      currentUser: null,
      currentSession: null,
      isAuthenticated: false,
      token: null
    };
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving auth state to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: AuthChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await apiService.login(credentials);

      // If API is unavailable, fallback to localStorage
      if (!response.success && response.error === 'API_UNAVAILABLE') {
        console.log('API unavailable, using localStorage fallback');
        return this.loginWithLocalStorage(credentials);
      }

      if (response.success && response.user) {
        // Create session
        const session: Session = {
          id: response.token || `session_${Date.now()}`,
          userId: response.user.id,
          username: response.user.username,
          userType: response.user.user_type,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          isActive: true
        };

        // Update state
        this.state = {
          currentUser: {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            firstName: response.user.first_name,
            lastName: response.user.last_name,
            userType: response.user.user_type,
            department: response.user.department,
            position: response.user.position,
            isActive: response.user.is_active,
            permissions: response.user.permissions || [],
            assignedClasses: response.user.assigned_classes || [],
            assignedSubjects: response.user.assigned_subjects || [],
            allowCrossClass: !!response.user.allow_cross_class
          },
          currentSession: session,
          isAuthenticated: true,
          token: response.token || null
        };

        this.saveToStorage();
        this.notifyListeners();

        return {
          success: true,
          message: 'Login successful (API)',
          user: this.state.currentUser
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to localStorage on any error
      return this.loginWithLocalStorage(credentials);
    }
  }

  private async loginWithLocalStorage(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await localAuthStore.login(credentials);

      if (response.success && response.user) {
        // Create session
        const session: Session = {
          id: `local_session_${Date.now()}`,
          userId: response.user.id,
          username: response.user.username,
          userType: response.user.user_type,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          isActive: true
        };

        // Update state
        this.state = {
          currentUser: {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            firstName: response.user.first_name,
            lastName: response.user.last_name,
            userType: response.user.user_type,
            department: response.user.department,
            position: response.user.position,
            isActive: response.user.is_active,
            permissions: response.user.permissions || [],
            assignedClasses: response.user.assigned_classes || response.user.assignedClasses || [],
            assignedSubjects: response.user.assigned_subjects || response.user.assignedSubjects || [],
            allowCrossClass: !!(response.user.allow_cross_class ?? response.user.allowCrossClass)
          },
          currentSession: session,
          isAuthenticated: true,
          token: null
        };

        this.saveToStorage();
        this.notifyListeners();

        return {
          success: true,
          message: 'Login successful (localStorage)',
          user: this.state.currentUser
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('localStorage login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      // Validate password strength
      if (userData.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
      }

      // Enforce school email domain
      if (!/@ialibu\.edu\.pg$/i.test(userData.email)) {
        return { success: false, message: 'Email must be a valid ialibu.edu.pg address' };
      }

      const response = await apiService.register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType
      });

      if (response.success) {
        return {
          success: true,
          message: 'Registration successful. You can now log in.'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.'
      };
    }
  }

  logout(): void {
    this.state = {
      currentUser: null,
      currentSession: null,
      isAuthenticated: false,
      token: null
    };
    
    this.saveToStorage();
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.state.currentUser;
  }

  isAuthenticated(): boolean {
    if (!this.state.isAuthenticated || !this.state.currentSession) {
      return false;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(this.state.currentSession.expiresAt);
    
    if (now >= expiresAt) {
      this.logout();
      return false;
    }

    return true;
  }

  hasPermission(permission: string): boolean {
    if (!this.state.currentUser) return false;
    
    const permissions = this.state.currentUser.permissions;
    return permissions.includes('all') || permissions.includes(permission);
  }

  updateProfile(userId: number, updates: Partial<User>): boolean {
    if (!this.state.currentUser || this.state.currentUser.id !== userId) {
      return false;
    }

    this.state.currentUser = {
      ...this.state.currentUser,
      ...updates
    };

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): boolean {
    // This would need to be implemented with an API call
    // For now, just return true as placeholder
    console.log('Password change would be handled by API');
    return true;
  }

  // Test database connection
  async testDatabaseConnection() {
    try {
      const response = await apiService.testConnection();
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const response = await apiService.getDatabaseStats();
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get database statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.getAllUsers();

      // If API is unavailable, fallback to localStorage
      if (!response.success && response.error === 'API_UNAVAILABLE') {
        const localResponse = await localAuthStore.getAllUsers();
        if (localResponse.success && localResponse.users) {
          return localResponse.users.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            department: user.department,
            position: user.position,
            isActive: user.is_active,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            permissions: user.permissions || [],
            assignedClasses: user.assigned_classes || user.assignedClasses || [],
            assignedSubjects: user.assigned_subjects || user.assignedSubjects || [],
            allowCrossClass: !!(user.allow_cross_class ?? user.allowCrossClass),
            mustSetPassword: false,
            registrationToken: null
          }));
        }
        return [];
      }

      if (response.success && response.users) {
        // Convert the API response format to our User interface
        return response.users.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          department: user.department,
          position: user.position,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          permissions: user.permissions || [],
          assignedClasses: user.assigned_classes || user.assignedClasses || [],
          assignedSubjects: user.assigned_subjects || user.assignedSubjects || [],
          allowCrossClass: !!(user.allow_cross_class ?? user.allowCrossClass),
          mustSetPassword: !!user.must_set_password,
          registrationToken: user.registration_token ?? null
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      // Try localStorage fallback on error
      try {
        const localResponse = await localAuthStore.getAllUsers();
        if (localResponse.success && localResponse.users) {
          return localResponse.users.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            department: user.department,
            position: user.position,
            isActive: user.is_active,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            permissions: user.permissions || [],
            assignedClasses: user.assigned_classes || user.assignedClasses || [],
            assignedSubjects: user.assigned_subjects || user.assignedSubjects || [],
            allowCrossClass: !!(user.allow_cross_class ?? user.allowCrossClass),
            mustSetPassword: false,
            registrationToken: null
          }));
        }
      } catch (localError) {
        console.error('Error with localStorage fallback:', localError);
      }
      return [];
    }
  }

  async addUser(userData: Omit<RegisterData, 'confirmPassword'>): Promise<{ success: boolean; message: string; registrationToken?: string }> {
    try {
      const response = await apiService.addUser({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
        department: userData.department,
        position: userData.position,
        assignedClasses: (userData as any).assignedClasses || [],
        assignedSubjects: (userData as any).assignedSubjects || [],
        allowCrossClass: !!(userData as any).allowCrossClass
      });

      // If API is unavailable, fallback to localStorage
      if (!response.success && response.error === 'API_UNAVAILABLE') {
        const localResponse = await localAuthStore.addUser({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userType: userData.userType,
          assignedClasses: (userData as any).assignedClasses || [],
          assignedSubjects: (userData as any).assignedSubjects || [],
          allowCrossClass: !!(userData as any).allowCrossClass
        });

        if (localResponse.success) {
          this.notifyListeners(); // Refresh the users list
        }

        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage)'
        };
      }

      if (response.success) {
        this.notifyListeners(); // Refresh the users list
      }

      return {
        success: response.success,
        message: response.message || (response.success ? 'User added successfully' : 'Failed to add user'),
        registrationToken: (response as any).registrationToken
      };
    } catch (error) {
      // Try localStorage fallback on error
      try {
        const localResponse = await localAuthStore.addUser({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userType: userData.userType,
          assignedClasses: (userData as any).assignedClasses || [],
          assignedSubjects: (userData as any).assignedSubjects || [],
          allowCrossClass: !!(userData as any).allowCrossClass
        });

        if (localResponse.success) {
          this.notifyListeners();
        }

        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage fallback)'
        };
      } catch (localError) {
        return {
          success: false,
          message: 'Error adding user. Please try again.'
        };
      }
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<{ success: boolean; message: string }> {
    try {
      if (userData.email && !/@ialibu\.edu\.pg$/i.test(userData.email)) {
        return { success: false, message: 'Email must be a valid ialibu.edu.pg address' };
      }
      const response = await apiService.updateUser(userId, {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
        department: userData.department,
        position: userData.position,
        isActive: userData.isActive,
        assignedClasses: userData.assignedClasses,
        assignedSubjects: userData.assignedSubjects,
        allowCrossClass: userData.allowCrossClass
      });

      // If API is unavailable, fallback to localStorage
      if (!response.success && response.error === 'API_UNAVAILABLE') {
        const localResponse = await localAuthStore.updateUser(userId, userData);
        if (localResponse.success) {
          this.notifyListeners();
        }
        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage)'
        };
      }

      if (response.success) {
        this.notifyListeners(); // Refresh the users list
      }

      return {
        success: response.success,
        message: response.message || (response.success ? 'User updated successfully' : 'Failed to update user')
      };
    } catch (error) {
      // Try localStorage fallback
      try {
        const localResponse = await localAuthStore.updateUser(userId, userData);
        if (localResponse.success) {
          this.notifyListeners();
        }
        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage fallback)'
        };
      } catch (localError) {
        return {
          success: false,
          message: 'Error updating user. Please try again.'
        };
      }
    }
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.deleteUser(userId);

      // If API is unavailable, fallback to localStorage
      if (!response.success && response.error === 'API_UNAVAILABLE') {
        const localResponse = await localAuthStore.deleteUser(userId);
        if (localResponse.success) {
          this.notifyListeners();
        }
        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage)'
        };
      }

      if (response.success) {
        this.notifyListeners(); // Refresh the users list
      }

      return {
        success: response.success,
        message: response.message || (response.success ? 'User deleted successfully' : 'Failed to delete user')
      };
    } catch (error) {
      // Try localStorage fallback
      try {
        const localResponse = await localAuthStore.deleteUser(userId);
        if (localResponse.success) {
          this.notifyListeners();
        }
        return {
          success: localResponse.success,
          message: localResponse.message + ' (localStorage fallback)'
        };
      } catch (localError) {
        return {
          success: false,
          message: 'Error deleting user. Please try again.'
        };
      }
    }
  }

  async changeUserPassword(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.changeUserPassword(userId, newPassword);

      return {
        success: response.success,
        message: response.message || (response.success ? 'Password changed successfully' : 'Failed to change password')
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error changing password. Please try again.'
      };
    }
  }

  async createRegistrationInvite(userId: number): Promise<{ success: boolean; registrationToken?: string; message?: string }> {
    try {
      const res = await apiService.inviteUser(userId);
      return { success: !!res.success, registrationToken: (res as any).registrationToken, message: res.message };
    } catch (e) {
      return { success: false, message: 'Failed to create invite' };
    }
  }

  async completeRegistration(username: string, token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiService.completeRegistration({ username, token, password });
      return { success: !!res.success, message: res.message || (res.success ? 'Registration completed' : 'Failed') };
    } catch (e) {
      return { success: false, message: 'Failed to complete registration' };
    }
  }
}

export const authStore = new AuthStore();
