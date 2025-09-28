import { useState, useEffect, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/hooks/useDataStore';
import { useAuth } from '@/hooks/useAuth';
import { type Student, type Attendance, type Grade, type StudentReport } from '@/lib/dataStore';
import {
  Users,
  UserCheck,
  TrendingUp,
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
  Download,
  BarChart3,
  PieChart,
  FileBarChart,
  BookOpen,
  GraduationCap,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dataStore = useDataStore();
  const { currentUser, isAuthenticated, logout, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Redirect if not authenticated or not staff
  useEffect(() => {
    if (!loading && (!isAuthenticated || (currentUser && currentUser.userType !== 'staff'))) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, loading, navigate]);

  // Search states
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');

  // Student filter states
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Attendance interface states
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [attendanceGrade, setAttendanceGrade] = useState('all');
  const [attendanceClass, setAttendanceClass] = useState('all');
  const [attendanceRecords, setAttendanceRecords] = useState<{[studentId: number]: {status: 'Present' | 'Absent' | 'Late', notes: string}}>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<number | null>(null);

  // Grade filter states
  const [gradeFilterGrade, setGradeFilterGrade] = useState('all');
  const [gradeFilterClass, setGradeFilterClass] = useState('all');
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<number | null>(null);

  // Grade form states
  const [showBatchGradeForm, setShowBatchGradeForm] = useState(false);
  const [individualGradeModal, setIndividualGradeModal] = useState({ open: false, student: null as Student | null });

  // Subject management states
  const [subjectModal, setSubjectModal] = useState({ open: false, student: null as Student | null });
  const [selectedStudentSubjects, setSelectedStudentSubjects] = useState<string[]>([]);

  // Report management states
  const [reportSearch, setReportSearch] = useState('');
  const [reportModal, setReportModal] = useState({ open: false, mode: 'add', data: null as StudentReport | null, student: null as Student | null });
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // Get available subjects based on grade
  const getAvailableSubjects = (grade: string) => {
    const gradeNumber = parseInt(grade.replace('Grade ', ''));
    if (gradeNumber >= 9 && gradeNumber <= 10) {
      return lowerSecondarySubjects;
    } else if (gradeNumber >= 11 && gradeNumber <= 12) {
      return upperSecondarySubjects;
    }
    return [];
  };

  // Report states
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportGrade, setReportGrade] = useState('all');
  const [reportClass, setReportClass] = useState('all');
  const [emailAddress, setEmailAddress] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [studentModal, setStudentModal] = useState({ open: false, mode: 'add', data: null as Student | null });
  const [attendanceModal, setAttendanceModal] = useState({ open: false, mode: 'add', data: null as Attendance | null });
  const [gradeModal, setGradeModal] = useState({ open: false, mode: 'add', data: null as Grade | null });

  // Subject definitions by grade level
  const lowerSecondarySubjects = [
    'English',
    'Mathematics',
    'Science',
    'Social Science',
    'Business Studies',
    'Personal Development',
    'Religious Education',
    'Arts',
    'Information Technology',
    'Technology & Industrial Arts',
    'Family and Consumer Studies'
  ];

  const upperSecondarySubjects = [
    'Language and Literature',
    'General Mathematics',
    'Personal Development',
    'Religious Education',
    'Biology',
    'Chemistry',
    'Physics',
    'Geology',
    'Applied Science',
    'Advanced Mathematics',
    'Economics',
    'Geography',
    'History',
    'Environment',
    'Political Science',
    'Legal Studies',
    'Business Studies',
    'Accounting',
    'Tourism Studies',
    'Information and Communication Technology (ICT)',
    'Computer Studies',
    'Design and Technology',
    'Construction',
    'Food Technology',
    'Textile Technology'
  ];

  // For staff dashboard, show all students (in real implementation, this would be filtered by assigned classes)
  // Apply teacher permissions: class-level and subject mapping
  const assignedClasses = (currentUser && 'assignedClasses' in currentUser) ? (currentUser as any).assignedClasses || [] : [];
  const assignedSubjects = (currentUser && 'assignedSubjects' in currentUser) ? (currentUser as any).assignedSubjects || [] : [];
  const allowCrossClass = (currentUser && 'allowCrossClass' in currentUser) ? !!(currentUser as any).allowCrossClass : false;

  const myStudents = (dataStore.students || []).filter(s => {
    if (!currentUser || currentUser.userType !== 'staff') return true;
    if (allowCrossClass) return true;
    if (!assignedClasses || assignedClasses.length === 0) return false;
    return assignedClasses.includes(s.class);
  });
  const myAttendance = (dataStore.attendance || []).filter(a => {
    if (!currentUser || currentUser.userType !== 'staff') return true;
    if (allowCrossClass) return true;
    const student = (dataStore.students || []).find(s => s.id === a.studentId);
    return student ? assignedClasses.includes(student.class) : false;
  });
  const myGrades = (dataStore.grades || []).filter(g => {
    if (!currentUser || currentUser.userType !== 'staff') return true;
    const classCode = g.class;
    const subject = g.subject;
    const classOk = allowCrossClass || (assignedClasses && assignedClasses.includes(classCode));
    const subjectOk = assignedSubjects.length === 0 || assignedSubjects.includes(subject);
    return classOk && subjectOk;
  });
  const myReports = dataStore.reports || [];

  // Calculate stats dynamically
  const stats = {
    myStudents: myStudents.length,
    avgGrade: myGrades.length > 0 ? myGrades.reduce((sum, grade) => sum + grade.totalMarks, 0) / myGrades.length : 0,
    attendanceRate: myAttendance.length > 0 ? (myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100 : 0,
    assignedClasses: assignedClasses ? assignedClasses.length : 0
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

  // Debug data loading
  console.log('DataStore Debug:', {
    studentsCount: myStudents.length,
    gradesCount: myGrades.length,
    attendanceCount: myAttendance.length,
    version: dataStore.version,
    grades: (myGrades || []).slice(0, 3) // Show first 3 grades
  });

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

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Take Attendance', icon: UserCheck },
    { id: 'grades', label: 'Grades', icon: TrendingUp },
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
    toast({ title: 'Success', description: 'Student removed from your classes' });
  };

  // CRUD Functions for Attendance
  const handleAddAttendance = (attendance: Omit<Attendance, 'id'>) => {
    dataStore.addAttendance(attendance);
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

  // Report CRUD Functions
  const handleAddReport = (report: Omit<StudentReport, 'id'>) => {
    dataStore.addReport(report);
    toast({ title: 'Success', description: 'Student report created successfully' });
    setReportModal({ open: false, mode: 'add', data: null, student: null });
  };

  const handleUpdateReport = (report: StudentReport) => {
    dataStore.updateReport(report);
    toast({ title: 'Success', description: 'Student report updated successfully' });
    setReportModal({ open: false, mode: 'add', data: null, student: null });
  };

  const handleDeleteReport = (reportId: number) => {
    dataStore.deleteReport(reportId);
    toast({ title: 'Success', description: 'Student report deleted successfully' });
  };

  // Subject management functions
  const handleUpdateStudentSubjects = (studentId: number, newSubjects: string[]) => {
    if (newSubjects.length > 10) {
      toast({ title: 'Error', description: 'Maximum 10 subjects allowed per student' });
      return;
    }

    if (newSubjects.length < 7) {
      toast({ title: 'Warning', description: 'Students should have at least 7 subjects' });
    }

    const student = (myStudents || []).find(s => s.id === studentId);
    if (student) {
      dataStore.updateStudent({ ...student, subjects: newSubjects });
    }

    toast({
      title: 'Success',
      description: `Student subjects updated. Total: ${newSubjects.length} subjects`
    });
    setSubjectModal({ open: false, student: null });
  };

  const openSubjectModal = (student: Student) => {
    setSelectedStudentSubjects([...(student.subjects || [])]);
    setSubjectModal({ open: true, student });
  };

  const toggleSubject = (subject: string) => {
    setSelectedStudentSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        if (prev.length >= 10) {
          toast({ title: 'Limit Reached', description: 'Maximum 10 subjects allowed' });
          return prev;
        }
        return [...prev, subject];
      }
    });
  };

  // New attendance functions
  const handleAttendanceStatusChange = (studentId: number, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        status,
        notes: prev[studentId]?.notes || ''
      }
    }));
  };

  const handleAttendanceNotesChange = (studentId: number, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Present',
        notes
      }
    }));
  };

  const handleSubmitAttendance = () => {
    const dateStr = format(attendanceDate, 'yyyy-MM-dd');

    // First, remove existing attendance records for this date
    const existingRecords = myAttendance.filter(a => a.date === dateStr);
    existingRecords.forEach(record => dataStore.deleteAttendance(record.id));

    // Then add new attendance records
    Object.entries(attendanceRecords).forEach(([studentId, record]) => {
      const student = (myStudents || []).find(s => s.id === parseInt(studentId));
      if (student) {
        dataStore.addAttendance({
          date: dateStr,
          studentId: parseInt(studentId),
          studentName: student.name,
          status: record.status,
          subject: (assignedSubjects.find(subj => (student.subjects || []).includes(subj))) || (assignedSubjects[0] || 'Mathematics'),
          notes: record.notes
        });
      }
    });

    setAttendanceRecords({});
    toast({
      title: 'Attendance Saved Successfully',
      description: `Attendance for ${Object.keys(attendanceRecords).length} students recorded for ${format(attendanceDate, 'MMMM d, yyyy')} and will automatically appear in reports.`
    });
  };

  // Get students for selected class in attendance
  const getAttendanceStudents = () => {
    if (attendanceGrade === 'all' || attendanceClass === 'all') return [];
    // Enforce class-level permission
    if (currentUser && currentUser.userType === 'staff' && !allowCrossClass) {
      if (!assignedClasses.includes(attendanceClass)) return [];
    }
    return (myStudents || []).filter(student =>
      student.grade === attendanceGrade && student.class === attendanceClass
    );
  };

  // Calculate attendance statistics for a student
  const getStudentAttendanceStats = (studentId: number) => {
    const studentRecords = (myAttendance || []).filter(record => record.studentId === studentId);
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(record => record.status === 'Present').length;
    const absentDays = studentRecords.filter(record => record.status === 'Absent').length;
    const lateDays = studentRecords.filter(record => record.status === 'Late').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate: Math.round(attendanceRate * 10) / 10
    };
  };

  // Get detailed attendance history for a student
  const getStudentAttendanceHistory = (studentId: number) => {
    return (myAttendance || [])
      .filter(record => record.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get students for grade filtering
  const getGradeFilteredStudents = () => {
    if (gradeFilterGrade === 'all' || gradeFilterClass === 'all') return [];
    return (myStudents || []).filter(student =>
      student.grade === gradeFilterGrade && student.class === gradeFilterClass
    );
  };

  // Calculate ranking for students in a class and subject
  const getStudentRanking = (studentId: number, subject: string, term: string) => {
    const classStudents = getGradeFilteredStudents();
    const subjectGrades = (myGrades || []).filter(grade =>
      grade.subject === subject &&
      grade.term === term &&
      classStudents.some(student => student.id === grade.studentId)
    );

    // Sort by totalMarks descending
    const sortedGrades = subjectGrades.sort((a, b) => b.totalMarks - a.totalMarks);
    const position = sortedGrades.findIndex(grade => grade.studentId === studentId) + 1;

    if (position === 0) return null;

    const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
    return `${position}${suffix}`;
  };

  // Get grades for a specific student
  const getStudentGrades = (studentId: number) => {
    return (myGrades || []).filter(grade => grade.studentId === studentId)
      .sort((a, b) => new Date(b.term).getTime() - new Date(a.term).getTime());
  };

  // Report generation functions
  const generateStudentPerformanceReport = () => {
    const reportStudents = reportGrade !== 'all' && reportClass !== 'all'
      ? (myStudents || []).filter(s => s.grade === reportGrade && s.class === reportClass)
      : (myStudents || []);

    return reportStudents.map(student => {
      const studentGrades = getStudentGrades(student.id);
      const attendanceStats = getStudentAttendanceStats(student.id);
      const avgPercentage = studentGrades.length > 0
        ? studentGrades.reduce((sum, grade) => sum + grade.totalMarks, 0) / studentGrades.length
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

  const generateGradeDistribution = () => {
    const allGrades = (myGrades || []).filter(grade =>
      reportGrade === 'all' || (myStudents || []).find(s => s.id === grade.studentId)?.grade === reportGrade
    );

    const distribution = {
      'D': allGrades.filter(g => g.letterGrade === 'D').length,
      'C': allGrades.filter(g => g.letterGrade === 'C').length,
      'UP': allGrades.filter(g => g.letterGrade === 'UP').length,
      'P': allGrades.filter(g => g.letterGrade === 'P').length,
      'F': allGrades.filter(g => g.letterGrade === 'F').length,
    };

    return { distribution, total: allGrades.length };
  };

  const handleEmailReport = async (reportType: string) => {
    if (!emailAddress) {
      toast({ title: 'Error', description: 'Please enter an email address' });
      return;
    }

    setIsGeneratingReport(true);
    // Simulate email sending
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: 'Success',
        description: `${reportType} report has been sent to ${emailAddress}`
      });
    }, 2000);
  };

  const handlePrintReport = (reportType: string) => {
    // In a real implementation, this would generate and print the report
    toast({
      title: 'Printing',
      description: `${reportType} report is being prepared for printing`
    });
    window.print();
  };

  const handleDownloadReport = (reportType: string) => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: 'Download Started',
      description: `${reportType} report is being downloaded as PDF`
    });
  };

  // Generate class options based on selected grade
  const getClassOptions = (grade: string) => {
    if (grade === 'all') return [];
    const gradeNumber = grade.replace('Grade ', '');
    const all = ['A','B','C','D','E','F','G','H'].map(letter => `${gradeNumber}${letter}`);
    if (!currentUser || currentUser.userType !== 'staff' || allowCrossClass || assignedClasses.length === 0) return all;
    return all.filter(c => assignedClasses.includes(c));
  };

  const getAvailableGrades = () => {
    const all = ['Grade 9','Grade 10','Grade 11','Grade 12'];
    if (!currentUser || currentUser.userType !== 'staff' || allowCrossClass || assignedClasses.length === 0) return all;
    const grades = Array.from(new Set((assignedClasses || []).map((c: string) => {
      const num = parseInt(c.replace(/[^0-9]/g, ''), 10);
      return num ? `Grade ${num}` : '';
    }).filter(Boolean)));
    return grades.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]));
  };

  // Filter functions
  const filteredStudents = (myStudents || []).filter(student => {
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

  const filteredAttendance = (myAttendance || []).filter(record => 
    record.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    record.date.includes(attendanceSearch) ||
    record.status.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  const filteredGrades = (myGrades || []).filter(grade =>
    grade.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.subject.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.class.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.letterGrade.toLowerCase().includes(gradeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Ialibu Secondary School - Staff Dashboard</h1>
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
              <div className="text-xs text-blue-100">{currentUser.position} �� {currentUser.department}</div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Staff Dashboard
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
            {staffMenuItems.map((item) => {
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Dashboard Overview</h2>
              
              {/* Staff Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.myStudents}</div>
                    <p className="text-xs text-muted-foreground">Students assigned to you</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgGrade.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Your classes average</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Your classes this month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.assignedClasses}</div>
                    <p className="text-xs text-muted-foreground">Classes you teach</p>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      My Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      View and manage information for students in your assigned classes.
                    </p>
                    <Button onClick={() => setActiveSection('students')} className="w-full">
                      View My Students
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Attendance Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Record and track attendance for your assigned classes.
                    </p>
                    <Button onClick={() => setActiveSection('attendance')} className="w-full">
                      Manage Attendance
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Grade Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter and update grades for students in your classes.
                    </p>
                    <Button onClick={() => setActiveSection('grades')} className="w-full">
                      Manage Grades
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Student Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate reports for your students and classes.
                    </p>
                    <Button onClick={() => setActiveSection('reports')} className="w-full">
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Today's Schedule</h3>
                      <p className="text-sm text-gray-600">
                        Grade 10A - Mathematics<br />
                        Grade 11B - Physics<br />
                        Grade 9A - General Science
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Recent Activity</h3>
                      <p className="text-sm text-gray-600">
                        {myGrades.length} grades entered<br />
                        {myAttendance.length} attendance records<br />
                        2 student reports generated
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Upcoming Tasks</h3>
                      <p className="text-sm text-gray-600">
                        Submit Term 2 grades<br />
                        Parent-teacher meetings<br />
                        Prepare exam materials
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Students</h2>
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
                    <StudentForm
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
                        {getAvailableGrades().map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
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
                        <TableHead>Subjects</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(filteredStudents || []).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(student.subjects || []).slice(0, 3).map((subject, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {subject.length > 12 ? subject.substring(0, 12) + '...' : subject}
                                  </Badge>
                                ))}
                                {(student.subjects || []).length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{student.subjects.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSubjectModal(student)}
                                className="ml-2"
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
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

              {/* Subject Management Modal */}
              <Dialog open={subjectModal.open} onOpenChange={(open) => setSubjectModal(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Manage Subjects for {subjectModal.student?.name}
                    </DialogTitle>
                  </DialogHeader>

                  {subjectModal.student && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Student Information</h4>
                          <Badge variant="outline">
                            {subjectModal.student.grade} {subjectModal.student.class}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Currently enrolled in {selectedStudentSubjects.length} subjects
                          (Recommended: 7-9 subjects, Maximum: 10 subjects)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">
                          Available Subjects for {subjectModal.student.grade}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {getAvailableSubjects(subjectModal.student.grade).map((subject) => (
                            <div
                              key={subject}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedStudentSubjects.includes(subject)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleSubject(subject)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{subject}</span>
                                {selectedStudentSubjects.includes(subject) && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Selected Subjects ({selectedStudentSubjects.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedStudentSubjects || []).map((subject, idx) => (
                            <Badge key={idx} variant="default" className="flex items-center gap-1">
                              {subject}
                              <X
                                className="h-3 w-3 cursor-pointer hover:bg-white/20 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubject(subject);
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                        {selectedStudentSubjects.length < 7 && (
                          <p className="text-sm text-yellow-600 mt-2">
                            ⚠️ Students should have at least 7 subjects
                          </p>
                        )}
                        {selectedStudentSubjects.length === 10 && (
                          <p className="text-sm text-red-600 mt-2">
                            ⚠️ Maximum subject limit reached (10 subjects)
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setSubjectModal({ open: false, student: null })}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => subjectModal.student && handleUpdateStudentSubjects(subjectModal.student.id, selectedStudentSubjects)}
                          disabled={selectedStudentSubjects.length === 0}
                        >
                          Update Subjects ({selectedStudentSubjects.length})
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Take Attendance</h2>

              {/* Date Selection */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Label className="text-sm font-medium">Select Date:</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(attendanceDate, 'EEEE, MMMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={attendanceDate}
                          onSelect={(date) => {
                            if (date) {
                              setAttendanceDate(date);
                              setIsCalendarOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Automatic Integration Info */}
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Automatic Report Integration</h4>
                      <p className="text-sm text-blue-700">
                        Attendance recorded here automatically appears in student reports - no need to re-enter data!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade and Class Selection */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium whitespace-nowrap">Select Class:</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={attendanceGrade}
                        onValueChange={(value) => {
                          setAttendanceGrade(value);
                          setAttendanceClass('all');
                          setAttendanceRecords({});
                        }}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Select Grade</SelectItem>
                          {getAvailableGrades().map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {attendanceGrade !== 'all' && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={attendanceClass}
                          onValueChange={(value) => {
                            setAttendanceClass(value);
                            setAttendanceRecords({});
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Select Class</SelectItem>
                            {getClassOptions(attendanceGrade).map((classOption) => (
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

              {/* Student Attendance List */}
              {attendanceGrade !== 'all' && attendanceClass !== 'all' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Students in {attendanceGrade} {attendanceClass}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowHistory(!showHistory)}
                        >
                          {showHistory ? 'Hide History' : 'View History'}
                        </Button>
                        <Button
                          onClick={handleSubmitAttendance}
                          disabled={Object.keys(attendanceRecords).length === 0}
                        >
                          Save Attendance
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {!showHistory ? (
                      <div className="space-y-4">
                        {(getAttendanceStudents() || []).map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-gray-500">{student.grade} {student.class}</p>
                            </div>

                            {/* Attendance Status Circles */}
                            <div className="flex items-center gap-3 mr-4">
                              <button
                                onClick={() => handleAttendanceStatusChange(student.id, 'Present')}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  attendanceRecords[student.id]?.status === 'Present'
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-green-300 hover:border-green-500'
                                }`}
                                title="Present"
                              >
                                <Check className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleAttendanceStatusChange(student.id, 'Absent')}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  attendanceRecords[student.id]?.status === 'Absent'
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : 'border-red-300 hover:border-red-500'
                                }`}
                                title="Absent"
                              >
                                <X className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleAttendanceStatusChange(student.id, 'Late')}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  attendanceRecords[student.id]?.status === 'Late'
                                    ? 'bg-yellow-500 border-yellow-500 text-white'
                                    : 'border-yellow-300 hover:border-yellow-500'
                                }`}
                                title="Late"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Notes Input */}
                            <div className="w-64">
                              <Textarea
                                placeholder="Notes (optional)"
                                value={attendanceRecords[student.id]?.notes || ''}
                                onChange={(e) => handleAttendanceNotesChange(student.id, e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Attendance History - {attendanceGrade} {attendanceClass}</h3>

                        {(getAttendanceStudents() || []).map((student) => {
                          const stats = getStudentAttendanceStats(student.id);
                          const history = getStudentAttendanceHistory(student.id);

                          return (
                            <div key={student.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-medium">{student.name}</h4>
                                  <p className="text-sm text-gray-500">{student.grade} {student.class}</p>
                                </div>

                                {/* Attendance Statistics */}
                                <div className="flex gap-6 text-sm">
                                  <div className="text-center">
                                    <div className="font-semibold text-lg">{stats.totalDays}</div>
                                    <div className="text-gray-500">Total Days</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg text-green-600">{stats.presentDays}</div>
                                    <div className="text-gray-500">Present</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg text-red-600">{stats.absentDays}</div>
                                    <div className="text-gray-500">Absent</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg text-yellow-600">{stats.lateDays}</div>
                                    <div className="text-gray-500">Late</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg text-blue-600">{stats.attendanceRate}%</div>
                                    <div className="text-gray-500">Rate</div>
                                  </div>
                                </div>
                              </div>

                              {/* Recent Attendance Records */}
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedStudentForHistory(
                                    selectedStudentForHistory === student.id ? null : student.id
                                  )}
                                >
                                  {selectedStudentForHistory === student.id ? 'Hide Details' : 'View Details'}
                                </Button>

                                {selectedStudentForHistory === student.id && (
                                  <div className="mt-4 max-h-60 overflow-y-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Notes</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(history || []).slice(0, 10).map((record) => (
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
                                            <TableCell>{record.notes || '-'}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    {history.length > 10 && (
                                      <p className="text-sm text-gray-500 mt-2 text-center">
                                        Showing last 10 records of {history.length} total
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}



          {activeSection === 'grades' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Grade Management</h2>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {myGrades.length} grades • {filteredGrades.length} filtered
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Teaching Dashboard
                  </Badge>
                </div>
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
                        {getAvailableGrades().map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
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

                  <div className="flex gap-2">
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

                    <Button
                      size="sm"
                      onClick={() => setShowBatchGradeForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Grade
                    </Button>
                  </div>
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
                      {(getGradeFilteredStudents() || []).map((student) => {
                        const studentGrades = getStudentGrades(student.id);
                        return (
                          <div key={student.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-gray-500">{student.grade} {student.class}</p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setIndividualGradeModal({ open: true, student })}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Grade
                                </Button>

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
                            </div>

                            {selectedStudentForGrade === student.id && (
                              <div className="mt-4">
                                {studentGrades.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Weekly Tests</TableHead>
                                        <TableHead>Projects</TableHead>
                                        <TableHead>Assignments</TableHead>
                                        <TableHead>Take-Home Tests</TableHead>
                                        <TableHead>Open-Book Tests</TableHead>
                                        <TableHead>End-of-Term Tests</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>Letter Grade</TableHead>
                                        <TableHead>Term</TableHead>
                                        <TableHead>Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {studentGrades.map((grade) => (
                                        <TableRow key={grade.id}>
                                          <TableCell className="font-medium">{grade.subject}</TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.weeklyTests || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.weeklyTests || grade.weeklyTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.projects || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.projects || grade.projects.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.assignments || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.assignments || grade.assignments.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.takeHomeTests || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.takeHomeTests || grade.takeHomeTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.openBookTests || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.openBookTests || grade.openBookTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {(grade.endOfTermTests || []).filter(score => score > 0).map((score, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {score}
                                                </Badge>
                                              ))}
                                              {(!grade.endOfTermTests || grade.endOfTermTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="font-bold text-lg bg-yellow-100 px-2 py-1 rounded text-center">
                                              {grade.totalMarks || 0}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                grade.letterGrade === 'D' ? 'default' :
                                                grade.letterGrade === 'C' ? 'secondary' :
                                                grade.letterGrade === 'UP' ? 'outline' :
                                                'destructive'
                                              }
                                              className="text-sm font-bold"
                                            >
                                              {grade.letterGrade || 'F'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{grade.term}</TableCell>
                                          <TableCell>
                                            <div className="flex gap-1">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGradeModal({ open: true, mode: 'edit', data: grade })}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteGrade(grade.id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </TableCell>
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
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Weekly Tests</TableHead>
                          <TableHead>Projects</TableHead>
                          <TableHead>Assignments</TableHead>
                          <TableHead>Take-Home Tests</TableHead>
                          <TableHead>Open-Book Tests</TableHead>
                          <TableHead>End-of-Term Tests</TableHead>
                          <TableHead>Total Marks</TableHead>
                          <TableHead>Letter Grade</TableHead>
                          <TableHead>Term</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGrades.map((grade) => (
                          <TableRow key={grade.id}>
                            <TableCell className="font-medium">{grade.studentName}</TableCell>
                            <TableCell>{grade.class}</TableCell>
                            <TableCell>{grade.subject}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.weeklyTests || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.weeklyTests || grade.weeklyTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.projects || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.projects || grade.projects.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.assignments || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.assignments || grade.assignments.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.takeHomeTests || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.takeHomeTests || grade.takeHomeTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.openBookTests || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.openBookTests || grade.openBookTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(grade.endOfTermTests || []).filter(score => score > 0).map((score, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {score}
                                  </Badge>
                                ))}
                                {(!grade.endOfTermTests || grade.endOfTermTests.every(score => score === 0)) && <span className="text-gray-400">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-bold text-lg bg-yellow-100 px-2 py-1 rounded text-center">
                                {grade.totalMarks || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  grade.letterGrade === 'D' ? 'default' :
                                  grade.letterGrade === 'C' ? 'secondary' :
                                  grade.letterGrade === 'UP' ? 'outline' :
                                  'destructive'
                                }
                                className="text-sm font-bold"
                              >
                                {grade.letterGrade || 'F'}
                              </Badge>
                            </TableCell>
                            <TableCell>{grade.term}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setGradeModal({ open: true, mode: 'edit', data: grade })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteGrade(grade.id)}
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
              )}

              {/* Individual Grade Modal */}
              <Dialog open={individualGradeModal.open} onOpenChange={(open) => setIndividualGradeModal(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
                  <DialogHeader>
                    <DialogTitle>Add Grade for {individualGradeModal.student?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[80vh] overflow-y-auto">
                    {individualGradeModal.student && (
                      <IndividualGradeForm
                        student={individualGradeModal.student}
                        onSave={(grade) => {
                          handleAddGrade(grade);
                          setIndividualGradeModal({ open: false, student: null });
                        }}
                        onCancel={() => setIndividualGradeModal({ open: false, student: null })}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Batch Grade Modal */}
              <Dialog open={showBatchGradeForm} onOpenChange={setShowBatchGradeForm}>
                <DialogContent className="max-w-[98vw] max-h-[98vh] w-full">
                  <DialogHeader>
                    <DialogTitle>Batch Grade Entry - Assessment Components</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[90vh] overflow-y-auto">
                    <GradeForm
                      mode="add"
                      grade={null}
                      students={myStudents}
                      preselectedStudent={undefined}
                      onSave={() => {}}
                      onCancel={() => setShowBatchGradeForm(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Grade Modal */}
              <Dialog open={gradeModal.open} onOpenChange={(open) => setGradeModal(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
                  <DialogHeader>
                    <DialogTitle>
                      {gradeModal.mode === 'edit' ? 'Edit Grade' : 'Add Grade'} - {gradeModal.data?.studentName} ({gradeModal.data?.subject})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[80vh] overflow-y-auto">
                    {gradeModal.data && (
                      <EditGradeForm
                        grade={gradeModal.data}
                        mode={gradeModal.mode}
                        onSave={(updatedGrade) => {
                          if (gradeModal.mode === 'edit') {
                            handleUpdateGrade(updatedGrade);
                          } else {
                            handleAddGrade(updatedGrade);
                          }
                          setGradeModal({ open: false, mode: 'add', data: null });
                        }}
                        onCancel={() => setGradeModal({ open: false, mode: 'add', data: null })}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Report Management</h2>

              {/* Class and Student Selection */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Class and Student</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-center mb-4">
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
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          {getAvailableGrades().map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
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
                            <SelectValue placeholder="Select Class" />
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
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students by name..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="pl-10 border-2 border-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Student List with Manage Report Buttons */}
              {(reportGrade !== 'all' && reportClass !== 'all') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Students in {reportGrade} {reportClass}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(myStudents || [])
                        .filter(student =>
                          student.grade === reportGrade &&
                          student.class === reportClass &&
                          student.name.toLowerCase().includes(reportSearch.toLowerCase())
                        )
                        .map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-gray-600">{student.grade} {student.class}</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {(student.subjects || []).length} subjects
                                </Badge>
                                {myReports.filter(r => r.studentId === student.id).length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {myReports.filter(r => r.studentId === student.id).length} reports
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setReportModal({
                                  open: true,
                                  mode: 'add',
                                  data: null,
                                  student
                                })}
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                Manage Report
                              </Button>
                              {myReports.filter(r => r.studentId === student.id).length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const studentReports = myReports.filter(r => r.studentId === student.id);
                                    if (studentReports.length > 0) {
                                      setReportModal({
                                        open: true,
                                        mode: 'edit',
                                        data: studentReports[0],
                                        student
                                      });
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  View Reports
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Report Management Modal */}
              <Dialog open={reportModal.open} onOpenChange={(open) => setReportModal(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {reportModal.mode === 'add' ? 'Create Student Report' : 'Edit Student Report'} - {reportModal.student?.name}
                    </DialogTitle>
                  </DialogHeader>

                  {reportModal.student && (
                    <StudentReportForm
                      mode={reportModal.mode}
                      student={reportModal.student}
                      report={reportModal.data}
                      onSave={(reportData) => {
                        if (reportModal.mode === 'add') {
                          handleAddReport(reportData);
                        } else if (reportModal.data) {
                          handleUpdateReport({ ...reportModal.data, ...reportData });
                        }
                      }}
                      onCancel={() => setReportModal({ open: false, mode: 'add', data: null, student: null })}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Student Form Component
function StudentForm({
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
      subjects: [],
      email: '',
      phone: '',
    }
  );

  const { currentUser: formUser } = useAuth();
  const formAssignedClasses = (formUser && (formUser as any).assignedClasses) || [];
  const formAllowCrossClass = (formUser && (formUser as any).allowCrossClass) || false;

  const getAllowedGrades = () => {
    const all = ['Grade 9','Grade 10','Grade 11','Grade 12'];
    if (!formUser || formUser.userType !== 'staff' || formAllowCrossClass || formAssignedClasses.length === 0) return all;
    const grades = Array.from(new Set((formAssignedClasses || []).map((c: string) => {
      const num = parseInt(c.replace(/[^0-9]/g, ''), 10);
      return num ? `Grade ${num}` : '';
    }).filter(Boolean)));
    return grades.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]));
  };

  // Generate class options based on selected grade in form
  const getFormClassOptions = (grade: string) => {
    if (!grade) return [];
    const gradeNumber = grade.replace('Grade ', '');
    const all = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => `${gradeNumber}${letter}`);
    if (!formUser || formUser.userType !== 'staff' || formAllowCrossClass || formAssignedClasses.length === 0) return all;
    return all.filter(c => formAssignedClasses.includes(c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.grade && formData.class) {
      // If no subjects are set, initialize with default subjects for the grade
      if (!formData.subjects || formData.subjects.length === 0) {
        const defaultSubjects = formData.grade === 'Grade 9' || formData.grade === 'Grade 10'
          ? ['Mathematics', 'English', 'Science', 'Social Science', 'Personal Development', 'Arts', 'Business Studies']
          : ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Personal Development'];

        setFormData(prev => ({ ...prev, subjects: defaultSubjects }));
        onSave(mode === 'edit' ? { ...formData, subjects: defaultSubjects } as Student : { ...formData, subjects: defaultSubjects } as Omit<Student, 'id'>);
      } else {
        onSave(mode === 'edit' ? formData as Student : formData as Omit<Student, 'id'>);
      }
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
              {getAllowedGrades().map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
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

      <div className="bg-blue-50 p-3 rounded-lg">
        <Label className="text-sm font-medium text-blue-800">Subject Management</Label>
        <p className="text-sm text-blue-700 mt-1">
          Default subjects will be assigned based on grade level. You can manage subjects after creating the student using the "Manage" button in the students list.
        </p>
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

// Attendance Form Component
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
      subject: '',
      notes: '',
    }
  );

  const { currentUser } = useAuth();
  const assignedSubjects = (currentUser && (currentUser as any).assignedSubjects) || [];

  // Get the selected student's enrolled subjects
  const getStudentSubjects = () => {
    const selectedStudent = formData.studentId
      ? students.find(s => s.id === formData.studentId)
      : null;

    const subjects = selectedStudent?.subjects || [];
    if (assignedSubjects && assignedSubjects.length > 0) {
      return subjects.filter(s => assignedSubjects.includes(s));
    }
    return subjects;
  };

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
            <SelectValue placeholder={formData.studentId ? "Select Subject" : "Select Student First"} />
          </SelectTrigger>
          <SelectContent>
            {getStudentSubjects().length > 0 ? (
              getStudentSubjects().map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-student" disabled>
                {formData.studentId ? "No subjects enrolled" : "Select a student first"}
              </SelectItem>
            )}
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

// Individual Student Grade Form Component (Simplified)
function IndividualGradeForm({
  student,
  onSave,
  onCancel
}: {
  student: Student;
  onSave: (grade: Omit<Grade, 'id'>) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const assignedSubjects = (currentUser && (currentUser as any).assignedSubjects) || [];
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Individual assessment scores
  const [assessmentScores, setAssessmentScores] = useState({
    weeklyTests: [0, 0, 0, 0, 0, 0],
    projects: [0, 0, 0, 0, 0, 0],
    assignments: [0, 0, 0, 0, 0, 0],
    takeHomeTests: [0, 0, 0, 0, 0, 0],
    openBookTests: [0, 0, 0, 0, 0, 0],
    endOfTermTests: [0, 0, 0, 0, 0, 0],
  });

  // Calculate total marks and letter grade
  const calculateTotalAndGrade = () => {
    const getAverage = (scores: number[]) => {
      const validScores = scores.filter(score => score > 0);
      return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
    };

    const weeklyAvg = getAverage(assessmentScores.weeklyTests);
    const projectAvg = getAverage(assessmentScores.projects);
    const assignmentAvg = getAverage(assessmentScores.assignments);
    const takeHomeAvg = getAverage(assessmentScores.takeHomeTests);
    const openBookAvg = getAverage(assessmentScores.openBookTests);
    const endOfTermAvg = getAverage(assessmentScores.endOfTermTests);

    const total = Math.round((weeklyAvg * 0.20) + (projectAvg * 0.25) + (assignmentAvg * 0.20) + (takeHomeAvg * 0.15) + (openBookAvg * 0.10) + (endOfTermAvg * 0.10));

    let letterGrade = 'F';
    if (total >= 85) letterGrade = 'D';
    else if (total >= 70) letterGrade = 'C';
    else if (total >= 55) letterGrade = 'UP';
    else if (total >= 40) letterGrade = 'P';

    return { total, letterGrade };
  };

  // Update individual assessment score
  const updateScore = (component: keyof typeof assessmentScores, index: number, value: number) => {
    setAssessmentScores(prev => ({
      ...prev,
      [component]: prev[component].map((score, i) => i === index ? value : score)
    }));
  };

  // Get available subjects for the student, restricted by teacher mapping if provided
  const getStudentSubjects = () => {
    const subs = student.subjects || [];
    if (assignedSubjects && assignedSubjects.length > 0) {
      return subs.filter(s => assignedSubjects.includes(s));
    }
    return subs;
  };

  const handleSave = () => {
    if (!selectedSubject) {
      toast({ title: 'Error', description: 'Please select a subject' });
      return;
    }

    const { total, letterGrade } = calculateTotalAndGrade();

    const gradeData = {
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      subject: selectedSubject,
      weeklyTests: assessmentScores.weeklyTests,
      projects: assessmentScores.projects,
      assignments: assessmentScores.assignments,
      takeHomeTests: assessmentScores.takeHomeTests,
      openBookTests: assessmentScores.openBookTests,
      endOfTermTests: assessmentScores.endOfTermTests,
      totalMarks: total,
      letterGrade: letterGrade,
      term: selectedTerm
    };

    onSave(gradeData);
  };

  const { total, letterGrade } = calculateTotalAndGrade();

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-blue-900">{student.name}</h4>
        <p className="text-sm text-blue-700">Class: {student.grade} {student.class}</p>
      </div>

      {/* Subject and Term Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {getStudentSubjects().map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Term</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
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
      </div>

      {/* Results Summary */}
      <div className="bg-yellow-50 p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Letter Grade</p>
          <Badge variant={letterGrade === 'D' ? 'default' : letterGrade === 'C' ? 'secondary' : letterGrade === 'UP' ? 'outline' : 'destructive'} className="text-lg font-bold px-3 py-1">
            {letterGrade}
          </Badge>
        </div>
      </div>

      {/* Assessment Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Tests */}
        <div className="space-y-2">
          <h5 className="font-semibold text-blue-900 text-sm">Weekly Tests (20%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="20"
                value={assessmentScores.weeklyTests[i] || ''}
                onChange={(e) => updateScore('weeklyTests', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`T${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          <h5 className="font-semibold text-green-900 text-sm">Projects (25%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="25"
                value={assessmentScores.projects[i] || ''}
                onChange={(e) => updateScore('projects', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`P${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Assignments */}
        <div className="space-y-2">
          <h5 className="font-semibold text-purple-900 text-sm">Assignments (20%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="20"
                value={assessmentScores.assignments[i] || ''}
                onChange={(e) => updateScore('assignments', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`A${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Take-Home Tests */}
        <div className="space-y-2">
          <h5 className="font-semibold text-orange-900 text-sm">Take-Home Tests (15%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="15"
                value={assessmentScores.takeHomeTests[i] || ''}
                onChange={(e) => updateScore('takeHomeTests', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`H${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Open-Book Tests */}
        <div className="space-y-2">
          <h5 className="font-semibold text-teal-900 text-sm">Open-Book Tests (10%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="10"
                value={assessmentScores.openBookTests[i] || ''}
                onChange={(e) => updateScore('openBookTests', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`O${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* End-of-Term Tests */}
        <div className="space-y-2">
          <h5 className="font-semibold text-red-900 text-sm">End-of-Term Tests (10%)</h5>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Input
                key={i}
                type="number"
                min="0"
                max="10"
                value={assessmentScores.endOfTermTests[i] || ''}
                onChange={(e) => updateScore('endOfTermTests', i, Number(e.target.value))}
                className="w-14 h-14 text-center text-sm font-medium"
                placeholder={`E${i+1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!selectedSubject}>
          Save Grade
        </Button>
      </div>
    </div>
  );
}

// Edit Grade Form Component for existing grades
function EditGradeForm({
  grade,
  mode,
  onSave,
  onCancel
}: {
  grade: Grade;
  mode: 'add' | 'edit';
  onSave: (grade: Grade) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState(grade.subject || '');
  const [selectedTerm, setSelectedTerm] = useState(grade.term || 'Term 1');

  // Initialize assessment scores from existing grade data
  const [assessmentScores, setAssessmentScores] = useState({
    weeklyTests: grade.weeklyTests || [0, 0, 0, 0, 0, 0],
    projects: grade.projects || [0, 0, 0, 0, 0, 0],
    assignments: grade.assignments || [0, 0, 0, 0, 0, 0],
    takeHomeTests: grade.takeHomeTests || [0, 0, 0, 0, 0, 0],
    openBookTests: grade.openBookTests || [0, 0, 0, 0, 0, 0],
    endOfTermTests: grade.endOfTermTests || [0, 0, 0, 0, 0, 0],
  });

  // Calculate total marks and letter grade
  const calculateTotalAndGrade = () => {
    const getAverage = (scores: number[]) => {
      const validScores = scores.filter(score => score > 0);
      return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
    };

    const weeklyAvg = getAverage(assessmentScores.weeklyTests);
    const projectAvg = getAverage(assessmentScores.projects);
    const assignmentAvg = getAverage(assessmentScores.assignments);
    const takeHomeAvg = getAverage(assessmentScores.takeHomeTests);
    const openBookAvg = getAverage(assessmentScores.openBookTests);
    const endOfTermAvg = getAverage(assessmentScores.endOfTermTests);

    const total = Math.round(
      (weeklyAvg * 0.20) +
      (projectAvg * 0.25) +
      (assignmentAvg * 0.20) +
      (takeHomeAvg * 0.15) +
      (openBookAvg * 0.10) +
      (endOfTermAvg * 0.10)
    );

    let letterGrade = 'F';
    if (total >= 85) letterGrade = 'D';
    else if (total >= 70) letterGrade = 'C';
    else if (total >= 55) letterGrade = 'UP';
    else if (total >= 40) letterGrade = 'P';

    return { total, letterGrade };
  };

  // Update individual assessment score
  const updateScore = (component: keyof typeof assessmentScores, index: number, value: number) => {
    setAssessmentScores(prev => ({
      ...prev,
      [component]: prev[component].map((score, i) => i === index ? value : score)
    }));
  };

  // Add new score slot to assessment component
  const addScoreSlot = (component: keyof typeof assessmentScores) => {
    if (assessmentScores[component].length < 10) { // Max 10 assessments per component
      setAssessmentScores(prev => ({
        ...prev,
        [component]: [...prev[component], 0]
      }));
    }
  };

  // Remove score slot from assessment component
  const removeScoreSlot = (component: keyof typeof assessmentScores, index: number) => {
    if (assessmentScores[component].length > 1) { // Keep at least 1 slot
      setAssessmentScores(prev => ({
        ...prev,
        [component]: prev[component].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = () => {
    if (!selectedSubject) {
      toast({ title: 'Error', description: 'Please select a subject' });
      return;
    }

    const { total, letterGrade } = calculateTotalAndGrade();

    const updatedGrade: Grade = {
      ...grade,
      subject: selectedSubject,
      weeklyTests: assessmentScores.weeklyTests,
      projects: assessmentScores.projects,
      assignments: assessmentScores.assignments,
      takeHomeTests: assessmentScores.takeHomeTests,
      openBookTests: assessmentScores.openBookTests,
      endOfTermTests: assessmentScores.endOfTermTests,
      totalMarks: total,
      letterGrade: letterGrade,
      term: selectedTerm
    };

    onSave(updatedGrade);
  };

  const { total, letterGrade } = calculateTotalAndGrade();

  // Assessment component data for rendering
  const assessmentComponents = [
    { key: 'weeklyTests', name: 'Weekly Tests', weight: '20%', color: 'blue', maxScore: 20 },
    { key: 'projects', name: 'Projects', weight: '25%', color: 'green', maxScore: 25 },
    { key: 'assignments', name: 'Assignments', weight: '20%', color: 'purple', maxScore: 20 },
    { key: 'takeHomeTests', name: 'Take-Home Tests', weight: '15%', color: 'orange', maxScore: 15 },
    { key: 'openBookTests', name: 'Open-Book Tests', weight: '10%', color: 'teal', maxScore: 10 },
    { key: 'endOfTermTests', name: 'End-of-Term Tests', weight: '10%', color: 'red', maxScore: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Student and Grade Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-blue-900">{grade.studentName}</h4>
        <p className="text-sm text-blue-700">Class: {grade.class}</p>
        <Badge variant="outline" className="mt-2">
          {mode === 'edit' ? 'Editing' : 'Creating'} Grade Record
        </Badge>
      </div>

      {/* Subject and Term Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Subject</Label>
          <Input
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            placeholder="Enter subject name"
          />
        </div>

        <div>
          <Label>Term</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
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
      </div>

      {/* Results Summary */}
      <div className="bg-yellow-50 p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Letter Grade</p>
          <Badge variant={letterGrade === 'D' ? 'default' : letterGrade === 'C' ? 'secondary' : letterGrade === 'UP' ? 'outline' : 'destructive'} className="text-lg font-bold px-3 py-1">
            {letterGrade}
          </Badge>
        </div>
      </div>

      {/* Assessment Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessmentComponents.map((component) => (
          <div key={component.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className={`font-semibold text-${component.color}-900 text-sm`}>
                {component.name} ({component.weight})
              </h5>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addScoreSlot(component.key as keyof typeof assessmentScores)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {assessmentScores[component.key as keyof typeof assessmentScores].map((score, i) => (
                <div key={i} className="relative">
                  <Input
                    type="number"
                    min="0"
                    max={component.maxScore}
                    value={score || ''}
                    onChange={(e) => updateScore(component.key as keyof typeof assessmentScores, i, Number(e.target.value))}
                    className="w-full h-12 text-center text-sm font-medium"
                    placeholder={`${component.name.charAt(0)}${i+1}`}
                  />
                  {assessmentScores[component.key as keyof typeof assessmentScores].length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeScoreSlot(component.key as keyof typeof assessmentScores, i)}
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Valid scores: {assessmentScores[component.key as keyof typeof assessmentScores].filter(s => s > 0).length} |
              Avg: {assessmentScores[component.key as keyof typeof assessmentScores].filter(s => s > 0).length > 0
                ? Math.round(assessmentScores[component.key as keyof typeof assessmentScores].filter(s => s > 0).reduce((sum, s) => sum + s, 0) / assessmentScores[component.key as keyof typeof assessmentScores].filter(s => s > 0).length)
                : 0}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!selectedSubject}>
          {mode === 'edit' ? 'Update Grade' : 'Save Grade'}
        </Button>
      </div>
    </div>
  );
}

// Batch Grade Form Component
function GradeForm({
  mode,
  grade,
  students,
  preselectedStudent,
  onSave,
  onCancel
}: {
  mode: 'add' | 'edit';
  grade: Grade | null;
  students: Student[];
  preselectedStudent?: Student;
  onSave: (grade: Omit<Grade, 'id'> | Grade) => void;
  onCancel: () => void;
}) {
  const dataStore = useDataStore();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Auth context for teacher permissions (scoped to this component)
  const { currentUser } = useAuth();
  const assignedClasses = (currentUser && 'assignedClasses' in currentUser) ? (currentUser as any).assignedClasses || [] : [];
  const assignedSubjects = (currentUser && 'assignedSubjects' in currentUser) ? (currentUser as any).assignedSubjects || [] : [];
  const allowCrossClass = (currentUser && 'allowCrossClass' in currentUser) ? !!(currentUser as any).allowCrossClass : false;

  // Auto-select first available grade on mount for better UX
  useEffect(() => {
    if (!selectedGradeLevel) {
      const grades = getAvailableGradeLevels();
      if (grades.length > 0) {
        setSelectedGradeLevel(grades[0]);
      }
    }
  }, [currentUser]);

  // State for student grades (up to 6 students)
  const [studentGrades, setStudentGrades] = useState<Array<{
    studentId: number;
    studentName: string;
    class: string;
    weeklyTests: number[];
    projects: number[];
    assignments: number[];
    takeHomeTests: number[];
    openBookTests: number[];
    endOfTermTests: number[];
    totalMarks: number;
    letterGrade: string;
  }>>([]);

  // Calculate total marks and letter grade
  const calculateTotalAndGrade = (weeklyTests: number[], projects: number[], assignments: number[], takeHomeTests: number[], openBookTests: number[], endOfTermTests: number[]) => {
    const weeklyAvg = weeklyTests.length > 0 ? weeklyTests.reduce((sum, score) => sum + score, 0) / weeklyTests.length : 0;
    const projectAvg = projects.length > 0 ? projects.reduce((sum, score) => sum + score, 0) / projects.length : 0;
    const assignmentAvg = assignments.length > 0 ? assignments.reduce((sum, score) => sum + score, 0) / assignments.length : 0;
    const takeHomeAvg = takeHomeTests.length > 0 ? takeHomeTests.reduce((sum, score) => sum + score, 0) / takeHomeTests.length : 0;
    const openBookAvg = openBookTests.length > 0 ? openBookTests.reduce((sum, score) => sum + score, 0) / openBookTests.length : 0;
    const endOfTermAvg = endOfTermTests.length > 0 ? endOfTermTests.reduce((sum, score) => sum + score, 0) / endOfTermTests.length : 0;

    // Weighted calculation: Weekly(20%) + Project(25%) + Assignment(20%) + Take-home(15%) + Open-book(10%) + End-of-term(10%)
    const total = Math.round((weeklyAvg * 0.20) + (projectAvg * 0.25) + (assignmentAvg * 0.20) + (takeHomeAvg * 0.15) + (openBookAvg * 0.10) + (endOfTermAvg * 0.10));

    let letterGrade = 'F';
    if (total >= 85) letterGrade = 'D';
    else if (total >= 70) letterGrade = 'C';
    else if (total >= 55) letterGrade = 'UP';
    else if (total >= 40) letterGrade = 'P';

    return { total, letterGrade };
  };

  // Get filtered students based on selected class
  const getClassStudents = () => {
    if (!selectedClass || !selectedGradeLevel) return [];
    const targetGrade = `Grade ${selectedGradeLevel}`;
    return (students || []).filter(student => student.grade === targetGrade && student.class === selectedClass).slice(0, 6);
  };

  // Initialize student grades when class is selected
  const handleClassChange = (classValue: string) => {
    setSelectedClass(classValue);
    if (!selectedGradeLevel) return;
    const targetGrade = `Grade ${selectedGradeLevel}`;
    const classStudents = (students || []).filter(student => student.grade === targetGrade && student.class === classValue).slice(0, 6);

    setStudentGrades(classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      weeklyTests: [0, 0, 0, 0, 0, 0],
      projects: [0, 0, 0, 0, 0, 0],
      assignments: [0, 0, 0, 0, 0, 0],
      takeHomeTests: [0, 0, 0, 0, 0, 0],
      openBookTests: [0, 0, 0, 0, 0, 0],
      endOfTermTests: [0, 0, 0, 0, 0, 0],
      totalMarks: 0,
      letterGrade: 'F'
    })));
  };

  // Handle grade level selection
  const handleGradeLevelChange = (gradeLevel: string) => {
    setSelectedGradeLevel(gradeLevel);
    setSelectedClass(''); // Reset class selection
    setStudentGrades([]); // Clear student grades

    // If there is only one class available for this grade, auto-select it
    const available = computeAvailableClassesForGrade(gradeLevel);
    if (available.length === 1) {
      const onlyClass = available[0];
      setSelectedClass(onlyClass);
      const targetGrade = `Grade ${gradeLevel}`;
      const classStudents = (students || []).filter(student => student.grade === targetGrade && student.class === onlyClass).slice(0, 6);
      setStudentGrades(classStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        weeklyTests: [0, 0, 0, 0, 0, 0],
        projects: [0, 0, 0, 0, 0, 0],
        assignments: [0, 0, 0, 0, 0, 0],
        takeHomeTests: [0, 0, 0, 0, 0, 0],
        openBookTests: [0, 0, 0, 0, 0, 0],
        endOfTermTests: [0, 0, 0, 0, 0, 0],
        totalMarks: 0,
        letterGrade: 'F'
      })));
    }
  };

  // Update individual assessment component
  const updateAssessment = (studentIndex: number, field: string, arrayIndex: number, value: number) => {
    const newGrades = [...studentGrades];
    const newArray = [...newGrades[studentIndex][field as keyof typeof newGrades[studentIndex]] as number[]];
    newArray[arrayIndex] = value;
    newGrades[studentIndex] = { ...newGrades[studentIndex], [field]: newArray };

    const { weeklyTests, projects, assignments, takeHomeTests, openBookTests, endOfTermTests } = newGrades[studentIndex];
    const { total, letterGrade } = calculateTotalAndGrade(weeklyTests, projects, assignments, takeHomeTests, openBookTests, endOfTermTests);

    newGrades[studentIndex].totalMarks = total;
    newGrades[studentIndex].letterGrade = letterGrade;

    setStudentGrades(newGrades);
  };

  // Save all grades
  const handleSaveAll = () => {
    if (!selectedSubject || !selectedTerm) {
      toast({ title: 'Error', description: 'Please select subject and term' });
      return;
    }

    studentGrades.forEach(studentGrade => {
      if (studentGrade.totalMarks > 0) {
        const gradeData = {
          studentId: studentGrade.studentId,
          studentName: studentGrade.studentName,
          class: studentGrade.class,
          subject: selectedSubject,
          weeklyTests: studentGrade.weeklyTests,
          projects: studentGrade.projects,
          assignments: studentGrade.assignments,
          takeHomeTests: studentGrade.takeHomeTests,
          openBookTests: studentGrade.openBookTests,
          endOfTermTests: studentGrade.endOfTermTests,
          totalMarks: studentGrade.totalMarks,
          letterGrade: studentGrade.letterGrade,
          term: selectedTerm
        };

        dataStore.addGrade(gradeData);
      }
    });

    toast({ title: 'Success', description: 'Grades saved successfully' });
    onCancel();
  };

  // Get available grade levels
  const getAvailableGradeLevels = () => {
    const all = ['9','10','11','12'];
    if (!currentUser || currentUser.userType !== 'staff' || allowCrossClass || assignedClasses.length === 0) return all;
    const grades = Array.from(new Set((assignedClasses || []).map((c: string) => c.replace(/[^0-9]/g, '')).filter(Boolean)));
    return grades.sort();
  };

  // Compute available classes for a given grade level (robust with fallbacks)
  const computeAvailableClassesForGrade = (gradeLevel: string) => {
    const targetGrade = `Grade ${gradeLevel}`;
    let list = Array.from(new Set((students || [])
      .filter(student => student.grade === targetGrade)
      .map(student => student.class)
    )).sort();

    // Fallback: if no classes found from students, derive from assignedClasses or default A-H
    if (list.length === 0) {
      const byAssigned = (assignedClasses || []).filter(c => c.startsWith(gradeLevel));
      list = byAssigned.length > 0 ? byAssigned : ['A','B','C','D','E','F','G','H'].map(letter => `${gradeLevel}${letter}`);
    }

    // Permission filter for staff
    if (currentUser && currentUser.userType === 'staff' && !allowCrossClass && assignedClasses.length > 0) {
      list = list.filter(c => assignedClasses.includes(c));
    }
    return list;
  };

  // Get available classes for selected grade level
  const getAvailableClasses = () => {
    if (!selectedGradeLevel) return [];
    return computeAvailableClassesForGrade(selectedGradeLevel);
  };

  // Get available subjects for selected class
  const getAvailableSubjects = () => {
    if (!selectedClass || !selectedGradeLevel) return [];
    const targetGrade = `Grade ${selectedGradeLevel}`;
    const classStudents = students.filter(student => student.grade === targetGrade && student.class === selectedClass);
    if (classStudents.length === 0) return [];

    const allSubjects = new Set<string>();
    classStudents.forEach(student => {
      student.subjects.forEach(subject => allSubjects.add(subject));
    });

    const subjects = Array.from(allSubjects).sort();
    if (!currentUser || currentUser.userType !== 'staff') return subjects;
    if (assignedSubjects.length === 0) return subjects;
    return subjects.filter(s => assignedSubjects.includes(s));
  };

  return (
    <div className="w-full space-y-4">
      {/* Form Header */}
      <div className="bg-blue-50 p-4 rounded-lg border">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Grade Entry - Assessment Components</h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <Label>Grade</Label>
            <Select value={selectedGradeLevel} onValueChange={handleGradeLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableGradeLevels().map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={handleClassChange} disabled={!selectedGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder={selectedGradeLevel ? "Select Class" : "Select Grade First"} />
              </SelectTrigger>
              <SelectContent>
                {getAvailableClasses().map((classOption) => (
                  <SelectItem key={classOption} value={classOption}>
                    {classOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder={selectedClass ? "Select Subject" : "Select Class First"} />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSubjects().map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Term</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
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
        </div>
      </div>

      {/* Assessment Table */}
      {selectedClass && studentGrades.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-3">
            <h4 className="text-base font-semibold">Assessment Components - {selectedClass} - {selectedSubject}</h4>
          </div>

          <div className="space-y-4">
            {studentGrades.map((studentGrade, index) => (
              <div key={studentGrade.studentId} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded">
                  <div>
                    <h4 className="font-bold text-blue-900">{studentGrade.studentName}</h4>
                    <p className="text-sm text-blue-700">Class: {studentGrade.class}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-xl bg-yellow-100 px-4 py-2 rounded">
                        {studentGrade.totalMarks}
                      </div>
                      <p className="text-xs text-gray-600">Total Marks</p>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant={
                          studentGrade.letterGrade === 'D' ? 'default' :
                          studentGrade.letterGrade === 'C' ? 'secondary' :
                          studentGrade.letterGrade === 'UP' ? 'outline' :
                          'destructive'
                        }
                        className="text-lg font-bold px-3 py-1"
                      >
                        {studentGrade.letterGrade}
                      </Badge>
                      <p className="text-xs text-gray-600">Letter Grade</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Weekly Tests (20%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-blue-900 text-sm">Weekly Tests (20%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="20"
                          value={studentGrade.weeklyTests[i] || ''}
                          onChange={(e) => updateAssessment(index, 'weeklyTests', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`T${i+1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Projects (25%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-green-900 text-sm">Projects (25%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="25"
                          value={studentGrade.projects[i] || ''}
                          onChange={(e) => updateAssessment(index, 'projects', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`P${i+1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Assignments (20%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-purple-900 text-sm">Assignments (20%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="20"
                          value={studentGrade.assignments[i] || ''}
                          onChange={(e) => updateAssessment(index, 'assignments', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`A${i+1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Take-Home Tests (15%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-orange-900 text-sm">Take-Home Tests (15%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="15"
                          value={studentGrade.takeHomeTests[i] || ''}
                          onChange={(e) => updateAssessment(index, 'takeHomeTests', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`H${i+1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Open-Book Tests (10%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-teal-900 text-sm">Open-Book Tests (10%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="10"
                          value={studentGrade.openBookTests[i] || ''}
                          onChange={(e) => updateAssessment(index, 'openBookTests', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`O${i+1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* End-of-Term Tests (10%) */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-red-900 text-sm">End-of-Term Tests (10%)</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          min="0"
                          max="10"
                          value={studentGrade.endOfTermTests[i] || ''}
                          onChange={(e) => updateAssessment(index, 'endOfTermTests', i, Number(e.target.value))}
                          className="w-14 h-14 text-center text-sm font-medium"
                          placeholder={`E${i+1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t">
            <div className="text-xs text-gray-600 mb-3 space-y-1">
              <p><strong>Assessment Weight:</strong> Weekly Tests (20%), Projects (25%), Assignments (20%), Take-Home Tests (15%), Open-Book Tests (10%), End-of-Term Tests (10%)</p>
              <p><strong>Grading Scale:</strong> D (85-100), C (70-84), UP (55-69), P (40-54), F (below 40) | <strong>Max 6 students per session</strong></p>
              <p><strong>Instructions:</strong> Enter raw scores in each rectangle. Up to 6 scores per component. System calculates average per component and applies weightings.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={!selectedSubject || !selectedTerm}
                className="bg-green-600 hover:bg-green-700"
              >
                Save All Grades
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedGradeLevel && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a grade level to begin entering grades</p>
        </div>
      )}

      {selectedGradeLevel && !selectedClass && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a class from Grade {selectedGradeLevel} to continue</p>
        </div>
      )}
    </div>
  );
}

// Student Permanent Report Form Component
function StudentReportForm({
  mode,
  student,
  report,
  onSave,
  onCancel
}: {
  mode: 'add' | 'edit';
  student: Student;
  report: StudentReport | null;
  onSave: (report: Omit<StudentReport, 'id'>) => void;
  onCancel: () => void;
}) {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const dataStore = useDataStore();
  const [formData, setFormData] = useState<Partial<StudentReport>>(
    report || {
      studentId: student.id,
      studentName: student.name,
      gender: student.gender || 'Male',
      grade: student.grade,
      class: student.class,
      studentID: `ISS${new Date().getFullYear()}${String(student.id).padStart(3, '0')}`,
      term: 'Term 1',
      academicYear: new Date().getFullYear().toString(),
      financialStatus: 'Clear' as const,
      outstandingAmount: 0,
      gpa: 0,
      totalSchoolDays: 80,
      daysAbsent: 0,
      daysPresent: 80,
      attendancePercentage: 100,
      teacherComments: '',
      classTeacherSignature: '',
      principalSignature: '',
      schoolStamp: false,
      createdBy: 'Staff Dashboard',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  );

  const { toast } = useToast();

  // Get student's grades for this term to calculate GPA and populate subjects table
  const studentGrades = (dataStore.grades || []).filter(g =>
    g.studentId === student.id &&
    g.term === formData.term
  );

  // Calculate GPA based on grades
  const calculateGPA = () => {
    if (studentGrades.length === 0) return 0;
    const gradePoints = {
      'D': 4.0,
      'C': 3.0,
      'UP': 2.0,
      'P': 1.0,
      'F': 0.0
    };
    const totalPoints = studentGrades.reduce((sum, grade) => {
      return sum + (gradePoints[grade.score as keyof typeof gradePoints] || 0);
    }, 0);
    return Number((totalPoints / studentGrades.length).toFixed(2));
  };

  // Calculate attendance automatically from recorded attendance data
  const calculateAttendance = () => {
    // Get all attendance records for this student in the academic year
    const studentAttendance = (dataStore.attendance || []).filter(a =>
      a.studentId === student.id &&
      a.date >= `${formData.academicYear}-01-01` &&
      a.date <= `${formData.academicYear}-12-31`
    );

    // If no attendance records, return default values
    if (studentAttendance.length === 0) {
      return {
        totalSchoolDays: 0,
        daysPresent: 0,
        daysAbsent: 0,
        attendancePercentage: 0
      };
    }

    // Calculate attendance statistics
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const absentDays = studentAttendance.filter(a => a.status === 'Absent').length;
    const attendancePercentage = totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(1)) : 0;

    return {
      totalSchoolDays: totalDays,
      daysPresent: presentDays,
      daysAbsent: absentDays,
      attendancePercentage
    };
  };

  // Update GPA and attendance when data or term changes
  useEffect(() => {
    const gpa = calculateGPA();
    const attendance = calculateAttendance();
    setFormData(prev => ({
      ...prev,
      gpa,
      ...attendance
    }));
  }, [student.id, formData.term, formData.academicYear, dataStore.attendance, dataStore.grades]);

  // Manual attendance recalculation function
  const recalculateAttendance = () => {
    const attendance = calculateAttendance();
    setFormData(prev => ({
      ...prev,
      ...attendance
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.term && formData.academicYear) {
      onSave(formData as Omit<StudentReport, 'id'>);
    }
  };

  const handleDownloadReport = async () => {
    if (isDownloadingPDF) return; // Prevent double-clicks
    
    try {
      setIsDownloadingPDF(true);
      
      // Show loading toast
      toast({
        title: 'Generating PDF',
        description: 'Please wait while the report is being prepared...'
      });

      // Use the React ref to target the specific report element
      const reportElement = reportRef.current;
      if (!reportElement) {
        throw new Error('Report content not found');
      }

      // Ensure student is defined
      if (!student || !student.name) {
        throw new Error('Student information not available');
      }

      // Create canvas from the report element
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions with proper A4 dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // Correct A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Generate image data once for better performance
      const imgData = canvas.toDataURL('image/png');

      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page (fixed condition)
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with proper sanitization
      const sanitizedStudentName = student.name.replace(/[\\/:*?"<>|\s]+/g, '_');
      const date = new Date().toISOString().split('T')[0] as string;
      const filename = `${sanitizedStudentName}_Report_${date}.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Show success toast
      toast({
        title: 'Download Complete',
        description: `Student report has been downloaded as ${filename}`
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating the PDF. Please try again.'
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };


  return (
    <div ref={reportRef} className="space-y-6">
      {/* Official Report Header */}
      <div className="text-center border-b-2 border-blue-900 pb-4">
        <h2 className="text-2xl font-bold text-blue-900">IALIBU SECONDARY SCHOOL</h2>
        <h3 className="text-lg font-semibold text-blue-800">STUDENT PERMANENT REPORT</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information Section */}
        <div className="bg-blue-50 p-6 rounded-lg border">
          <h3 className="font-bold text-blue-900 mb-4">Student Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-2">
              <Label className="font-medium min-w-[80px]">Name:</Label>
              <div className="flex-1 border-b border-gray-400 pb-1 font-medium">
                {student.name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-medium min-w-[80px]">Gender:</Label>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="border-0 p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-medium min-w-[80px]">Class:</Label>
              <div className="flex-1 border-b border-gray-400 pb-1 font-medium">
                {student.grade} {student.class}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-medium min-w-[100px]">Student ID:</Label>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <Input
                  value={formData.studentID || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentID: e.target.value }))}
                  className="border-0 p-0 h-auto"
                  placeholder="ISS2024001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grade Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="font-bold text-blue-900">Subjects</TableHead>
                <TableHead className="font-bold text-blue-900">Percentage</TableHead>
                <TableHead className="font-bold text-blue-900">Score</TableHead>
                <TableHead className="font-bold text-blue-900">Rank/Position</TableHead>
                <TableHead className="font-bold text-blue-900">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(student.subjects || []).map((subject, index) => {
                const gradeRecord = studentGrades.find(g => g.subject === subject);
                const getCommentFromPercentage = (percentage: number) => {
                  if (percentage >= 85) return 'Excellent';
                  if (percentage >= 75) return 'Competent';
                  if (percentage >= 65) return 'Satisfactory';
                  if (percentage >= 50) return 'Developing';
                  return 'Needs Improvement';
                };

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{subject}</TableCell>
                    <TableCell>{gradeRecord ? `${gradeRecord.percentage}%` : '0%'}</TableCell>
                    <TableCell>
                      <Badge variant={gradeRecord?.score === 'D' ? 'default' : 'secondary'}>
                        {gradeRecord?.score || 'F'}
                      </Badge>
                    </TableCell>
                    <TableCell>{gradeRecord ? '23' : '-'}</TableCell>
                    <TableCell>{gradeRecord ? getCommentFromPercentage(gradeRecord.percentage) : 'Not Assessed'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Academic Year and Term */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-2">
            <Label className="font-medium min-w-[120px]">Academic Year:</Label>
            <div className="flex-1 border-b border-gray-400 pb-1">
              <Input
                value={formData.academicYear || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                className="border-0 p-0 h-auto"
                placeholder="2024"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-medium min-w-[80px]">Term:</Label>
            <div className="flex-1 border-b border-gray-400 pb-1">
              <Select
                value={formData.term || ''}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, term: value }));
                  recalculateAttendance();
                }}
              >
                <SelectTrigger className="border-0 p-0 h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                  <SelectItem value="Term 4">Term 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Financial Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold mb-3">Financial Status</h4>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="clear"
                name="financialStatus"
                checked={formData.financialStatus === 'Clear'}
                onChange={() => setFormData(prev => ({ ...prev, financialStatus: 'Clear', outstandingAmount: 0 }))}
              />
              <Label htmlFor="clear">Clear ☐</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="notCleared"
                name="financialStatus"
                checked={formData.financialStatus === 'Not Cleared'}
                onChange={() => setFormData(prev => ({ ...prev, financialStatus: 'Not Cleared' }))}
              />
              <Label htmlFor="notCleared">Not Cleared K</Label>
              <Input
                type="number"
                value={formData.outstandingAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, outstandingAmount: Number(e.target.value) }))}
                className="w-24"
                placeholder="0"
                disabled={formData.financialStatus === 'Clear'}
              />
              <span>(outstanding amount)</span>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-3">Academic Performance</h4>
          <div className="flex items-center gap-2">
            <Label className="font-medium">GPA:</Label>
            <div className="border-b border-gray-400 pb-1 px-2 font-bold text-lg">
              {calculateGPA()}
            </div>
          </div>
        </div>

        {/* Attendance Record */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-bold text-green-900 mb-3">Attendance Record</h4>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Check className="h-4 w-4" />
              <span className="font-medium text-sm">Attendance Data (Automatically Calculated)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Label className="font-medium text-green-800">Total School Days:</Label>
                <div className="font-bold text-green-900 bg-white px-3 py-1 rounded border min-w-[3rem] text-center">
                  {formData.totalSchoolDays || 0}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-medium text-green-800">Days Absent:</Label>
                <div className="font-bold text-green-900 bg-white px-3 py-1 rounded border min-w-[3rem] text-center">
                  {formData.daysAbsent || 0}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-medium text-green-800">Days Present:</Label>
                <div className="font-bold text-green-900 bg-white px-3 py-1 rounded border min-w-[3rem] text-center">
                  {formData.daysPresent || 0}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-medium text-green-800">Attendance Rate:</Label>
                <div className="font-bold text-green-900 bg-white px-3 py-1 rounded border min-w-[3rem] text-center">
                  {formData.attendancePercentage}%
                </div>
              </div>
            </div>
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded border border-green-200">
              📊 This data is automatically calculated from attendance records taken in the "Take Attendance" section
              {(dataStore.attendance || []).filter(a => a.studentId === student.id).length > 0 && (
                <div className="mt-1 text-green-500">
                  ✅ {(dataStore.attendance || []).filter(a => a.studentId === student.id).length} attendance records found for this student
                </div>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={recalculateAttendance}
            className="mt-2"
          >
            Calculate from Records
          </Button>
        </div>

        {/* Teachers Comments Section */}
        <div className="border-2 border-gray-300 p-6 rounded-lg">
          <h4 className="font-bold mb-4">Teachers Comments Section</h4>
          <Textarea
            value={formData.teacherComments || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, teacherComments: e.target.value }))}
            placeholder="Enter teacher comments about student's overall performance, behavior, and recommendations..."
            rows={6}
            className="mb-6"
          />

          {/* Signature Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t pt-6">
            <div className="text-center">
              <Input
                placeholder="Class Teacher Signature"
                value={formData.classTeacherSignature || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, classTeacherSignature: e.target.value }))}
                className="mb-2"
              />
              <div className="border-t border-gray-400 pt-2">
                <Label className="text-sm font-medium">Class Teacher Signature</Label>
              </div>
            </div>
            <div className="text-center">
              <Input
                placeholder="Principal Signature"
                value={formData.principalSignature || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, principalSignature: e.target.value }))}
                className="mb-2"
              />
              <div className="border-t border-gray-400 pt-2">
                <Label className="text-sm font-medium">Principal Signature</Label>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <input
                  type="checkbox"
                  id="schoolStamp"
                  checked={formData.schoolStamp || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolStamp: e.target.checked }))}
                  className="mr-2"
                />
                <Label htmlFor="schoolStamp">School Stamp Applied</Label>
              </div>
              <div className="border-t border-gray-400 pt-2">
                <Label className="text-sm font-medium">School Stamp Section</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6">
          <div className="flex flex-col gap-4">
            {/* Email, Download, Print Actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Report Actions</h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadReport}
                  disabled={isDownloadingPDF}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  {isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Create Permanent Report' : 'Update Permanent Report'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* PNG Grading Scale and Weighing Categories - Separate Page */}
      <div className="mt-12 border-t-4 border-blue-900 pt-8 print:page-break-before-always">
        <div className="text-center border-b-2 border-blue-900 pb-4 mb-8">
          <h2 className="text-2xl font-bold text-blue-900">IALIBU SECONDARY SCHOOL</h2>
          <h3 className="text-lg font-semibold text-blue-800">GRADING SCALE & ASSESSMENT CRITERIA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PNG Standard Grading Scale */}
          <div className="bg-blue-50 p-6 rounded-lg border">
            <h4 className="text-xl font-bold text-blue-900 mb-4">PNG Standard Grading Scale</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-100 rounded border-l-4 border-green-500">
                <span className="font-semibold text-green-800">Distinction (D)</span>
                <span className="font-bold text-green-700">85 - 100</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-l-4 border-blue-500">
                <span className="font-semibold text-blue-800">Credit (C)</span>
                <span className="font-bold text-blue-700">70 - 84</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
                <span className="font-semibold text-yellow-800">Upper Pass (UP)</span>
                <span className="font-bold text-yellow-700">55 - 69</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-100 rounded border-l-4 border-orange-500">
                <span className="font-semibold text-orange-800">Pass (P)</span>
                <span className="font-bold text-orange-700">40 - 54</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-100 rounded border-l-4 border-red-500">
                <span className="font-semibold text-red-800">Fail (F)</span>
                <span className="font-bold text-red-700">Below 40</span>
              </div>
            </div>
          </div>

          {/* Assessment Weighing Categories */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Assessment Weighing Categories</h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <h5 className="font-semibold text-gray-800 mb-2">Common Assessment Components:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>• Class Tests & Quizzes</span>
                    <span className="font-medium">20%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Assignments & Projects</span>
                    <span className="font-medium">25%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Mid-term Examination</span>
                    <span className="font-medium">25%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Final Examination</span>
                    <span className="font-medium">30%</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">Important Notes:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Weighings are customizable by subject</li>
                  <li>• Scores shown are raw marks</li>
                  <li>• Total marks = weighted sum of components</li>
                  <li>• Final grades assigned using PNG scale</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-xl font-bold text-blue-900 mb-4">Grade Point Average (GPA) Calculation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-blue-800 mb-2">Grade Point Values:</h5>
              <ul className="space-y-1 text-sm">
                <li>• Distinction (D) = 4.0 points</li>
                <li>• Credit (C) = 3.0 points</li>
                <li>• Upper Pass (UP) = 2.0 points</li>
                <li>• Pass (P) = 1.0 point</li>
                <li>• Fail (F) = 0.0 points</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-blue-800 mb-2">GPA Formula:</h5>
              <div className="bg-white p-3 rounded border text-center">
                <span className="font-mono text-sm">
                  GPA = Sum of (Grade Points) ÷ Number of Subjects
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-4">
          <p>This grading scale is in accordance with the Papua New Guinea Department of Education standards.</p>
          <p className="mt-1">For queries regarding grades, please contact the subject teacher or school administration.</p>
        </div>
      </div>
    </div>
  );
}
