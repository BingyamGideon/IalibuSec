import { useState, useEffect } from 'react';
import { dataStore, type DataState, type Student, type Attendance, type Grade, type Finance, type Staff, type StudentReport } from '@/lib/dataStore';

export function useDataStore() {
  const [data, setData] = useState<DataState>(dataStore.getData());

  useEffect(() => {
    const unsubscribe = dataStore.subscribe((newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, []);

  return {
    // Data
    students: data.students,
    attendance: data.attendance,
    grades: data.grades,
    finance: data.finance,
    staff: data.staff,
    reports: data.reports,
    lastUpdated: data.lastUpdated,
    version: data.version,

    // Student operations
    addStudent: (student: Omit<Student, 'id'>) => dataStore.addStudent(student),
    updateStudent: (student: Student) => dataStore.updateStudent(student),
    deleteStudent: (id: number) => dataStore.deleteStudent(id),

    // Attendance operations
    addAttendance: (attendance: Omit<Attendance, 'id'>) => dataStore.addAttendance(attendance),
    updateAttendance: (attendance: Attendance) => dataStore.updateAttendance(attendance),
    deleteAttendance: (id: number) => dataStore.deleteAttendance(id),

    // Grade operations
    addGrade: (grade: Omit<Grade, 'id'>) => dataStore.addGrade(grade),
    updateGrade: (grade: Grade) => dataStore.updateGrade(grade),
    deleteGrade: (id: number) => dataStore.deleteGrade(id),

    // Finance operations
    addFinance: (finance: Omit<Finance, 'id'>) => dataStore.addFinance(finance),
    updateFinance: (finance: Finance) => dataStore.updateFinance(finance),
    deleteFinance: (id: number) => dataStore.deleteFinance(id),

    // Staff operations
    addStaff: (staff: Omit<Staff, 'id'>) => dataStore.addStaff(staff),
    updateStaff: (staff: Staff) => dataStore.updateStaff(staff),
    deleteStaff: (id: number) => dataStore.deleteStaff(id),

    // Report operations
    addReport: (report: Omit<StudentReport, 'id'>) => dataStore.addReport(report),
    updateReport: (report: StudentReport) => dataStore.updateReport(report),
    deleteReport: (id: number) => dataStore.deleteReport(id),
    getStudentReports: (studentId: number) => dataStore.getStudentReports(studentId),

    // Utility operations
    reloadDefaultData: () => dataStore.reloadDefaultData(),
  };
}
