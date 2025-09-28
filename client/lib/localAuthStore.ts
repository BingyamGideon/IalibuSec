// Local Storage Authentication Fallback
// Used when XAMPP API is not available (cloud environments)

export interface LocalUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'admin' | 'staff';
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  assignedClasses: string[];
  assignedSubjects: string[];
  allowCrossClass: boolean;
}

interface LocalAuthData {
  users: LocalUser[];
  currentUser: LocalUser | null;
  sessions: any[];
  lastUpdated: string;
  version: number;
}

class LocalAuthStore {
  private storageKey = 'school_auth_local';

  private getDefaultData(): LocalAuthData {
    return {
      users: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@ialibu.edu.pg',
          firstName: 'System',
          lastName: 'Administrator',
          userType: 'admin',
          department: 'Administration',
          position: 'System Administrator',
          isActive: true,
          createdAt: new Date().toISOString(),
          permissions: ['all'],
          assignedClasses: [],
          assignedSubjects: [],
          allowCrossClass: true
        },
        {
          id: 2,
          username: 'staff',
          email: 'staff@ialibu.edu.pg',
          firstName: 'Demo',
          lastName: 'Teacher',
          userType: 'staff',
          department: 'Academic',
          position: 'Teacher',
          isActive: true,
          createdAt: new Date().toISOString(),
          permissions: ['students', 'attendance', 'grades', 'reports'],
          assignedClasses: ['9A', '10A'],
          assignedSubjects: ['Mathematics', 'English', 'Science'],
          allowCrossClass: false
        }
      ],
      currentUser: null,
      sessions: [],
      lastUpdated: new Date().toISOString(),
      version: 1
    };
  }

  private loadData(): LocalAuthData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local auth data:', error);
    }
    return this.getDefaultData();
  }

  private saveData(data: LocalAuthData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      data.version += 1;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local auth data:', error);
    }
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    const data = this.loadData();
    
    // Check credentials
    const user = data.users.find(u => u.username === credentials.username && u.isActive);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    // Check password (simple check for demo users)
    let validPassword = false;
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      validPassword = true;
    } else if (credentials.username === 'staff' && credentials.password === 'staff123') {
      validPassword = true;
    }

    if (!validPassword) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    data.currentUser = user;
    this.saveData(data);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        user_type: user.userType,
        department: user.department,
        position: user.position,
        is_active: user.isActive,
        permissions: user.permissions,
        assigned_classes: user.assignedClasses,
        assigned_subjects: user.assignedSubjects,
        allow_cross_class: user.allowCrossClass
      }
    };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'admin' | 'staff';
    assignedClasses?: string[];
    assignedSubjects?: string[];
    allowCrossClass?: boolean;
  }) {
    const data = this.loadData();
    
    // Check if username or email already exists
    const exists = data.users.some(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (exists) {
      return {
        success: false,
        message: 'Username or email already exists'
      };
    }

    // Domain validation
    if (!/@ialibu\.edu\.pg$/i.test(userData.email)) {
      return { success: false, message: 'Email must be a valid ialibu.edu.pg address' };
    }

    // Create new user
    const newUser: LocalUser = {
      id: Math.max(...data.users.map(u => u.id)) + 1,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userType: userData.userType,
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions: userData.userType === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports'],
      assignedClasses: userData.assignedClasses || [],
      assignedSubjects: userData.assignedSubjects || [],
      allowCrossClass: !!userData.allowCrossClass
    };

    data.users.push(newUser);
    this.saveData(data);

    return {
      success: true,
      message: 'User registered successfully',
      user_id: newUser.id
    };
  }

  async getAllUsers() {
    const data = this.loadData();
    return {
      success: true,
      users: data.users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        user_type: user.userType,
        department: user.department,
        position: user.position,
        is_active: user.isActive,
        permissions: user.permissions,
        assigned_classes: user.assignedClasses,
        assigned_subjects: user.assignedSubjects,
        allow_cross_class: user.allowCrossClass,
        created_at: user.createdAt,
        last_login: user.lastLogin
      }))
    };
  }

  async addUser(userData: any) {
    return this.register(userData);
  }

  async updateUser(userId: number, updateData: any) {
    const data = this.loadData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Check if username or email conflicts with other users
    const conflicts = data.users.some((u, index) => 
      index !== userIndex && 
      (u.username === updateData.username || u.email === updateData.email)
    );

    if (conflicts) {
      return {
        success: false,
        message: 'Username or email already exists for another user'
      };
    }

    // Domain validation if email updated
    if (updateData.email && !/@ialibu\.edu\.pg$/i.test(updateData.email)) {
      return { success: false, message: 'Email must be a valid ialibu.edu.pg address' };
    }

    // Update user
    data.users[userIndex] = {
      ...data.users[userIndex],
      username: updateData.username || data.users[userIndex].username,
      email: updateData.email || data.users[userIndex].email,
      firstName: updateData.firstName || data.users[userIndex].firstName,
      lastName: updateData.lastName || data.users[userIndex].lastName,
      userType: updateData.userType || data.users[userIndex].userType,
      department: updateData.department ?? data.users[userIndex].department,
      position: updateData.position ?? data.users[userIndex].position,
      isActive: updateData.isActive !== undefined ? updateData.isActive : data.users[userIndex].isActive,
      permissions: updateData.userType === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports'],
      assignedClasses: updateData.assignedClasses ?? data.users[userIndex].assignedClasses,
      assignedSubjects: updateData.assignedSubjects ?? data.users[userIndex].assignedSubjects,
      allowCrossClass: updateData.allowCrossClass !== undefined ? updateData.allowCrossClass : data.users[userIndex].allowCrossClass
    };

    this.saveData(data);

    return {
      success: true,
      message: 'User updated successfully'
    };
  }

  async deleteUser(userId: number) {
    const data = this.loadData();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (user.username === 'admin') {
      return {
        success: false,
        message: 'Cannot delete the admin user'
      };
    }

    // Soft delete - set inactive
    user.isActive = false;
    this.saveData(data);

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  async changeUserPassword(userId: number, newPassword: string) {
    // In localStorage mode, we don't actually store passwords
    // Just return success for demo purposes
    return {
      success: true,
      message: 'Password changed successfully (localStorage mode - passwords not stored)'
    };
  }

  async testConnection() {
    return {
      success: true,
      message: 'Using localStorage fallback - no external database required'
    };
  }

  async getDatabaseStats() {
    const data = this.loadData();
    return {
      success: true,
      stats: {
        users: data.users.filter(u => u.isActive).length,
        students: 12, // Demo data
        staff: 8,     // Demo data
        attendance: 20, // Demo data
        grades: 15,   // Demo data
        finance: 10   // Demo data
      }
    };
  }
}

export const localAuthStore = new LocalAuthStore();
