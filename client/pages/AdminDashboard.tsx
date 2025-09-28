import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/hooks/useDataStore';
import { useAuth } from '@/hooks/useAuth';
import { authStore, type User } from '@/lib/authStore';
import { type Student, type Attendance, type Grade, type Finance, type Staff, type StudentReport } from '@/lib/dataStore';
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  CreditCard,
  UserCog,
  FileText,
  Home,
  Edit,
  Trash2,
  Search,
  Plus,
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  X,
  Clock,
  Eye,
  BarChart3,
  PieChart,
  FileBarChart,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DatabaseStatus } from '@/components/DatabaseStatus';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dataStore = useDataStore();
  const { currentUser, isAuthenticated, logout, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || (currentUser && currentUser.userType !== 'admin'))) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, loading, navigate]);

  // Load users for user management
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await authStore.getAllUsers();
        setUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please check your connection.',
          variant: 'destructive'
        });
      }
    };

    loadUsers();
    const unsubscribe = authStore.subscribe(() => {
      loadUsers();
    });

    return unsubscribe;
  }, [toast]);

  // Search states
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');
  const [financeSearch, setFinanceSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Student filter states
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Finance filter states
  const [financeGrade, setFinanceGrade] = useState('all');
  const [financeClass, setFinanceClass] = useState('all');
  const [financeStatus, setFinanceStatus] = useState('all');

  // Attendance history states
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(true);
  const [historyGrade, setHistoryGrade] = useState('all');
  const [historyClass, setHistoryClass] = useState('all');
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<number | null>(null);

  // Attendance records filter states
  const [attendanceGrade, setAttendanceGrade] = useState('all');
  const [attendanceClass, setAttendanceClass] = useState('all');

  // Grade filter states
  const [gradeFilterGrade, setGradeFilterGrade] = useState('all');
  const [gradeFilterClass, setGradeFilterClass] = useState('all');
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<number | null>(null);

  // Staff department filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Report states
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportGrade, setReportGrade] = useState('all');
  const [reportClass, setReportClass] = useState('all');

  // Modal states
  const [studentModal, setStudentModal] = useState({ open: false, mode: 'add', data: null as Student | null });
  const [attendanceModal, setAttendanceModal] = useState({ open: false, mode: 'add', data: null as Attendance | null });
  const [gradeModal, setGradeModal] = useState({ open: false, mode: 'add', data: null as Grade | null });
  const [financeModal, setFinanceModal] = useState({ open: false, mode: 'add', data: null as Finance | null });
  const [staffModal, setStaffModal] = useState({ open: false, mode: 'add', data: null as Staff | null });
  const [userModal, setUserModal] = useState({ open: false, mode: 'add', data: null as User | null });
  const [users, setUsers] = useState<User[]>([]);

  // Use shared data store
  const students = dataStore.students;
  const attendance = dataStore.attendance;
  const grades = dataStore.grades;
  const finance = dataStore.finance;
  const staff = dataStore.staff;
  const reports = dataStore.reports;



  // Calculate stats dynamically
  const stats = {
    totalStudents: students.length,
    avgGrade: grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length || 0,
    totalRevenue: finance.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0),
    attendanceRate: attendance.length > 0 ? (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100 : 0,
    totalStaff: staff.length,
    pendingPayments: finance.filter(f => f.status === 'Pending').length
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  // Debug function to reset data if needed
  const resetData = () => {
    dataStore.reloadDefaultData();
    toast({ title: 'Data Reset', description: 'Sample data has been reloaded successfully.' });
  };

  // Show loading state while checking authentication
  if (loading || !isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance-records', label: 'Attendance Records', icon: CalendarDays },
    { id: 'grades', label: 'Grades', icon: TrendingUp },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'staff', label: 'Staff', icon: UserCog },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // CRUD Functions for Students
  const handleAddStudent = (student: Omit<Student, 'id'>) => {
    dataStore.addStudent(student);
    toast({ title: 'Success', description: 'Student added successfully' });
    setStudentModal({ open: false, mode: 'add', data: null });
  };

  const handleUpdateStudent = (student: Student) => {
    dataStore.updateStudent(student);
    toast({ title: 'Success', description: 'Student updated successfully' });
    setStudentModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteStudent = (studentId: number) => {
    dataStore.deleteStudent(studentId);
    toast({ title: 'Success', description: 'Student deleted successfully' });
  };

  // CRUD Functions for Attendance
  const handleAddAttendance = (attendanceData: Omit<Attendance, 'id'>) => {
    dataStore.addAttendance(attendanceData);
    toast({ title: 'Success', description: 'Attendance recorded successfully' });
    setAttendanceModal({ open: false, mode: 'add', data: null });
  };

  const handleUpdateAttendance = (attendance: Attendance) => {
    dataStore.updateAttendance(attendance);
    toast({ title: 'Success', description: 'Attendance updated successfully' });
    setAttendanceModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteAttendance = (attendanceId: number) => {
    dataStore.deleteAttendance(attendanceId);
    toast({ title: 'Success', description: 'Attendance record deleted successfully' });
  };

  // CRUD Functions for Grades
  const handleAddGrade = (grade: Omit<Grade, 'id'>) => {
    dataStore.addGrade(grade);
    toast({ title: 'Success', description: 'Grade added successfully' });
    setGradeModal({ open: false, mode: 'add', data: null });
  };

  const handleUpdateGrade = (grade: Grade) => {
    dataStore.updateGrade(grade);
    toast({ title: 'Success', description: 'Grade updated successfully' });
    setGradeModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteGrade = (gradeId: number) => {
    dataStore.deleteGrade(gradeId);
    toast({ title: 'Success', description: 'Grade deleted successfully' });
  };

  // CRUD Functions for Finance
  const handleAddFinance = (finance: Omit<Finance, 'id'>) => {
    dataStore.addFinance(finance);
    toast({ title: 'Success', description: 'Payment record added successfully' });
    setFinanceModal({ open: false, mode: 'add', data: null });
  };

  const handleUpdateFinance = (finance: Finance) => {
    dataStore.updateFinance(finance);
    toast({ title: 'Success', description: 'Payment record updated successfully' });
    setFinanceModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteFinance = (financeId: number) => {
    dataStore.deleteFinance(financeId);
    toast({ title: 'Success', description: 'Payment record deleted successfully' });
  };

  // CRUD Functions for Staff
  const handleAddStaff = (newStaffData: Omit<Staff, 'id'>) => {
    dataStore.addStaff(newStaffData);
    toast({ title: 'Success', description: 'Staff member added successfully' });
    setStaffModal({ open: false, mode: 'add', data: null });
  };

  const handleUpdateStaff = (staffData: Staff) => {
    dataStore.updateStaff(staffData);
    toast({ title: 'Success', description: 'Staff member updated successfully' });
    setStaffModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteStaff = (staffId: number) => {
    dataStore.deleteStaff(staffId);
    toast({ title: 'Success', description: 'Staff member deleted successfully' });
  };

  // User Management CRUD Functions

  const handleAddUser = async (userData: any) => {
    try {
      const result = await authStore.addUser({
        username: userData.username,
        password: userData.password,
        confirmPassword: userData.password, // For compatibility
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
        department: userData.department,
        position: userData.position,
        assignedClasses: userData.assignedClasses,
        assignedSubjects: userData.assignedSubjects,
        allowCrossClass: userData.allowCrossClass
      });

      if (result.success) {
        const extra = result.registrationToken ? ` Registration Code: ${result.registrationToken}` : '';
        toast({ title: 'Success', description: `${result.message}${extra}` });
        setUserModal({ open: false, mode: 'add', data: null });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const result = await authStore.updateUser(user.id, user);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setUserModal({ open: false, mode: 'add', data: null });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const result = await authStore.deleteUser(userId);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  // Generate class options based on selected grade
  const getClassOptions = (grade: string) => {
    if (grade === 'all') return [];
    const gradeNumber = grade.replace('Grade ', '');
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => `${gradeNumber}${letter}`);
  };

  // Calculate comprehensive attendance statistics for a student (Admin version)
  const getStudentAttendanceStats = (studentId: number) => {
    const studentRecords = attendance.filter(record => record.studentId === studentId);
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(record => record.status === 'Present').length;
    const absentRecords = studentRecords.filter(record => record.status === 'Absent');
    const lateRecords = studentRecords.filter(record => record.status === 'Late');
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Collect and categorize absence reasons
    const absenceReasons = absentRecords.reduce((acc, record) => {
      const reason = record.notes || 'No reason provided';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Collect and categorize late reasons
    const lateReasons = lateRecords.reduce((acc, record) => {
      const reason = record.notes || 'No reason provided';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent attendance pattern (last 10 days)
    const recentRecords = studentRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalDays,
      presentDays,
      absentDays: absentRecords.length,
      lateDays: lateRecords.length,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      absenceReasons,
      lateReasons,
      recentPattern: recentRecords.map(r => ({
        date: r.date,
        status: r.status,
        subject: r.subject,
        notes: r.notes
      }))
    };
  };

  // Get detailed attendance history for a student (Admin version)
  const getStudentAttendanceHistory = (studentId: number) => {
    return attendance
      .filter(record => record.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get students for history viewing
  const getHistoryStudents = () => {
    if (historyGrade === 'all' || historyClass === 'all') return [];
    return students.filter(student =>
      student.grade === historyGrade && student.class === historyClass
    );
  };

  // Admin report generation functions
  const generateAdminStudentPerformanceReport = () => {
    const reportStudents = reportGrade !== 'all' && reportClass !== 'all'
      ? students.filter(s => s.grade === reportGrade && s.class === reportClass)
      : students;

    return reportStudents.map(student => {
      const studentGrades = grades.filter(grade => grade.studentId === student.id);
      const attendanceStats = getStudentAttendanceStats(student.id);
      const avgPercentage = studentGrades.length > 0
        ? studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / studentGrades.length
        : 0;

      return {
        ...student,
        averageGrade: Math.round(avgPercentage * 10) / 10,
        totalGrades: studentGrades.length,
        attendanceRate: attendanceStats.attendanceRate,
        totalDays: attendanceStats.totalDays,
        presentDays: attendanceStats.presentDays,
        grades: studentGrades
      };
    });
  };

  const generateAdminGradeDistribution = () => {
    const allGrades = grades.filter(grade =>
      reportGrade === 'all' || students.find(s => s.id === grade.studentId)?.grade === reportGrade
    );

    const distribution = {
      'A+': allGrades.filter(g => g.score === 'A+').length,
      'A': allGrades.filter(g => g.score === 'A').length,
      'A-': allGrades.filter(g => g.score === 'A-').length,
      'B+': allGrades.filter(g => g.score === 'B+').length,
      'B': allGrades.filter(g => g.score === 'B').length,
      'B-': allGrades.filter(g => g.score === 'B-').length,
      'C+': allGrades.filter(g => g.score === 'C+').length,
      'C': allGrades.filter(g => g.score === 'C').length,
      'C-': allGrades.filter(g => g.score === 'C-').length,
      'D': allGrades.filter(g => g.score === 'D').length,
      'F': allGrades.filter(g => g.score === 'F').length,
    };

    return { distribution, total: allGrades.length };
  };

  const generateFinancialReport = () => {
    const reportStudents = reportGrade !== 'all' && reportClass !== 'all'
      ? students.filter(s => s.grade === reportGrade && s.class === reportClass)
      : students;

    const totalRevenue = finance.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingRevenue = finance.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);

    return {
      totalRevenue,
      pendingRevenue,
      totalStudents: reportStudents.length,
      paidStudents: finance.filter(f => f.status === 'Paid').length,
      pendingStudents: finance.filter(f => f.status === 'Pending').length
    };
  };




  // Get students for grade filtering
  const getGradeFilteredStudents = () => {
    if (gradeFilterGrade === 'all' || gradeFilterClass === 'all') return [];
    return students.filter(student =>
      student.grade === gradeFilterGrade && student.class === gradeFilterClass
    );
  };

  // Calculate ranking for students in a class and subject
  const getStudentRanking = (studentId: number, subject: string, term: string) => {
    const classStudents = getGradeFilteredStudents();
    const subjectGrades = grades.filter(grade =>
      grade.subject === subject &&
      grade.term === term &&
      classStudents.some(student => student.id === grade.studentId)
    );

    // Sort by percentage descending
    const sortedGrades = subjectGrades.sort((a, b) => b.percentage - a.percentage);
    const position = sortedGrades.findIndex(grade => grade.studentId === studentId) + 1;

    if (position === 0) return null;

    const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
    return `${position}${suffix}`;
  };

  // Get grades for a specific student
  const getStudentGrades = (studentId: number) => {
    return grades.filter(grade => grade.studentId === studentId)
      .sort((a, b) => new Date(b.term).getTime() - new Date(a.term).getTime());
  };

  // Filter functions
  const filteredStudents = students.filter(student => {
    // Apply text search filter
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.grade.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.class.toLowerCase().includes(studentSearch.toLowerCase());

    // Apply grade filter
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;

    // Apply class filter
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;

    return matchesSearch && matchesGrade && matchesClass;
  });

  const filteredAttendance = attendance.filter(record => {
    // Find the student to get grade and class information
    const student = students.find(s => s.name === record.studentName);

    // Apply text search filter
    const matchesSearch = record.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      record.date.includes(attendanceSearch) ||
      record.status.toLowerCase().includes(attendanceSearch.toLowerCase());

    // Apply grade filter
    const matchesGrade = attendanceGrade === 'all' || (student && student.grade === attendanceGrade);

    // Apply class filter
    const matchesClass = attendanceClass === 'all' || (student && student.class === attendanceClass);

    return matchesSearch && matchesGrade && matchesClass;
  });

  const filteredGrades = grades.filter(grade => 
    grade.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.subject.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.assignment.toLowerCase().includes(gradeSearch.toLowerCase())
  );

  const filteredFinance = finance.filter(payment => {
    // Find the student to get grade and class information
    const student = students.find(s => s.name === payment.studentName);

    // Apply text search filter
    const matchesSearch = payment.studentName.toLowerCase().includes(financeSearch.toLowerCase()) ||
      payment.description.toLowerCase().includes(financeSearch.toLowerCase()) ||
      payment.status.toLowerCase().includes(financeSearch.toLowerCase());

    // Apply grade filter
    const matchesGrade = financeGrade === 'all' || (student && student.grade === financeGrade);

    // Apply class filter
    const matchesClass = financeClass === 'all' || (student && student.class === financeClass);

    // Apply status filter
    const matchesStatus = financeStatus === 'all' || payment.status === financeStatus;

    return matchesSearch && matchesGrade && matchesClass && matchesStatus;
  });

  const filteredStaff = staff.filter(member => {
    // Apply search filter
    const matchesSearch = member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.position.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.department.toLowerCase().includes(staffSearch.toLowerCase());

    // Apply department filter
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Helper functions for finance filtering
  const getFinanceGrades = () => {
    const grades = [...new Set(students.map(student => student.grade))].sort();
    return grades;
  };

  const getFinanceClasses = () => {
    const selectedGradeStudents = financeGrade === 'all'
      ? students
      : students.filter(student => student.grade === financeGrade);
    const classes = [...new Set(selectedGradeStudents.map(student => student.class))].sort();
    return classes;
  };

  const clearFinanceFilters = () => {
    setFinanceGrade('all');
    setFinanceClass('all');
    setFinanceStatus('all');
    setFinanceSearch('');
  };

  // Helper functions for attendance filtering
  const clearAttendanceFilters = () => {
    setAttendanceGrade('all');
    setAttendanceClass('all');
    setAttendanceSearch('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Ialibu Secondary School - Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Synced v{dataStore.version}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetData}
              className="text-blue-900 border-white hover:bg-white"
            >
              Reload Sample Data
            </Button>
            <div className="text-right">
              <div className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</div>
              <div className="text-xs text-blue-100">{currentUser.position} • {currentUser.department}</div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Administrator Dashboard
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-blue-900 border-white hover:bg-white">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-blue-900 text-white min-h-screen p-4">
          <div className="space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? 'bg-white/20 text-white' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard Overview</h2>
              
              {/* Admin Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Across all grades</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgGrade.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">School-wide average</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">K{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">This academic year</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStaff}</div>
                    <p className="text-xs text-muted-foreground">Active staff members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                    <p className="text-xs text-muted-foreground">Require attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Student Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage student records, enrollments, and academic information.
                    </p>
                    <Button onClick={() => setActiveSection('students')} className="w-full">
                      Manage Students
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Financial Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Track payments, fees, and financial records for all students.
                    </p>
                    <Button onClick={() => setActiveSection('finance')} className="w-full">
                      Manage Finances
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      Staff Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage staff records, roles, and administrative functions.
                    </p>
                    <Button onClick={() => setActiveSection('staff')} className="w-full">
                      Manage Staff
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Attendance Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Monitor and manage student attendance across all grades.
                    </p>
                    <Button onClick={() => setActiveSection('attendance-records')} className="w-full">
                      View Attendance
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Academic Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Track grades, assessments, and academic progress.
                    </p>
                    <Button onClick={() => setActiveSection('grades')} className="w-full">
                      View Grades
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Reports & Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate comprehensive reports and analytics.
                    </p>
                    <Button onClick={() => setActiveSection('reports')} className="w-full">
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
                <Dialog open={studentModal.open} onOpenChange={(open) => setStudentModal(prev => ({ ...prev, open }))}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setStudentModal({ open: true, mode: 'add', data: null })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{studentModal.mode === 'add' ? 'Add New Student' : 'Edit Student'}</DialogTitle>
                    </DialogHeader>
                    <AdminStudentForm
                      mode={studentModal.mode}
                      student={studentModal.data}
                      selectedGrade={selectedGrade !== 'all' ? selectedGrade : ''}
                      selectedClass={selectedClass !== 'all' ? selectedClass : ''}
                      onSave={(student) => {
                        if (studentModal.mode === 'add') {
                          handleAddStudent(student);
                        } else {
                          handleUpdateStudent(student as Student);
                        }
                      }}
                      onCancel={() => setStudentModal({ open: false, mode: 'add', data: null })}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, grade, or class..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10 border-2 border-gray-300"
                  />
                </div>

                {/* Grade and Class Filter Row */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">Filter by:</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedGrade}
                      onValueChange={(value) => {
                        setSelectedGrade(value);
                        setSelectedClass('all'); // Reset class when grade changes
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Students" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGrade !== 'all' && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {getClassOptions(selectedGrade).map((classOption) => (
                            <SelectItem key={classOption} value={classOption}>
                              {classOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(selectedGrade !== 'all' || selectedClass !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGrade('all');
                        setSelectedClass('all');
                      }}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Parent/Guardian Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>{student.dob}</TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {student.guardianName && (
                                <div className="font-medium">{student.guardianName}</div>
                              )}
                              {student.guardianPhone && (
                                <div className="text-gray-600">{student.guardianPhone}</div>
                              )}
                              {!student.guardianName && !student.guardianPhone && (
                                <span className="text-gray-400">Not provided</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setStudentModal({ open: true, mode: 'edit', data: student })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}



          {activeSection === 'attendance-records' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {showAttendanceHistory
                      ? 'Comprehensive attendance summaries with detailed analysis for each student'
                      : 'View and search all attendance records across the school'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showAttendanceHistory ? "default" : "outline"}
                    onClick={() => setShowAttendanceHistory(!showAttendanceHistory)}
                  >
                    {showAttendanceHistory ? 'View Records' : 'View History & Analysis'}
                  </Button>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Eye className="mr-1 h-3 w-3" />
                    Admin View
                  </Badge>
                </div>
              </div>

              {!showAttendanceHistory ? (
                <div>
                  <div className="mb-6 space-y-4">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by student name, date, or status..."
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        className="pl-10 border-2 border-gray-300"
                      />
                    </div>

                    {/* Grade and Class Filter Row */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Filter by:</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={attendanceGrade}
                          onValueChange={(value) => {
                            setAttendanceGrade(value);
                            setAttendanceClass('all'); // Reset class when grade changes
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All Grades" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="Grade 9">Grade 9</SelectItem>
                            <SelectItem value="Grade 10">Grade 10</SelectItem>
                            <SelectItem value="Grade 11">Grade 11</SelectItem>
                            <SelectItem value="Grade 12">Grade 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {attendanceGrade !== 'all' && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={attendanceClass}
                            onValueChange={setAttendanceClass}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="All Classes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Classes</SelectItem>
                              {getClassOptions(attendanceGrade).map((classOption) => (
                                <SelectItem key={classOption} value={classOption}>
                                  {classOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {(attendanceGrade !== 'all' || attendanceClass !== 'all') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAttendanceGrade('all');
                            setAttendanceClass('all');
                          }}
                          className="text-xs"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Attendance Records</span>
                        <div className="text-sm font-normal text-gray-600">
                          Showing {filteredAttendance.length} of {attendance.length} records
                          {(attendanceGrade !== 'all' || attendanceClass !== 'all') && (
                            <span className="ml-2">
                              • Filtered by {attendanceGrade !== 'all' ? attendanceGrade : 'All Grades'}
                              {attendanceClass !== 'all' && ` ${attendanceClass}`}
                            </span>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAttendance.map((record) => {
                            const student = students.find(s => s.name === record.studentName);
                            return (
                              <TableRow key={record.id}>
                                <TableCell>{record.date}</TableCell>
                                <TableCell>{record.studentName}</TableCell>
                                <TableCell>{student?.grade || 'N/A'}</TableCell>
                                <TableCell>{student?.class || 'N/A'}</TableCell>
                                <TableCell>{record.subject}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      record.status === 'Present' ? 'default' :
                                      record.status === 'Absent' ? 'destructive' :
                                      'secondary'
                                    }
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{record.notes}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div>
                  {/* Instructions */}
                  <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <CalendarDays className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-800 mb-1">Comprehensive Attendance Analysis</h3>
                          <p className="text-sm text-blue-700">
                            View detailed attendance summaries for each student including attendance rates,
                            reasons for absences and late arrivals, and recent attendance patterns.
                            Select a grade and class below to begin.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grade and Class Selection for History */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium whitespace-nowrap">Select Class for Analysis:</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={historyGrade}
                            onValueChange={(value) => {
                              setHistoryGrade(value);
                              setHistoryClass('all');
                              setSelectedStudentForHistory(null);
                            }}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Select Grade</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 10">Grade 10</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                              <SelectItem value="Grade 12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {historyGrade !== 'all' && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={historyClass}
                              onValueChange={(value) => {
                                setHistoryClass(value);
                                setSelectedStudentForHistory(null);
                              }}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select Class" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Select Class</SelectItem>
                                {getClassOptions(historyGrade).map((classOption) => (
                                  <SelectItem key={classOption} value={classOption}>
                                    {classOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Message when no class selected */}
                  {(historyGrade === 'all' || historyClass === 'all') && (
                    <Card className="mt-6">
                      <CardContent className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-gray-100 rounded-full p-4">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Class to View Attendance Analysis</h3>
                            <p className="text-gray-600">
                              Choose both a grade and class from the filters above to view comprehensive
                              attendance summaries for all students in that class.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Student Attendance History */}
                  {historyGrade !== 'all' && historyClass !== 'all' && (
                    <div className="space-y-6">
                      {/* Class Summary Statistics */}
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <BarChart3 className="h-5 w-5" />
                            Class Overview - {historyGrade} {historyClass}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {(() => {
                            const classStudents = getHistoryStudents();
                            const classStats = classStudents.map(student => getStudentAttendanceStats(student.id));
                            const totalStudents = classStudents.length;
                            const avgAttendanceRate = classStats.length > 0
                              ? classStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / classStats.length
                              : 0;
                            const totalAbsences = classStats.reduce((sum, stat) => sum + stat.absentDays, 0);
                            const totalLateArrivals = classStats.reduce((sum, stat) => sum + stat.lateDays, 0);

                            return (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                                  <div className="text-sm text-gray-600">Students in Class</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{avgAttendanceRate.toFixed(1)}%</div>
                                  <div className="text-sm text-gray-600">Avg Attendance Rate</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600">{totalAbsences}</div>
                                  <div className="text-sm text-gray-600">Total Absences</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-yellow-600">{totalLateArrivals}</div>
                                  <div className="text-sm text-gray-600">Total Late Arrivals</div>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>

                      {/* Individual Student Summaries */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Individual Student Summaries
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                          {getHistoryStudents().map((student) => {
                            const stats = getStudentAttendanceStats(student.id);
                            const history = getStudentAttendanceHistory(student.id);

                            return (
                              <div key={student.id} className="border rounded-lg p-6 bg-white">
                                {/* Student Header */}
                                <div className="flex items-center justify-between mb-6">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-800">{student.name}</h4>
                                    <p className="text-sm text-gray-500">{student.grade} {student.class} • Student ID: {student.id}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
                                    <div className="text-sm text-gray-500">Attendance Rate</div>
                                  </div>
                                </div>

                                {/* Main Statistics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-700">{stats.totalDays}</div>
                                    <div className="text-sm text-gray-500">Total Days Recorded</div>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
                                    <div className="text-sm text-gray-500">Days Present</div>
                                  </div>
                                  <div className="bg-red-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
                                    <div className="text-sm text-gray-500">Days Absent</div>
                                  </div>
                                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
                                    <div className="text-sm text-gray-500">Days Late</div>
                                  </div>
                                </div>

                                {/* Reasons for Absences and Late Arrivals */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  {/* Absence Reasons */}
                                  <div className="bg-red-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                                      <X className="h-4 w-4 mr-2" />
                                      Absence Reasons ({stats.absentDays} total)
                                    </h5>
                                    {Object.keys(stats.absenceReasons).length > 0 ? (
                                      <div className="space-y-2">
                                        {Object.entries(stats.absenceReasons).map(([reason, count]) => (
                                          <div key={reason} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{reason}</span>
                                            <Badge variant="destructive" className="text-xs">
                                              {count} {count === 1 ? 'day' : 'days'}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600 italic">No absences recorded</p>
                                    )}
                                  </div>

                                  {/* Late Reasons */}
                                  <div className="bg-yellow-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                                      <Clock className="h-4 w-4 mr-2" />
                                      Late Arrival Reasons ({stats.lateDays} total)
                                    </h5>
                                    {Object.keys(stats.lateReasons).length > 0 ? (
                                      <div className="space-y-2">
                                        {Object.entries(stats.lateReasons).map(([reason, count]) => (
                                          <div key={reason} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{reason}</span>
                                            <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                                              {count} {count === 1 ? 'time' : 'times'}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600 italic">No late arrivals recorded</p>
                                    )}
                                  </div>
                                </div>

                                {/* Recent Attendance Pattern */}
                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    Recent Attendance Pattern (Last 10 Days)
                                  </h5>
                                  {stats.recentPattern.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {stats.recentPattern.map((record, index) => (
                                        <div
                                          key={index}
                                          className={`px-3 py-2 rounded-lg border text-xs font-medium ${
                                            record.status === 'Present'
                                              ? 'bg-green-100 text-green-800 border-green-200'
                                              : record.status === 'Absent'
                                              ? 'bg-red-100 text-red-800 border-red-200'
                                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                          }`}
                                          title={`${record.date} - ${record.subject}${record.notes ? ': ' + record.notes : ''}`}
                                        >
                                          <div className="font-semibold">{record.date}</div>
                                          <div>{record.status}</div>
                                          {record.notes && (
                                            <div className="text-xs opacity-75 mt-1">{record.notes}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600 italic">No recent attendance records</p>
                                  )}
                                </div>

                                {/* Detailed Attendance Records */}
                                <div className="mt-6 border-t pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-gray-800 flex items-center">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Complete Attendance History
                                    </h5>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedStudentForHistory(
                                        selectedStudentForHistory === student.id ? null : student.id
                                      )}
                                    >
                                      {selectedStudentForHistory === student.id ? 'Hide Records' : 'View All Records'}
                                    </Button>
                                  </div>

                                  {selectedStudentForHistory === student.id && (
                                    <div className="mt-4 max-h-60 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Notes</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {history.slice(0, 15).map((record) => (
                                            <TableRow key={record.id}>
                                              <TableCell>{record.date}</TableCell>
                                              <TableCell>
                                                <Badge
                                                  variant={
                                                    record.status === 'Present' ? 'default' :
                                                    record.status === 'Absent' ? 'destructive' :
                                                    'secondary'
                                                  }
                                                >
                                                  {record.status}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{record.subject}</TableCell>
                                              <TableCell>{record.notes || '-'}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      {history.length > 15 && (
                                        <p className="text-sm text-gray-500 mt-2 text-center">
                                          Showing last 15 records of {history.length} total
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'grades' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Academic Performance</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Eye className="mr-1 h-3 w-3" />
                  View Only
                </Badge>
              </div>

              <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name, subject, or assignment..."
                    value={gradeSearch}
                    onChange={(e) => setGradeSearch(e.target.value)}
                    className="pl-10 border-2 border-gray-300"
                  />
                </div>

                {/* Grade and Class Filter Row */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">Filter by:</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={gradeFilterGrade}
                      onValueChange={(value) => {
                        setGradeFilterGrade(value);
                        setGradeFilterClass('all');
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Students" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {gradeFilterGrade !== 'all' && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={gradeFilterClass}
                        onValueChange={setGradeFilterClass}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {getClassOptions(gradeFilterGrade).map((classOption) => (
                            <SelectItem key={classOption} value={classOption}>
                              {classOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(gradeFilterGrade !== 'all' || gradeFilterClass !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGradeFilterGrade('all');
                        setGradeFilterClass('all');
                      }}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Student-based Grade View */}
              {gradeFilterGrade !== 'all' && gradeFilterClass !== 'all' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Students in {gradeFilterGrade} {gradeFilterClass}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {getGradeFilteredStudents().map((student) => {
                        const studentGrades = getStudentGrades(student.id);
                        return (
                          <div key={student.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-gray-500">{student.grade} {student.class}</p>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStudentForGrade(
                                  selectedStudentForGrade === student.id ? null : student.id
                                )}
                              >
                                {selectedStudentForGrade === student.id ? 'Hide Grades' : 'View Grades'}
                              </Button>
                            </div>

                            {selectedStudentForGrade === student.id && (
                              <div className="mt-4">
                                {studentGrades.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Ranking</TableHead>
                                        <TableHead>Term</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {studentGrades.map((grade) => (
                                        <TableRow key={grade.id}>
                                          <TableCell>{grade.subject}</TableCell>
                                          <TableCell>{grade.assignment}</TableCell>
                                          <TableCell>{grade.score}</TableCell>
                                          <TableCell>{grade.percentage}%</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {getStudentRanking(student.id, grade.subject, grade.term) || 'N/A'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{grade.term}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No grades recorded for this student</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Term</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGrades.map((grade) => (
                          <TableRow key={grade.id}>
                            <TableCell>{grade.studentName}</TableCell>
                            <TableCell>{grade.subject}</TableCell>
                            <TableCell>{grade.assignment}</TableCell>
                            <TableCell>{grade.score}</TableCell>
                            <TableCell>{grade.percentage}%</TableCell>
                            <TableCell>{grade.term}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeSection === 'finance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">School Fees Management</h2>
                <Dialog open={financeModal.open} onOpenChange={(open) => setFinanceModal(prev => ({ ...prev, open }))}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setFinanceModal({ open: true, mode: 'add', data: null })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{financeModal.mode === 'add' ? 'Add Payment' : 'Edit Payment'}</DialogTitle>
                    </DialogHeader>
                    <FinanceForm
                      mode={financeModal.mode}
                      finance={financeModal.data}
                      students={students}
                      onSave={(finance) => {
                        if (financeModal.mode === 'add') {
                          handleAddFinance(finance);
                        } else {
                          handleUpdateFinance(finance as Finance);
                        }
                      }}
                      onCancel={() => setFinanceModal({ open: false, mode: 'add', data: null })}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Enhanced Filter Interface */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Filter by:</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFinanceFilters}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Clear Filters
                      </Button>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-3 items-center">
                      {/* Grade Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Grade:</span>
                        <Select value={financeGrade} onValueChange={setFinanceGrade}>
                          <SelectTrigger className="w-32 h-9 border-2 border-gray-300 rounded-lg">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            {getFinanceGrades().map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Class Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Class:</span>
                        <Select value={financeClass} onValueChange={setFinanceClass}>
                          <SelectTrigger className="w-24 h-9 border-2 border-gray-300 rounded-lg">
                            <SelectValue placeholder="Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {getFinanceClasses().map((classOption) => (
                              <SelectItem key={classOption} value={classOption}>
                                {classOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <Select value={financeStatus} onValueChange={setFinanceStatus}>
                          <SelectTrigger className="w-28 h-9 border-2 border-gray-300 rounded-lg">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search student name or description..."
                        value={financeSearch}
                        onChange={(e) => setFinanceSearch(e.target.value)}
                        className="pl-10 border-2 border-gray-300"
                      />
                    </div>

                    {/* Active Filters Display */}
                    {(financeGrade !== 'all' || financeClass !== 'all' || financeStatus !== 'all' || financeSearch) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        {financeGrade !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {financeGrade}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setFinanceGrade('all')}
                            />
                          </Badge>
                        )}
                        {financeClass !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Class {financeClass}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setFinanceClass('all')}
                            />
                          </Badge>
                        )}
                        {financeStatus !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {financeStatus}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setFinanceStatus('all')}
                            />
                          </Badge>
                        )}
                        {financeSearch && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            "{financeSearch}"
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setFinanceSearch('')}
                            />
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Results Summary */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-800">
                      Showing {filteredFinance.length} of {finance.length} records
                    </span>
                    {financeGrade !== 'all' && financeClass !== 'all' && (
                      <span className="text-sm text-blue-600">
                        for {financeGrade} {financeClass}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      Paid: {filteredFinance.filter(p => p.status === 'Paid').length}
                    </span>
                    <span className="text-orange-600 font-medium">
                      Pending: {filteredFinance.filter(p => p.status === 'Pending').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Students List */}
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Grade/Class</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFinance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No financial records found for the selected filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFinance.map((payment) => {
                          const student = students.find(s => s.name === payment.studentName);
                          return (
                            <TableRow key={payment.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{payment.studentName}</TableCell>
                              <TableCell>
                                {student && (
                                  <div className="text-sm">
                                    <div className="font-medium">{student.grade}</div>
                                    <div className="text-gray-500">{student.class}</div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{payment.description}</TableCell>
                              <TableCell className="font-semibold">K{payment.amount.toFixed(2)}</TableCell>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={payment.status === 'Paid' ? 'default' : 'secondary'}
                                  className={payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFinanceModal({ open: true, mode: 'edit', data: payment })}
                                    className="h-8"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteFinance(payment.id)}
                                    className="h-8"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  {payment.status === 'Pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const updatedPayment = { ...payment, status: 'Paid' as const };
                                        handleUpdateFinance(updatedPayment);
                                      }}
                                      className="h-8 bg-green-600 hover:bg-green-700"
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'staff' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
                <Dialog open={staffModal.open} onOpenChange={(open) => setStaffModal(prev => ({ ...prev, open }))}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setStaffModal({ open: true, mode: 'add', data: null })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff {selectedDepartment !== 'all' && `to ${selectedDepartment}`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{staffModal.mode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}</DialogTitle>
                    </DialogHeader>
                    <StaffForm
                      mode={staffModal.mode}
                      staff={staffModal.data}
                      preselectedDepartment={selectedDepartment}
                      onSave={(staff) => {
                        if (staffModal.mode === 'add') {
                          handleAddStaff(staff);
                        } else {
                          handleUpdateStaff(staff as Staff);
                        }
                      }}
                      onCancel={() => setStaffModal({ open: false, mode: 'add', data: null })}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Department Filter Buttons */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-gray-700">Filter by Department:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDepartment === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment('all')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    All Departments
                  </Button>
                  <Button
                    variant={selectedDepartment === 'Admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment('Admin')}
                    className="flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4" />
                    Admin
                  </Button>
                  <Button
                    variant={selectedDepartment === 'Science' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment('Science')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Science
                  </Button>
                  <Button
                    variant={selectedDepartment === 'Social Science' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment('Social Science')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Social Science
                  </Button>
                  <Button
                    variant={selectedDepartment === 'Business' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDepartment('Business')}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Business
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, position, or department..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="pl-10 border-2 border-gray-300"
                  />
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.id}</TableCell>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.position}</TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setStaffModal({ open: true, mode: 'edit', data: member })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteStaff(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Student Reports (Inherited from Staff)</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Live Data from Staff
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Eye className="mr-1 h-3 w-3" />
                    Admin View-Only
                  </Badge>
                </div>
              </div>

              {/* Live Data Info */}
              <Card className="mb-6 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">Live Staff Data Integration</h4>
                      <p className="text-sm text-green-700">
                        These reports are automatically inherited from the Staff Dashboard. Any changes made by staff appear here instantly as view-only data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filter Student Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium whitespace-nowrap">Filter by:</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={reportGrade}
                        onValueChange={(value) => {
                          setReportGrade(value);
                          setReportClass('all');
                        }}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="All Students" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {reportGrade !== 'all' && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={reportClass}
                          onValueChange={setReportClass}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="All Classes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {getClassOptions(reportGrade).map((classOption) => (
                              <SelectItem key={classOption} value={classOption}>
                                {classOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {reports.length} Reports Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Student Reports from Staff Dashboard */}
              <div className="grid gap-6">
                {/* Student Reports from Staff Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Student Reports (Inherited from Staff - View Only)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-4">
                        Comprehensive performance analysis for {reportGrade !== 'all' && reportClass !== 'all' ? `${reportGrade} ${reportClass}` : 'all students'}.
                      </p>

                      {selectedReportType === 'performance' ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">Performance Summary (Admin View)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {generateAdminStudentPerformanceReport().map((student) => (
                                <div key={student.id} className="bg-white p-3 rounded border">
                                  <h5 className="font-medium">{student.name}</h5>
                                  <p className="text-sm text-gray-600">{student.grade} {student.class}</p>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Average Grade:</span>
                                      <span className="font-medium">{student.averageGrade}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Total Assessments:</span>
                                      <span>{student.totalGrades}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Attendance Rate:</span>
                                      <span>{student.attendanceRate}%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedReportType('performance')}
                          className="w-full"
                        >
                          Generate Performance Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Distribution Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Grade Distribution Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-4">
                        School-wide grade distribution for {reportGrade !== 'all' ? reportGrade : 'all grades'}.
                      </p>

                      {selectedReportType === 'distribution' ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">Grade Distribution (School-wide)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(generateAdminGradeDistribution().distribution).map(([grade, count]) => (
                                <div key={grade} className="bg-white p-3 rounded border text-center">
                                  <div className="font-semibold text-lg">{count}</div>
                                  <div className="text-sm text-gray-600">Grade {grade}</div>
                                  <div className="text-xs text-gray-500">
                                    {generateAdminGradeDistribution().total > 0
                                      ? Math.round((count / generateAdminGradeDistribution().total) * 100)
                                      : 0}%
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-center">
                              <span className="text-sm text-gray-600">
                                Total Assessments: {generateAdminGradeDistribution().total}
                              </span>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedReportType('distribution')}
                          className="w-full"
                        >
                          Generate Distribution Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-4">
                        Comprehensive financial overview including revenue and outstanding payments.
                      </p>

                      {selectedReportType === 'financial' ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">Financial Overview</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded border">
                                <h5 className="font-medium text-green-600">Total Revenue</h5>
                                <p className="text-2xl font-bold">K{generateFinancialReport().totalRevenue.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">{generateFinancialReport().paidStudents} students paid</p>
                              </div>
                              <div className="bg-white p-4 rounded border">
                                <h5 className="font-medium text-yellow-600">Pending Payments</h5>
                                <p className="text-2xl font-bold">K{generateFinancialReport().pendingRevenue.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">{generateFinancialReport().pendingStudents} students pending</p>
                              </div>
                              <div className="bg-white p-4 rounded border">
                                <h5 className="font-medium text-blue-600">Collection Rate</h5>
                                <p className="text-2xl font-bold">
                                  {generateFinancialReport().totalRevenue + generateFinancialReport().pendingRevenue > 0
                                    ? Math.round((generateFinancialReport().totalRevenue / (generateFinancialReport().totalRevenue + generateFinancialReport().pendingRevenue)) * 100)
                                    : 0}%
                                </p>
                                <p className="text-sm text-gray-600">Payment collection rate</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedReportType('financial')}
                          className="w-full"
                        >
                          Generate Financial Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Summary Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Attendance Summary Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-4">
                        School-wide attendance analysis for {reportGrade !== 'all' && reportClass !== 'all' ? `${reportGrade} ${reportClass}` : 'all students'}.
                      </p>

                      {selectedReportType === 'attendance' ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">Attendance Overview (Admin View)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {generateAdminStudentPerformanceReport().map((student) => (
                                <div key={student.id} className="bg-white p-3 rounded border">
                                  <h5 className="font-medium">{student.name}</h5>
                                  <p className="text-sm text-gray-600">{student.grade} {student.class}</p>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Attendance Rate:</span>
                                      <span className={`font-medium ${
                                        student.attendanceRate >= 90 ? 'text-green-600' :
                                        student.attendanceRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>{student.attendanceRate}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Present Days:</span>
                                      <span>{student.presentDays}/{student.totalDays}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedReportType('attendance')}
                          className="w-full"
                        >
                          Generate Attendance Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Eye className="mr-1 h-3 w-3" />
                  Admin Access
                </Badge>
              </div>

              {/* Add User Button */}
              <div className="flex justify-between items-center mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 border-2 border-gray-300"
                  />
                </div>
                <Dialog open={userModal.open} onOpenChange={(open) => setUserModal({ ...userModal, open })}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setUserModal({ open: true, mode: 'add', data: null })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{userModal.mode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
                    </DialogHeader>
                    <UserForm
                      mode={userModal.mode}
                      data={userModal.data}
                      onSave={userModal.mode === 'add' ? handleAddUser : handleUpdateUser}
                      onCancel={() => setUserModal({ open: false, mode: 'add', data: null })}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>User Type</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subjects</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter(user =>
                            userSearch === '' ||
                            user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                            user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
                            user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
                            user.email.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.firstName} {user.lastName}
                              </TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.userType === 'admin' ? 'destructive' : 'secondary'}>
                                  {user.userType === 'admin' ? 'Administrator' : 'Staff'}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.department || 'N/A'}</TableCell>
                              <TableCell>
                                {user.userType === 'staff' && (user.assignedClasses && user.assignedClasses.length > 0) ? (
                                  <div className="flex flex-wrap gap-1">
                                    {user.assignedClasses.map((cls) => (
                                      <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.userType === 'staff' && (user.assignedSubjects && user.assignedSubjects.length > 0) ? (
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {user.assignedSubjects.slice(0,3).map((subj, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {subj.length > 14 ? subj.substring(0, 14) + '...' : subj}
                                      </Badge>
                                    ))}
                                    {user.assignedSubjects.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{user.assignedSubjects.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.isActive ? (
                                  user.mustSetPassword ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Activation</Badge>
                                  ) : (
                                    <Badge variant="default">Active</Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString()
                                  : 'Never'
                                }
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUserModal({ open: true, mode: 'edit', data: user })}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {user.id !== currentUser?.id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Admin Student Form Component (with more fields than staff version)
function AdminStudentForm({
  mode,
  student,
  selectedGrade,
  selectedClass,
  onSave,
  onCancel
}: {
  mode: 'add' | 'edit';
  student: Student | null;
  selectedGrade?: string;
  selectedClass?: string;
  onSave: (student: Omit<Student, 'id'> | Student) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      name: '',
      grade: selectedGrade || '',
      class: selectedClass || '',
      dob: '',
      gender: '',
      address: '',
      email: '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
    }
  );

  // Generate class options based on selected grade in form
  const getFormClassOptions = (grade: string) => {
    if (!grade) return [];
    const gradeNumber = grade.replace('Grade ', '');
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => `${gradeNumber}${letter}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.grade && formData.class && formData.dob && formData.gender && formData.address) {
      onSave(mode === 'edit' ? formData as Student : formData as Omit<Student, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Student Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Grade 9">Grade 9</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.class || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {formData.grade ? (
                getFormClassOptions(formData.grade).map((classOption) => (
                  <SelectItem key={classOption} value={classOption}>
                    {classOption}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-grade" disabled>
                  Select Grade First
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      {/* Guardian Contact Information */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Parent/Guardian Contact Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input
              id="guardianName"
              value={formData.guardianName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
              placeholder="Parent or guardian name"
            />
          </div>
          <div>
            <Label htmlFor="guardianPhone">Guardian Phone</Label>
            <Input
              id="guardianPhone"
              value={formData.guardianPhone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
              placeholder="Guardian phone number"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Add Student' : 'Update Student'}
        </Button>
      </div>
    </form>
  );
}

// Attendance Form Component (reused from staff dashboard)
function AttendanceForm({ 
  mode, 
  attendance, 
  students,
  onSave, 
  onCancel 
}: { 
  mode: 'add' | 'edit'; 
  attendance: Attendance | null; 
  students: Student[];
  onSave: (attendance: Omit<Attendance, 'id'> | Attendance) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<Partial<Attendance>>(
    attendance || {
      date: new Date().toISOString().split('T')[0],
      studentId: 0,
      studentName: '',
      status: 'Present',
      subject: 'Mathematics',
      notes: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.studentId && formData.status && formData.subject) {
      const selectedStudent = students.find(s => s.id === formData.studentId);
      const attendanceData = {
        ...formData,
        studentName: selectedStudent?.name || '',
      };
      onSave(mode === 'edit' ? attendanceData as Attendance : attendanceData as Omit<Attendance, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="student">Student</Label>
        <Select
          value={formData.studentId?.toString() || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.name} ({student.grade} {student.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status || ''}
          onValueChange={(value: 'Present' | 'Absent' | 'Late') => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Present">Present</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
            <SelectItem value="Late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={formData.subject || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Biology">Biology</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="History">History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Record Attendance' : 'Update Attendance'}
        </Button>
      </div>
    </form>
  );
}

// Grade Form Component (reused from staff dashboard)
function GradeForm({ 
  mode, 
  grade, 
  students,
  onSave, 
  onCancel 
}: { 
  mode: 'add' | 'edit'; 
  grade: Grade | null; 
  students: Student[];
  onSave: (grade: Omit<Grade, 'id'> | Grade) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<Partial<Grade>>(
    grade || {
      studentId: 0,
      studentName: '',
      subject: 'Mathematics',
      score: '',
      percentage: 0,
      term: 'Term 1',
      assignment: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentId && formData.subject && formData.score && formData.percentage && formData.term && formData.assignment) {
      const selectedStudent = students.find(s => s.id === formData.studentId);
      const gradeData = {
        ...formData,
        studentName: selectedStudent?.name || '',
      };
      onSave(mode === 'edit' ? gradeData as Grade : gradeData as Omit<Grade, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student">Student</Label>
        <Select
          value={formData.studentId?.toString() || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.name} ({student.grade} {student.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={formData.subject || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Biology">Biology</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="History">History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignment">Assignment/Exam</Label>
        <Input
          id="assignment"
          value={formData.assignment || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, assignment: e.target.value }))}
          placeholder="e.g., Midterm Exam, Quiz 1, Final Project"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="score">Letter Grade</Label>
          <Select
            value={formData.score || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, score: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="UP">UP</SelectItem>
              <SelectItem value="P">P</SelectItem>
              <SelectItem value="F">F</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="percentage">Percentage</Label>
          <Input
            id="percentage"
            type="number"
            min="0"
            max="100"
            value={formData.percentage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="term">Term</Label>
        <Select
          value={formData.term || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Term 1">Term 1</SelectItem>
            <SelectItem value="Term 2">Term 2</SelectItem>
            <SelectItem value="Term 3">Term 3</SelectItem>
            <SelectItem value="Term 4">Term 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Add Grade' : 'Update Grade'}
        </Button>
      </div>
    </form>
  );
}

// Finance Form Component
function FinanceForm({ 
  mode, 
  finance, 
  students,
  onSave, 
  onCancel 
}: { 
  mode: 'add' | 'edit'; 
  finance: Finance | null; 
  students: Student[];
  onSave: (finance: Omit<Finance, 'id'> | Finance) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<Partial<Finance>>(
    finance || {
      studentId: 0,
      studentName: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      description: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentId && formData.amount && formData.date && formData.status && formData.description) {
      const selectedStudent = students.find(s => s.id === formData.studentId);
      const financeData = {
        ...formData,
        studentName: selectedStudent?.name || '',
      };
      onSave(mode === 'edit' ? financeData as Finance : financeData as Omit<Finance, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student">Student</Label>
        <Select
          value={formData.studentId?.toString() || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.name} ({student.grade} {student.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., School Fees - Term 1, Book Fees"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (K)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status || ''}
          onValueChange={(value: 'Paid' | 'Pending') => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Add Payment' : 'Update Payment'}
        </Button>
      </div>
    </form>
  );
}

// Staff Form Component
function StaffForm({
  mode,
  staff,
  preselectedDepartment,
  onSave,
  onCancel
}: {
  mode: 'add' | 'edit';
  staff: Staff | null;
  preselectedDepartment?: string;
  onSave: (staff: Omit<Staff, 'id'> | Staff) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Staff>>(
    staff || {
      name: '',
      position: '',
      department: preselectedDepartment && preselectedDepartment !== 'all' ? preselectedDepartment : '',
      email: '',
      phone: '',
      salary: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.position && formData.department && formData.email && formData.phone) {
      onSave(mode === 'edit' ? formData as Staff : formData as Omit<Staff, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          placeholder="e.g., Math Teacher, Principal"
          required
        />
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Select
          value={formData.department || ''}
          onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Social Science">Social Science</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="salary">Salary (K)</Label>
        <Input
          id="salary"
          type="number"
          min="0"
          value={formData.salary || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Add Staff Member' : 'Update Staff Member'}
        </Button>
      </div>
    </form>
  );
}

// User Form Component for Admin
function UserForm({
  mode,
  data,
  onSave,
  onCancel
}: {
  mode: 'add' | 'edit';
  data: User | null;
  onSave: (user: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<User>>(
    data || {
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      userType: 'staff',
      department: '',
      position: '',
      isActive: true,
      permissions: ['students', 'attendance', 'grades', 'reports'],
      assignedClasses: [],
      assignedSubjects: [],
      allowCrossClass: false
    }
  );

  const [subjectsOpen, setSubjectsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !/@ialibu\.edu\.pg$/i.test(formData.email)) {
      alert('Email must be a valid ialibu.edu.pg address');
      return;
    }
    if (formData.username && formData.email && formData.firstName && formData.lastName) {
      onSave(mode === 'edit' ? formData as User : formData as Omit<User, 'id' | 'createdAt'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
          disabled={mode === 'edit'}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      {mode === 'add' && (
        <div>
          <Label htmlFor="password">Password (optional)</Label>
          <Input
            id="password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            minLength={6}
            placeholder="Leave blank to generate a registration code"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            placeholder="e.g., Science, Mathematics"
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="e.g., Teacher, Head of Department"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="userType">User Type</Label>
        <Select
          value={formData.userType || 'staff'}
          onValueChange={(value: 'admin' | 'staff') => setFormData(prev => ({
            ...prev,
            userType: value,
            permissions: value === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports']
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff Member</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.userType === 'staff' && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold">Teacher Permissions</h4>
          <div>
            <Label>Assigned Classes</Label>
            <div className="grid grid-cols-4 gap-2 mt-2 max-h-40 overflow-auto border p-2 rounded">
              {[9,10,11,12].flatMap(g => ['A','B','C','D','E','F','G','H'].map(l => `${g}${l}`)).map(code => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(formData.assignedClasses || []).includes(code)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        assignedClasses: checked
                          ? ([...(prev.assignedClasses || []), code])
                          : (prev.assignedClasses || []).filter(c => c !== code)
                      }));
                    }}
                  />
                  {code}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Assigned Subjects</Label>
            <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-3" onMouseDown={(e) => e.stopPropagation()} onClick={() => setSubjectsOpen((o) => !o)}>
                  {(formData.assignedSubjects || []).length > 0
                    ? `Selected: ${(formData.assignedSubjects || []).length}`
                    : 'Select Subjects'}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 max-h-64 overflow-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-2 mb-3" onMouseDownCapture={(e) => e.stopPropagation()}>
                  {[ 'Mathematics','English','Science','Social Science','Business Studies','Information Technology','Arts','Personal Development','Language and Literature','General Mathematics','Biology','Chemistry','Physics','Economics','Geography','History','Environment','Political Science','Legal Studies','Accounting','Tourism Studies','Computer Studies','Design and Technology','Construction','Food Technology','Textile Technology','Applied Science','Geology','Information and Communication Technology (ICT)' ].map(subj => (
                    <label key={subj} className="flex items-center gap-2 text-sm select-none">
                      <input
                        type="checkbox"
                        checked={(formData.assignedSubjects || []).includes(subj)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            assignedSubjects: checked
                              ? ([...(prev.assignedSubjects || []), subj])
                              : (prev.assignedSubjects || []).filter(s => s !== subj)
                          }));
                        }}
                      />
                      {subj}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onMouseDown={(e) => e.stopPropagation()} onClick={() => setFormData(prev => ({ ...prev, assignedSubjects: [] }))}>Clear</Button>
                  <Button type="button" size="sm" onMouseDown={(e) => e.stopPropagation()} onClick={() => setSubjectsOpen(false)}>Done</Button>
                </div>
              </PopoverContent>
            </Popover>
            {(formData.assignedSubjects || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(formData.assignedSubjects || []).map((s, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="allowCrossClass"
              type="checkbox"
              checked={!!formData.allowCrossClass}
              onChange={(e) => setFormData(prev => ({ ...prev, allowCrossClass: e.target.checked }))}
            />
            <Label htmlFor="allowCrossClass">Allow cross-class access</Label>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div>
          <Label htmlFor="isActive">Account Status</Label>
          <Select
            value={formData.isActive ? 'active' : 'inactive'}
            onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === 'add' ? 'Add User' : 'Update User'}
        </Button>
      </div>
    </form>
  );
}
