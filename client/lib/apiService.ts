// API Service for connecting to XAMPP MySQL backend
// Falls back to localStorage if API is not available
const API_BASE_URL = "http://localhost/school-management/server";

// Check if we're in a development environment where XAMPP might not be available
const isCloudEnvironment = () => {
  return (
    window.location.hostname.includes("fly.dev") ||
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("netlify.app") ||
    window.location.hostname !== "localhost"
  );
};

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = isCloudEnvironment() ? "/api" : API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;

      const defaultOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      };

      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Request failed:", error);

      // Check if it's a network error (XAMPP not running)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message:
            "Cannot connect to XAMPP server. Using local storage instead.",
          error: "API_UNAVAILABLE",
        };
      }

      return {
        success: false,
        message: "An error occurred while connecting to the server",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Authentication API calls
  async login(credentials: { username: string; password: string }) {
    const endpoint = isCloudEnvironment()
      ? "auth/login"
      : "auth.php?action=login";
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: "admin" | "staff";
  }) {
    const endpoint = isCloudEnvironment()
      ? "auth/register"
      : "auth.php?action=register";
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(userId: string) {
    return this.request(`auth.php?action=profile&user_id=${userId}`);
  }

  // Database API calls
  async testConnection() {
    return this.request("database.php?action=test");
  }

  async getDatabaseStats() {
    const endpoint = isCloudEnvironment()
      ? "users"
      : "database.php?action=stats";
    // In cloud demo, return users count etc. For simplicity, hit users list
    return this.request(endpoint as any);
  }

  // Students API calls
  async getStudents() {
    return this.request("students.php?action=list");
  }

  async addStudent(studentData: any) {
    return this.request("students.php?action=add", {
      method: "POST",
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(studentId: number, studentData: any) {
    return this.request(`students.php?action=update&id=${studentId}`, {
      method: "PUT",
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(studentId: number) {
    return this.request(`students.php?action=delete&id=${studentId}`, {
      method: "DELETE",
    });
  }

  // Attendance API calls
  async getAttendance(filters?: any) {
    const params = filters ? `&${new URLSearchParams(filters).toString()}` : "";
    return this.request(`attendance.php?action=list${params}`);
  }

  async recordAttendance(attendanceData: any) {
    return this.request("attendance.php?action=record", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    });
  }

  // Grades API calls
  async getGrades(filters?: any) {
    const params = filters ? `&${new URLSearchParams(filters).toString()}` : "";
    return this.request(`grades.php?action=list${params}`);
  }

  async addGrade(gradeData: any) {
    return this.request("grades.php?action=add", {
      method: "POST",
      body: JSON.stringify(gradeData),
    });
  }

  // Finance API calls
  async getFinanceRecords(filters?: any) {
    const params = filters ? `&${new URLSearchParams(filters).toString()}` : "";
    return this.request(`finance.php?action=list${params}`);
  }

  async addFinanceRecord(financeData: any) {
    return this.request("finance.php?action=add", {
      method: "POST",
      body: JSON.stringify(financeData),
    });
  }

  async updatePaymentStatus(paymentId: number, status: string) {
    return this.request(`finance.php?action=update_status&id=${paymentId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Staff API calls
  async getStaff() {
    return this.request("staff.php?action=list");
  }

  async addStaff(staffData: any) {
    return this.request("staff.php?action=add", {
      method: "POST",
      body: JSON.stringify(staffData),
    });
  }

  // Users API calls
  async getAllUsers() {
    const endpoint = isCloudEnvironment() ? "users" : "users.php?action=list";
    return this.request(endpoint);
  }

  async addUser(userData: any) {
    const endpoint = isCloudEnvironment() ? "users" : "users.php?action=add";
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: any) {
    const endpoint = isCloudEnvironment()
      ? `users/${userId}`
      : `users.php?action=update&id=${userId}`;
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number) {
    const endpoint = isCloudEnvironment()
      ? `users/${userId}`
      : `users.php?action=delete&id=${userId}`;
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  async changeUserPassword(userId: number, newPassword: string) {
    const endpoint = isCloudEnvironment()
      ? `users/${userId}`
      : `users.php?action=change_password&id=${userId}`;
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async inviteUser(userId: number) {
    const endpoint = isCloudEnvironment()
      ? `users/${userId}/invite`
      : `users.php?action=invite&id=${userId}`;
    return this.request(endpoint, {
      method: "POST",
    });
  }

  async completeRegistration(data: {
    username: string;
    token: string;
    password: string;
  }) {
    const endpoint = isCloudEnvironment()
      ? "auth/complete_registration"
      : "auth.php?action=complete_registration";
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
