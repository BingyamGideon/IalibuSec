// Shared data store for real-time synchronization between dashboards
interface Student {
  id: number;
  name: string;
  grade: string;
  class: string;
  subjects: string[];
  dob: string;
  gender: string;
  address: string;
  email?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface Attendance {
  id: number;
  date: string;
  studentId: number;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
  subject: string;
  notes?: string;
}

interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  class: string;
  subject: string;
  weeklyTests: number[];
  projects: number[];
  assignments: number[];
  takeHomeTests: number[];
  openBookTests: number[];
  endOfTermTests: number[];
  totalMarks: number;
  letterGrade: string;
  term: string;
}

interface Finance {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  description: string;
}

interface Staff {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary?: number;
}

interface StudentReport {
  id: number;
  studentId: number;
  studentName: string;
  gender: string;
  grade: string;
  class: string;
  studentID: string;
  term: string;
  academicYear: string;
  // Financial Status
  financialStatus: 'Clear' | 'Not Cleared';
  outstandingAmount: number;
  // Academic Performance
  gpa: number;
  // Attendance Record
  totalSchoolDays: number;
  daysAbsent: number;
  daysPresent: number;
  attendancePercentage: number;
  // Comments and Signatures
  teacherComments: string;
  classTeacherSignature: string;
  principalSignature: string;
  schoolStamp: boolean;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

interface DataState {
  students: Student[];
  attendance: Attendance[];
  grades: Grade[];
  finance: Finance[];
  staff: Staff[];
  reports: StudentReport[];
  lastUpdated: string;
  version: number;
}

type DataChangeListener = (data: DataState) => void;

class DataStore {
  private data: DataState;
  private listeners: DataChangeListener[] = [];
  private storageKey = 'school_management_data';

  constructor() {
    this.data = this.loadFromStorage();
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        const newData = this.loadFromStorage();
        if (newData.version > this.data.version) {
          this.data = newData;
          this.notifyListeners();
        }
      }
    });
  }

  private loadFromStorage(): DataState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }

    // Default data if nothing in storage
    return {
      students: [
        { id: 1, name: 'John Doe', grade: 'Grade 9', class: '9A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Religious Education', 'Arts'], dob: '2007-05-15', gender: 'Male', address: '123 Main St, Ialibu', email: 'john.doe@example.com', phone: '123-456-7890', guardianName: 'Robert Doe', guardianPhone: '+675-234-5678' },
        { id: 2, name: 'Jane Smith', grade: 'Grade 9', class: '9A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Information Technology', 'Personal Development', 'Arts', 'Family and Consumer Studies'], dob: '2008-03-22', gender: 'Female', address: '456 Oak Ave, Ialibu', email: 'jane.smith@example.com', phone: '123-456-7891', guardianName: 'Mary Smith', guardianPhone: '+675-345-6789' },
        { id: 3, name: 'Michael Johnson', grade: 'Grade 9', class: '9B', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Technology & Industrial Arts', 'Personal Development', 'Arts'], dob: '2006-11-08', gender: 'Male', address: '789 Pine Rd, Ialibu', email: 'michael.johnson@example.com', phone: '123-456-7892', guardianName: 'James Johnson', guardianPhone: '+675-456-7890' },
        { id: 11, name: 'Lina Paul', grade: 'Grade 9', class: '9B', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-04-15', gender: 'Female', address: '123 Valley St, Ialibu', email: 'lina.paul@example.com', phone: '123-456-7811', guardianName: 'Peter Paul', guardianPhone: '+675-234-5611' },
        { id: 12, name: 'Alex Sungi', grade: 'Grade 9', class: '9B', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-06-22', gender: 'Male', address: '456 Hill Ave, Ialibu', email: 'alex.sungi@example.com', phone: '123-456-7812', guardianName: 'John Sungi', guardianPhone: '+675-345-6712' },
        { id: 13, name: 'Mary Kora', grade: 'Grade 9', class: '9B', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-08-10', gender: 'Female', address: '789 Ridge Rd, Ialibu', email: 'mary.kora@example.com', phone: '123-456-7813', guardianName: 'Grace Kora', guardianPhone: '+675-456-7813' },

        // Grade 9 Classes C-H
        { id: 14, name: 'Peter Wilson', grade: 'Grade 9', class: '9C', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-09-12', gender: 'Male', address: '890 Forest Ave, Ialibu', email: 'peter.wilson@example.com', phone: '123-456-7814', guardianName: 'Susan Wilson', guardianPhone: '+675-567-8914' },
        { id: 15, name: 'Grace Temu', grade: 'Grade 9', class: '9D', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Information Technology', 'Personal Development', 'Arts'], dob: '2007-10-05', gender: 'Female', address: '123 River St, Ialibu', email: 'grace.temu@example.com', phone: '123-456-7815', guardianName: 'Joseph Temu', guardianPhone: '+675-678-9015' },
        { id: 16, name: 'Samuel Mendi', grade: 'Grade 9', class: '9E', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Technology & Industrial Arts', 'Personal Development', 'Arts'], dob: '2007-11-20', gender: 'Male', address: '456 Mountain Rd, Ialibu', email: 'samuel.mendi@example.com', phone: '123-456-7816', guardianName: 'Ruth Mendi', guardianPhone: '+675-789-0116' },
        { id: 17, name: 'Rebecca Nipa', grade: 'Grade 9', class: '9F', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2007-12-08', gender: 'Female', address: '789 Valley View, Ialibu', email: 'rebecca.nipa@example.com', phone: '123-456-7817', guardianName: 'Paul Nipa', guardianPhone: '+675-890-1217' },
        { id: 18, name: 'Daniel Kila', grade: 'Grade 9', class: '9G', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Religious Education'], dob: '2007-01-15', gender: 'Male', address: '101 Garden St, Ialibu', email: 'daniel.kila@example.com', phone: '123-456-7818', guardianName: 'Mary Kila', guardianPhone: '+675-901-2318' },
        { id: 19, name: 'Joyce Wambi', grade: 'Grade 9', class: '9H', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Arts', 'Personal Development', 'Information Technology'], dob: '2007-02-28', gender: 'Female', address: '202 Sunset Ave, Ialibu', email: 'joyce.wambi@example.com', phone: '123-456-7819', guardianName: 'John Wambi', guardianPhone: '+675-012-3419' },

        // Grade 10 Classes A-H
        { id: 20, name: 'Thomas Yama', grade: 'Grade 10', class: '10A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Information Technology', 'Arts', 'Personal Development'], dob: '2006-03-10', gender: 'Male', address: '303 Hill Top, Ialibu', email: 'thomas.yama@example.com', phone: '123-456-7820', guardianName: 'Elizabeth Yama', guardianPhone: '+675-123-4520' },
        { id: 21, name: 'Helen Natera', grade: 'Grade 10', class: '10B', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Technology & Industrial Arts', 'Personal Development', 'Family and Consumer Studies'], dob: '2006-04-18', gender: 'Female', address: '404 Spring Rd, Ialibu', email: 'helen.natera@example.com', phone: '123-456-7821', guardianName: 'Michael Natera', guardianPhone: '+675-234-5621' },
        { id: 22, name: 'Moses Kaupa', grade: 'Grade 10', class: '10C', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Information Technology', 'Personal Development', 'Arts'], dob: '2006-05-25', gender: 'Male', address: '505 Creek View, Ialibu', email: 'moses.kaupa@example.com', phone: '123-456-7822', guardianName: 'Agnes Kaupa', guardianPhone: '+675-345-6722' },
        { id: 23, name: 'Ruth Pila', grade: 'Grade 10', class: '10D', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2006-06-12', gender: 'Female', address: '606 Bridge St, Ialibu', email: 'ruth.pila@example.com', phone: '123-456-7823', guardianName: 'Simon Pila', guardianPhone: '+675-456-7823' },
        { id: 24, name: 'James Wanma', grade: 'Grade 10', class: '10E', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Technology & Industrial Arts', 'Personal Development', 'Religious Education'], dob: '2006-07-30', gender: 'Male', address: '707 Park Lane, Ialibu', email: 'james.wanma@example.com', phone: '123-456-7824', guardianName: 'Grace Wanma', guardianPhone: '+675-567-8924' },
        { id: 25, name: 'Esther Mekere', grade: 'Grade 10', class: '10F', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Information Technology', 'Personal Development', 'Arts'], dob: '2006-08-14', gender: 'Female', address: '808 Lake View, Ialibu', email: 'esther.mekere@example.com', phone: '123-456-7825', guardianName: 'Peter Mekere', guardianPhone: '+675-678-9025' },
        { id: 26, name: 'Joshua Temu', grade: 'Grade 10', class: '10G', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2006-09-22', gender: 'Male', address: '909 Meadow St, Ialibu', email: 'joshua.temu@example.com', phone: '123-456-7826', guardianName: 'Sarah Temu', guardianPhone: '+675-789-0126' },
        { id: 27, name: 'Mary Konga', grade: 'Grade 10', class: '10H', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Technology & Industrial Arts', 'Personal Development', 'Information Technology'], dob: '2006-10-05', gender: 'Female', address: '121 Church Rd, Ialibu', email: 'mary.konga@example.com', phone: '123-456-7827', guardianName: 'David Konga', guardianPhone: '+675-890-1227' },

        // Grade 11 Classes A-H
        { id: 28, name: 'Philip Sangma', grade: 'Grade 11', class: '11A', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Geography', 'Personal Development'], dob: '2005-01-12', gender: 'Male', address: '222 College Ave, Ialibu', email: 'philip.sangma@example.com', phone: '123-456-7828', guardianName: 'Jennifer Sangma', guardianPhone: '+675-901-2328' },
        { id: 29, name: 'Anna Kerenga', grade: 'Grade 11', class: '11B', subjects: ['Language and Literature', 'General Mathematics', 'Chemistry', 'Biology', 'Economics', 'History', 'Legal Studies', 'Personal Development'], dob: '2005-02-20', gender: 'Female', address: '333 University St, Ialibu', email: 'anna.kerenga@example.com', phone: '123-456-7829', guardianName: 'Robert Kerenga', guardianPhone: '+675-012-3429' },
        { id: 30, name: 'Benjamin Wani', grade: 'Grade 11', class: '11C', subjects: ['Language and Literature', 'General Mathematics', 'Physics', 'Chemistry', 'Economics', 'Geography', 'Business Studies', 'Personal Development'], dob: '2005-03-15', gender: 'Male', address: '444 Academy Rd, Ialibu', email: 'benjamin.wani@example.com', phone: '123-456-7830', guardianName: 'Helen Wani', guardianPhone: '+675-123-4530' },
        { id: 31, name: 'Priscilla Namaliu', grade: 'Grade 11', class: '11D', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'Environment', 'Political Science', 'Legal Studies', 'Personal Development'], dob: '2005-04-08', gender: 'Female', address: '555 Scholar Ave, Ialibu', email: 'priscilla.namaliu@example.com', phone: '123-456-7831', guardianName: 'Thomas Namaliu', guardianPhone: '+675-234-5631' },
        { id: 32, name: 'Isaac Parkop', grade: 'Grade 11', class: '11E', subjects: ['Language and Literature', 'General Mathematics', 'Physics', 'Applied Science', 'Economics', 'Business Studies', 'Accounting', 'Personal Development'], dob: '2005-05-18', gender: 'Male', address: '666 Learning Lane, Ialibu', email: 'isaac.parkop@example.com', phone: '123-456-7832', guardianName: 'Rebecca Parkop', guardianPhone: '+675-345-6732' },
        { id: 33, name: 'Deborah Agarobe', grade: 'Grade 11', class: '11F', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Geology', 'Geography', 'Environment', 'Tourism Studies', 'Personal Development'], dob: '2005-06-25', gender: 'Female', address: '777 Education St, Ialibu', email: 'deborah.agarobe@example.com', phone: '123-456-7833', guardianName: 'William Agarobe', guardianPhone: '+675-456-7833' },
        { id: 34, name: 'Solomon Pato', grade: 'Grade 11', class: '11G', subjects: ['Language and Literature', 'General Mathematics', 'Chemistry', 'Physics', 'Economics', 'Information and Communication Technology (ICT)', 'Computer Studies', 'Personal Development'], dob: '2005-07-12', gender: 'Male', address: '888 Knowledge Rd, Ialibu', email: 'solomon.pato@example.com', phone: '123-456-7834', guardianName: 'Margaret Pato', guardianPhone: '+675-567-8934' },
        { id: 35, name: 'Rachel Somare', grade: 'Grade 11', class: '11H', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'History', 'Legal Studies', 'Business Studies', 'Personal Development'], dob: '2005-08-30', gender: 'Female', address: '999 Wisdom Ave, Ialibu', email: 'rachel.somare@example.com', phone: '123-456-7835', guardianName: 'Arthur Somare', guardianPhone: '+675-678-9035' },

        // Grade 12 Classes A-H
        { id: 36, name: 'Andrew Namah', grade: 'Grade 12', class: '12A', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Business Studies', 'Accounting'], dob: '2004-01-05', gender: 'Male', address: '111 Senior St, Ialibu', email: 'andrew.namah@example.com', phone: '123-456-7836', guardianName: 'Catherine Namah', guardianPhone: '+675-789-0136' },
        { id: 37, name: 'Vanessa Kramer', grade: 'Grade 12', class: '12B', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Economics', 'Business Studies', 'Computer Studies', 'Tourism Studies'], dob: '2004-02-14', gender: 'Female', address: '222 Final Ave, Ialibu', email: 'vanessa.kramer@example.com', phone: '123-456-7837', guardianName: 'Steven Kramer', guardianPhone: '+675-890-1237' },
        { id: 38, name: 'Gabriel Kapris', grade: 'Grade 12', class: '12C', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Applied Science', 'Economics', 'Geography', 'Environment', 'Personal Development'], dob: '2004-03-22', gender: 'Male', address: '333 Graduate Rd, Ialibu', email: 'gabriel.kapris@example.com', phone: '123-456-7838', guardianName: 'Diana Kapris', guardianPhone: '+675-901-2338' },
        { id: 39, name: 'Stephanie Siaguru', grade: 'Grade 12', class: '12D', subjects: ['Language and Literature', 'Advanced Mathematics', 'Chemistry', 'Physics', 'Legal Studies', 'Political Science', 'Business Studies', 'Personal Development'], dob: '2004-04-11', gender: 'Female', address: '444 Achievement St, Ialibu', email: 'stephanie.siaguru@example.com', phone: '123-456-7839', guardianName: 'Francis Siaguru', guardianPhone: '+675-012-3439' },
        { id: 40, name: 'Matthew Tomscoll', grade: 'Grade 12', class: '12E', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Geology', 'Economics', 'Design and Technology', 'Construction', 'Personal Development'], dob: '2004-05-28', gender: 'Male', address: '555 Excellence Ave, Ialibu', email: 'matthew.tomscoll@example.com', phone: '123-456-7840', guardianName: 'Linda Tomscoll', guardianPhone: '+675-123-4540' },
        { id: 41, name: 'Belinda Kerenga', grade: 'Grade 12', class: '12F', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Business Studies', 'Accounting', 'Food Technology', 'Personal Development'], dob: '2004-06-16', gender: 'Female', address: '666 Success St, Ialibu', email: 'belinda.kerenga@example.com', phone: '123-456-7841', guardianName: 'George Kerenga', guardianPhone: '+675-234-5641' },
        { id: 42, name: 'Luke Siaguru', grade: 'Grade 12', class: '12G', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Information and Communication Technology (ICT)', 'Computer Studies', 'Design and Technology', 'Personal Development'], dob: '2004-07-04', gender: 'Male', address: '777 Victory Rd, Ialibu', email: 'luke.siaguru@example.com', phone: '123-456-7842', guardianName: 'Patricia Siaguru', guardianPhone: '+675-345-6742' },
        { id: 43, name: 'Christine Natera', grade: 'Grade 12', class: '12H', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Applied Science', 'Tourism Studies', 'Business Studies', 'Textile Technology', 'Personal Development'], dob: '2004-08-20', gender: 'Female', address: '888 Triumph Ave, Ialibu', email: 'christine.natera@example.com', phone: '123-456-7843', guardianName: 'Joseph Natera', guardianPhone: '+675-456-7843' },
        // More Grade 9A students
        { id: 4, name: 'Paul Kila', grade: 'Grade 9', class: '9A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-03-18', gender: 'Male', address: '303 Main Ave, Ialibu', email: 'paul.kila@example.com', phone: '123-456-7804', guardianName: 'Daniel Kila', guardianPhone: '+675-234-5678' },

        // More Grade 9C students
        { id: 10, name: 'Amy Martinez', grade: 'Grade 9', class: '9C', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Arts', 'Personal Development', 'Religious Education', 'Information Technology'], dob: '2007-02-14', gender: 'Female', address: '707 Oak Hill, Ialibu', email: 'amy.martinez@example.com', phone: '123-456-7899', guardianName: 'Carlos Martinez', guardianPhone: '+675-123-4567' },
        { id: 70, name: 'Mark Temu', grade: 'Grade 9', class: '9C', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Arts'], dob: '2007-04-22', gender: 'Male', address: '808 Forest Ave, Ialibu', email: 'mark.temu@example.com', phone: '123-456-7870', guardianName: 'Grace Temu', guardianPhone: '+675-567-8970' },

        // More Grade 9D students
        { id: 71, name: 'Susan Mendi', grade: 'Grade 9', class: '9D', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Information Technology', 'Personal Development', 'Arts'], dob: '2007-05-15', gender: 'Female', address: '909 River St, Ialibu', email: 'susan.mendi@example.com', phone: '123-456-7871', guardianName: 'Samuel Mendi', guardianPhone: '+675-678-9071' },

        // More Grade 9E students
        { id: 72, name: 'Thomas Nipa', grade: 'Grade 9', class: '9E', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Technology & Industrial Arts', 'Personal Development', 'Arts'], dob: '2007-06-08', gender: 'Male', address: '111 Mountain Rd, Ialibu', email: 'thomas.nipa@example.com', phone: '123-456-7872', guardianName: 'Rebecca Nipa', guardianPhone: '+675-789-0172' },

        // More Grade 9F students
        { id: 73, name: 'Helen Kila', grade: 'Grade 9', class: '9F', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2007-07-12', gender: 'Female', address: '222 Valley View, Ialibu', email: 'helen.kila@example.com', phone: '123-456-7873', guardianName: 'Daniel Kila', guardianPhone: '+675-890-1273' },

        // More Grade 9G students
        { id: 74, name: 'Peter Wambi', grade: 'Grade 9', class: '9G', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Personal Development', 'Religious Education'], dob: '2007-08-25', gender: 'Male', address: '333 Garden St, Ialibu', email: 'peter.wambi@example.com', phone: '123-456-7874', guardianName: 'Joyce Wambi', guardianPhone: '+675-901-2374' },

        // More Grade 9H students
        { id: 75, name: 'Grace Wilson', grade: 'Grade 9', class: '9H', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Arts', 'Personal Development', 'Information Technology'], dob: '2007-09-18', gender: 'Female', address: '444 Sunset Ave, Ialibu', email: 'grace.wilson@example.com', phone: '123-456-7875', guardianName: 'Peter Wilson', guardianPhone: '+675-012-3475' },

        // Grade 10A students (missing completely)
        { id: 5, name: 'Emily Williams', grade: 'Grade 10', class: '10A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Information Technology', 'Arts', 'Personal Development'], dob: '2006-07-12', gender: 'Female', address: '101 Maple St, Ialibu', email: 'emily.williams@example.com', phone: '123-456-7805', guardianName: 'Patricia Williams', guardianPhone: '+675-567-8901' },
        { id: 76, name: 'Robert Yama', grade: 'Grade 10', class: '10A', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Business Studies', 'Information Technology', 'Arts', 'Personal Development'], dob: '2006-08-20', gender: 'Male', address: '555 Hill Top, Ialibu', email: 'robert.yama@example.com', phone: '123-456-7876', guardianName: 'Thomas Yama', guardianPhone: '+675-123-4576' },

        // More Grade 10B students
        { id: 77, name: 'David Brown', grade: 'Grade 10', class: '10B', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Technology & Industrial Arts', 'Personal Development', 'Family and Consumer Studies'], dob: '2006-09-20', gender: 'Male', address: '202 Cedar Ln, Ialibu', email: 'david.brown@example.com', phone: '123-456-7877', guardianName: 'Susan Brown', guardianPhone: '+675-678-9012' },

        // More Grade 10C students
        { id: 78, name: 'Anna Kaupa', grade: 'Grade 10', class: '10C', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Information Technology', 'Personal Development', 'Arts'], dob: '2006-10-15', gender: 'Female', address: '666 Creek View, Ialibu', email: 'anna.kaupa@example.com', phone: '123-456-7878', guardianName: 'Moses Kaupa', guardianPhone: '+675-234-5678' },

        // More Grade 10D students
        { id: 79, name: 'John Pila', grade: 'Grade 10', class: '10D', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2006-11-22', gender: 'Male', address: '777 Bridge St, Ialibu', email: 'john.pila@example.com', phone: '123-456-7879', guardianName: 'Ruth Pila', guardianPhone: '+675-345-6779' },

        // More Grade 10E students
        { id: 80, name: 'Mary Wanma', grade: 'Grade 10', class: '10E', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Technology & Industrial Arts', 'Personal Development', 'Religious Education'], dob: '2006-12-08', gender: 'Female', address: '888 Park Lane, Ialibu', email: 'mary.wanma@example.com', phone: '123-456-7880', guardianName: 'James Wanma', guardianPhone: '+675-456-7880' },

        // More Grade 10F students
        { id: 81, name: 'Simon Mekere', grade: 'Grade 10', class: '10F', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Information Technology', 'Personal Development', 'Arts'], dob: '2006-01-25', gender: 'Male', address: '999 Lake View, Ialibu', email: 'simon.mekere@example.com', phone: '123-456-7881', guardianName: 'Esther Mekere', guardianPhone: '+675-567-8981' },

        // More Grade 10G students
        { id: 82, name: 'Ruth Temu', grade: 'Grade 10', class: '10G', subjects: ['Mathematics', 'English', 'Science', 'Business Studies', 'Family and Consumer Studies', 'Personal Development', 'Arts'], dob: '2006-02-18', gender: 'Female', address: '111 Meadow St, Ialibu', email: 'ruth.temu@example.com', phone: '123-456-7882', guardianName: 'Joshua Temu', guardianPhone: '+675-678-9082' },

        // More Grade 10H students
        { id: 83, name: 'Paul Konga', grade: 'Grade 10', class: '10H', subjects: ['Mathematics', 'English', 'Science', 'Social Science', 'Technology & Industrial Arts', 'Personal Development', 'Information Technology'], dob: '2006-03-12', gender: 'Male', address: '222 Church Rd, Ialibu', email: 'paul.konga@example.com', phone: '123-456-7883', guardianName: 'Mary Konga', guardianPhone: '+675-789-0183' },

        // Grade 11A students
        { id: 6, name: 'Sarah Davis', grade: 'Grade 11', class: '11A', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Geography', 'Personal Development'], dob: '2005-12-03', gender: 'Female', address: '303 Birch St, Ialibu', email: 'sarah.davis@example.com', phone: '123-456-7806', guardianName: 'Mark Davis', guardianPhone: '+675-789-0123' },

        // More Grade 11B students
        { id: 84, name: 'Michael Kerenga', grade: 'Grade 11', class: '11B', subjects: ['Language and Literature', 'General Mathematics', 'Chemistry', 'Biology', 'Economics', 'History', 'Legal Studies', 'Personal Development'], dob: '2005-04-15', gender: 'Male', address: '444 University St, Ialibu', email: 'michael.kerenga@example.com', phone: '123-456-7884', guardianName: 'Anna Kerenga', guardianPhone: '+675-890-1284' },

        // Grade 11C students
        { id: 7, name: 'Chris Wilson', grade: 'Grade 11', class: '11C', subjects: ['Language and Literature', 'General Mathematics', 'Chemistry', 'Biology', 'Economics', 'History', 'Legal Studies', 'Personal Development'], dob: '2005-08-17', gender: 'Male', address: '404 Elm Ave, Ialibu', email: 'chris.wilson@example.com', phone: '123-456-7807', guardianName: 'Linda Wilson', guardianPhone: '+675-890-1234' },

        // More Grade 11D students
        { id: 85, name: 'Joseph Namaliu', grade: 'Grade 11', class: '11D', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'Environment', 'Political Science', 'Legal Studies', 'Personal Development'], dob: '2005-06-22', gender: 'Male', address: '666 Scholar Ave, Ialibu', email: 'joseph.namaliu@example.com', phone: '123-456-7885', guardianName: 'Priscilla Namaliu', guardianPhone: '+675-901-2385' },

        // More Grade 11E students
        { id: 86, name: 'Helen Parkop', grade: 'Grade 11', class: '11E', subjects: ['Language and Literature', 'General Mathematics', 'Physics', 'Applied Science', 'Economics', 'Business Studies', 'Accounting', 'Personal Development'], dob: '2005-07-28', gender: 'Female', address: '777 Learning Lane, Ialibu', email: 'helen.parkop@example.com', phone: '123-456-7886', guardianName: 'Isaac Parkop', guardianPhone: '+675-012-3486' },

        // More Grade 11F students
        { id: 87, name: 'Samuel Agarobe', grade: 'Grade 11', class: '11F', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Geology', 'Geography', 'Environment', 'Tourism Studies', 'Personal Development'], dob: '2005-08-12', gender: 'Male', address: '888 Education St, Ialibu', email: 'samuel.agarobe@example.com', phone: '123-456-7887', guardianName: 'Deborah Agarobe', guardianPhone: '+675-123-4587' },

        // More Grade 11G students
        { id: 88, name: 'Grace Pato', grade: 'Grade 11', class: '11G', subjects: ['Language and Literature', 'General Mathematics', 'Chemistry', 'Physics', 'Economics', 'Information and Communication Technology (ICT)', 'Computer Studies', 'Personal Development'], dob: '2005-09-25', gender: 'Female', address: '999 Knowledge Rd, Ialibu', email: 'grace.pato@example.com', phone: '123-456-7888', guardianName: 'Solomon Pato', guardianPhone: '+675-234-5688' },

        // More Grade 11H students
        { id: 89, name: 'David Somare', grade: 'Grade 11', class: '11H', subjects: ['Language and Literature', 'General Mathematics', 'Biology', 'Chemistry', 'History', 'Legal Studies', 'Business Studies', 'Personal Development'], dob: '2005-10-18', gender: 'Male', address: '111 Wisdom Ave, Ialibu', email: 'david.somare@example.com', phone: '123-456-7889', guardianName: 'Rachel Somare', guardianPhone: '+675-345-6789' },

        // Grade 12A students
        { id: 8, name: 'Lisa Anderson', grade: 'Grade 12', class: '12A', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Business Studies', 'Accounting'], dob: '2004-04-25', gender: 'Female', address: '505 Spruce Rd, Ialibu', email: 'lisa.anderson@example.com', phone: '123-456-7808', guardianName: 'Karen Anderson', guardianPhone: '+675-901-2345' },
        { id: 90, name: 'Andrew Namah', grade: 'Grade 12', class: '12A', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Business Studies', 'Accounting'], dob: '2004-01-05', gender: 'Male', address: '222 Senior St, Ialibu', email: 'andrew.namah@example.com', phone: '123-456-7890', guardianName: 'Catherine Namah', guardianPhone: '+675-456-7890' },

        // Grade 12B students
        { id: 9, name: 'Kevin Taylor', grade: 'Grade 12', class: '12B', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Economics', 'Business Studies', 'Computer Studies', 'Tourism Studies'], dob: '2004-07-10', gender: 'Male', address: '606 Willow St, Ialibu', email: 'kevin.taylor@example.com', phone: '123-456-7809', guardianName: 'Michelle Taylor', guardianPhone: '+675-012-3456' },
        { id: 91, name: 'Vanessa Kramer', grade: 'Grade 12', class: '12B', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Economics', 'Business Studies', 'Computer Studies', 'Tourism Studies'], dob: '2004-02-14', gender: 'Female', address: '333 Final Ave, Ialibu', email: 'vanessa.kramer@example.com', phone: '123-456-7891', guardianName: 'Steven Kramer', guardianPhone: '+675-567-8991' },

        // Grade 12C students
        { id: 92, name: 'Gabriel Kapris', grade: 'Grade 12', class: '12C', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Applied Science', 'Economics', 'Geography', 'Environment', 'Personal Development'], dob: '2004-03-22', gender: 'Male', address: '444 Graduate Rd, Ialibu', email: 'gabriel.kapris@example.com', phone: '123-456-7892', guardianName: 'Diana Kapris', guardianPhone: '+675-678-9092' },
        { id: 93, name: 'Stephanie Siaguru', grade: 'Grade 12', class: '12C', subjects: ['Language and Literature', 'Advanced Mathematics', 'Chemistry', 'Physics', 'Legal Studies', 'Political Science', 'Business Studies', 'Personal Development'], dob: '2004-04-11', gender: 'Female', address: '555 Achievement St, Ialibu', email: 'stephanie.siaguru@example.com', phone: '123-456-7893', guardianName: 'Francis Siaguru', guardianPhone: '+675-789-0193' },

        // Grade 12D students
        { id: 94, name: 'Matthew Tomscoll', grade: 'Grade 12', class: '12D', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Geology', 'Economics', 'Design and Technology', 'Construction', 'Personal Development'], dob: '2004-05-28', gender: 'Male', address: '666 Excellence Ave, Ialibu', email: 'matthew.tomscoll@example.com', phone: '123-456-7894', guardianName: 'Linda Tomscoll', guardianPhone: '+675-890-1294' },
        { id: 95, name: 'Belinda Kerenga', grade: 'Grade 12', class: '12D', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Business Studies', 'Accounting', 'Food Technology', 'Personal Development'], dob: '2004-06-16', gender: 'Female', address: '777 Success St, Ialibu', email: 'belinda.kerenga@example.com', phone: '123-456-7895', guardianName: 'George Kerenga', guardianPhone: '+675-901-2395' },

        // Grade 12E students
        { id: 96, name: 'Luke Siaguru', grade: 'Grade 12', class: '12E', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Information and Communication Technology (ICT)', 'Computer Studies', 'Design and Technology', 'Personal Development'], dob: '2004-07-04', gender: 'Male', address: '888 Victory Rd, Ialibu', email: 'luke.siaguru@example.com', phone: '123-456-7896', guardianName: 'Patricia Siaguru', guardianPhone: '+675-012-3496' },
        { id: 97, name: 'Christine Natera', grade: 'Grade 12', class: '12E', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Applied Science', 'Tourism Studies', 'Business Studies', 'Textile Technology', 'Personal Development'], dob: '2004-08-20', gender: 'Female', address: '999 Triumph Ave, Ialibu', email: 'christine.natera@example.com', phone: '123-456-7897', guardianName: 'Joseph Natera', guardianPhone: '+675-123-4597' },

        // Grade 12F students
        { id: 98, name: 'Robert Wilson', grade: 'Grade 12', class: '12F', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Economics', 'Business Studies', 'Accounting', 'Personal Development'], dob: '2004-09-15', gender: 'Male', address: '111 Champion St, Ialibu', email: 'robert.wilson@example.com', phone: '123-456-7898', guardianName: 'Chris Wilson', guardianPhone: '+675-234-5698' },
        { id: 99, name: 'Patricia Davis', grade: 'Grade 12', class: '12F', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Applied Science', 'Economics', 'Computer Studies', 'Tourism Studies', 'Personal Development'], dob: '2004-10-22', gender: 'Female', address: '222 Winner Ave, Ialibu', email: 'patricia.davis@example.com', phone: '123-456-7899', guardianName: 'Sarah Davis', guardianPhone: '+675-345-6799' },

        // Grade 12G students
        { id: 100, name: 'Joseph Anderson', grade: 'Grade 12', class: '12G', subjects: ['Language and Literature', 'Advanced Mathematics', 'Chemistry', 'Physics', 'Information and Communication Technology (ICT)', 'Computer Studies', 'Design and Technology', 'Personal Development'], dob: '2004-11-08', gender: 'Male', address: '333 Leader Rd, Ialibu', email: 'joseph.anderson@example.com', phone: '123-456-7900', guardianName: 'Lisa Anderson', guardianPhone: '+675-456-7900' },
        { id: 101, name: 'Diana Taylor', grade: 'Grade 12', class: '12G', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Geology', 'Geography', 'Environment', 'Business Studies', 'Personal Development'], dob: '2004-12-18', gender: 'Female', address: '444 Pioneer St, Ialibu', email: 'diana.taylor@example.com', phone: '123-456-7901', guardianName: 'Kevin Taylor', guardianPhone: '+675-567-8901' },

        // Grade 12H students
        { id: 102, name: 'Francis Brown', grade: 'Grade 12', class: '12H', subjects: ['Language and Literature', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Economics', 'Legal Studies', 'Political Science', 'Personal Development'], dob: '2004-01-12', gender: 'Male', address: '555 Summit Ave, Ialibu', email: 'francis.brown@example.com', phone: '123-456-7902', guardianName: 'David Brown', guardianPhone: '+675-678-9002' },
        { id: 103, name: 'Linda Williams', grade: 'Grade 12', class: '12H', subjects: ['Language and Literature', 'Advanced Mathematics', 'Biology', 'Chemistry', 'Business Studies', 'Accounting', 'Food Technology', 'Personal Development'], dob: '2004-02-25', gender: 'Female', address: '666 Peak St, Ialibu', email: 'linda.williams@example.com', phone: '123-456-7903', guardianName: 'Emily Williams', guardianPhone: '+675-789-0103' },
      ],
      attendance: [
        { id: 1, date: '2024-01-15', studentId: 1, studentName: 'John Doe', status: 'Present', subject: 'Mathematics', notes: '' },
        { id: 2, date: '2024-01-15', studentId: 2, studentName: 'Jane Smith', status: 'Absent', subject: 'Mathematics', notes: 'Sick leave' },
        { id: 3, date: '2024-01-15', studentId: 3, studentName: 'Michael Johnson', status: 'Late', subject: 'Mathematics', notes: '15 minutes late' },
        { id: 4, date: '2024-01-15', studentId: 4, studentName: 'Emily Williams', status: 'Present', subject: 'Mathematics', notes: '' },
        { id: 5, date: '2024-01-15', studentId: 5, studentName: 'David Brown', status: 'Present', subject: 'English', notes: '' },
        { id: 6, date: '2024-01-15', studentId: 6, studentName: 'Sarah Davis', status: 'Present', subject: 'Physics', notes: '' },
        { id: 7, date: '2024-01-15', studentId: 7, studentName: 'Chris Wilson', status: 'Absent', subject: 'Chemistry', notes: 'Medical appointment' },
        { id: 8, date: '2024-01-15', studentId: 8, studentName: 'Lisa Anderson', status: 'Present', subject: 'Biology', notes: '' },
      ],
      grades: [
        { id: 1, studentId: 1, studentName: 'John Doe', class: '9A', subject: 'Mathematics', weeklyTests: [18, 16, 20], projects: [23, 22], assignments: [17, 15, 18], takeHomeTests: [14, 16], openBookTests: [12], endOfTermTests: [19], totalMarks: 91, letterGrade: 'D', term: 'Term 1' },
        { id: 2, studentId: 2, studentName: 'Jane Smith', class: '9A', subject: 'English', weeklyTests: [15, 17], projects: [20, 18], assignments: [14, 16], takeHomeTests: [13], openBookTests: [15], endOfTermTests: [16], totalMarks: 78, letterGrade: 'C', term: 'Term 1' },
        { id: 3, studentId: 3, studentName: 'Michael Johnson', class: '9B', subject: 'Mathematics', weeklyTests: [10, 12], projects: [15], assignments: [11, 13], takeHomeTests: [12], openBookTests: [10], endOfTermTests: [10], totalMarks: 58, letterGrade: 'UP', term: 'Term 1' },
        { id: 4, studentId: 4, studentName: 'Emily Williams', class: '10A', subject: 'History', weeklyTests: [16, 18], projects: [21], assignments: [15, 17], takeHomeTests: [12, 14], openBookTests: [13], endOfTermTests: [17], totalMarks: 81, letterGrade: 'C', term: 'Term 1' },
        { id: 5, studentId: 5, studentName: 'David Brown', class: '10B', subject: 'English', weeklyTests: [14, 16], projects: [18, 20], assignments: [13, 15], takeHomeTests: [11], openBookTests: [12], endOfTermTests: [15], totalMarks: 71, letterGrade: 'C', term: 'Term 1' },
        { id: 6, studentId: 6, studentName: 'Sarah Davis', class: '11A', subject: 'Physics', weeklyTests: [19, 21], projects: [24, 23], assignments: [18, 20], takeHomeTests: [15, 17], openBookTests: [16], endOfTermTests: [20], totalMarks: 96, letterGrade: 'D', term: 'Term 1' },
        { id: 7, studentId: 11, studentName: 'Lina Paul', class: '9B', subject: 'Mathematics', weeklyTests: [15, 17], projects: [20], assignments: [14, 16], takeHomeTests: [13], openBookTests: [12], endOfTermTests: [16], totalMarks: 78, letterGrade: 'C', term: 'Term 1' },
        { id: 8, studentId: 12, studentName: 'Alex Sungi', class: '9B', subject: 'Mathematics', weeklyTests: [18, 20], projects: [23, 25], assignments: [17, 19], takeHomeTests: [14, 16], openBookTests: [15], endOfTermTests: [19], totalMarks: 91, letterGrade: 'D', term: 'Term 1' },
        { id: 9, studentId: 13, studentName: 'Mary Kora', class: '9B', subject: 'Mathematics', weeklyTests: [10, 12], projects: [15], assignments: [11, 13], takeHomeTests: [12], openBookTests: [10], endOfTermTests: [10], totalMarks: 58, letterGrade: 'UP', term: 'Term 1' },
      ],
      finance: [
        { id: 1, studentId: 1, studentName: 'John Doe', amount: 500, date: '2023-09-15', status: 'Paid', description: 'School Fees - Term 1' },
        { id: 2, studentId: 2, studentName: 'Jane Smith', amount: 300, date: '2023-09-20', status: 'Pending', description: 'Book Fees' },
        { id: 3, studentId: 3, studentName: 'Michael Johnson', amount: 500, date: '2023-09-10', status: 'Paid', description: 'School Fees - Term 1' },
        { id: 4, studentId: 4, studentName: 'Emily Williams', amount: 450, date: '2023-09-25', status: 'Paid', description: 'Uniform & Books' },
        { id: 5, studentId: 5, studentName: 'David Brown', amount: 520, date: '2023-09-12', status: 'Paid', description: 'School Fees - Term 1' },
        { id: 6, studentId: 6, studentName: 'Sarah Davis', amount: 380, date: '2023-09-18', status: 'Pending', description: 'Lab Equipment Fee' },
        { id: 7, studentId: 7, studentName: 'Chris Wilson', amount: 500, date: '2023-09-14', status: 'Paid', description: 'School Fees - Term 1' },
        { id: 8, studentId: 8, studentName: 'Lisa Anderson', amount: 600, date: '2023-09-08', status: 'Paid', description: 'Final Year Fee' },
      ],
      staff: [
        { id: 1, name: 'James Anderson', position: 'Principal', department: 'Admin', email: 'j.anderson@ialibu.edu', phone: '123-456-7890', salary: 80000 },
        { id: 2, name: 'Mary Taylor', position: 'Vice Principal', department: 'Admin', email: 'm.taylor@ialibu.edu', phone: '123-456-7891', salary: 70000 },
        { id: 3, name: 'Robert Thomas', position: 'Math Teacher', department: 'Science', email: 'r.thomas@ialibu.edu', phone: '123-456-7892', salary: 50000 },
        { id: 4, name: 'Sarah Davis', position: 'Chemistry Teacher', department: 'Science', email: 's.davis@ialibu.edu', phone: '123-456-7893', salary: 48000 },
        { id: 5, name: 'Michael Johnson', position: 'History Teacher', department: 'Social Science', email: 'm.johnson@ialibu.edu', phone: '123-456-7894', salary: 47000 },
        { id: 6, name: 'Lisa Wilson', position: 'Geography Teacher', department: 'Social Science', email: 'l.wilson@ialibu.edu', phone: '123-456-7895', salary: 46000 },
        { id: 7, name: 'David Martinez', position: 'Business Studies Teacher', department: 'Business', email: 'd.martinez@ialibu.edu', phone: '123-456-7896', salary: 49000 },
        { id: 8, name: 'Emma Thompson', position: 'Economics Teacher', department: 'Business', email: 'e.thompson@ialibu.edu', phone: '123-456-7897', salary: 48500 },
      ],
      reports: [
        {
          id: 1,
          studentId: 1,
          studentName: 'John Doe',
          gender: 'Male',
          grade: 'Grade 9',
          class: '9A',
          studentID: 'ISS2024001',
          term: 'Term 1',
          academicYear: '2024',
          financialStatus: 'Clear' as const,
          outstandingAmount: 0,
          gpa: 3.8,
          totalSchoolDays: 80,
          daysAbsent: 4,
          daysPresent: 76,
          attendancePercentage: 95.0,
          teacherComments: 'John is a dedicated student who consistently performs well. He demonstrates good understanding of concepts and helps other students.',
          classTeacherSignature: '',
          principalSignature: '',
          schoolStamp: false,
          createdBy: 'Staff Dashboard',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString(),
      version: 1
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.data));
  }

  private updateVersion(): void {
    this.data.version += 1;
    this.data.lastUpdated = new Date().toISOString();
  }

  // Subscribe to data changes
  subscribe(listener: DataChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current data
  getData(): DataState {
    return { ...this.data };
  }

  // Student operations
  addStudent(student: Omit<Student, 'id'>): Student {
    const newStudent = {
      ...student,
      id: this.data.students && this.data.students.length > 0
        ? Math.max(...this.data.students.map(s => s.id), 0) + 1
        : 1
    };
    if (!this.data.students) {
      this.data.students = [];
    }
    this.data.students.push(newStudent);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newStudent;
  }

  updateStudent(student: Student): void {
    const index = this.data.students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      this.data.students[index] = student;
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteStudent(id: number): void {
    this.data.students = this.data.students.filter(s => s.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Attendance operations
  addAttendance(attendance: Omit<Attendance, 'id'>): Attendance {
    const newAttendance = {
      ...attendance,
      id: this.data.attendance && this.data.attendance.length > 0
        ? Math.max(...this.data.attendance.map(a => a.id), 0) + 1
        : 1
    };
    if (!this.data.attendance) {
      this.data.attendance = [];
    }
    this.data.attendance.push(newAttendance);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newAttendance;
  }

  updateAttendance(attendance: Attendance): void {
    const index = this.data.attendance.findIndex(a => a.id === attendance.id);
    if (index !== -1) {
      this.data.attendance[index] = attendance;
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteAttendance(id: number): void {
    this.data.attendance = this.data.attendance.filter(a => a.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Grade operations
  addGrade(grade: Omit<Grade, 'id'>): Grade {
    const newGrade = {
      ...grade,
      id: this.data.grades && this.data.grades.length > 0
        ? Math.max(...this.data.grades.map(g => g.id), 0) + 1
        : 1
    };
    if (!this.data.grades) {
      this.data.grades = [];
    }
    this.data.grades.push(newGrade);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newGrade;
  }

  updateGrade(grade: Grade): void {
    const index = this.data.grades.findIndex(g => g.id === grade.id);
    if (index !== -1) {
      this.data.grades[index] = grade;
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteGrade(id: number): void {
    this.data.grades = this.data.grades.filter(g => g.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Finance operations
  addFinance(finance: Omit<Finance, 'id'>): Finance {
    const newFinance = {
      ...finance,
      id: this.data.finance && this.data.finance.length > 0
        ? Math.max(...this.data.finance.map(f => f.id), 0) + 1
        : 1
    };
    if (!this.data.finance) {
      this.data.finance = [];
    }
    this.data.finance.push(newFinance);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newFinance;
  }

  updateFinance(finance: Finance): void {
    const index = this.data.finance.findIndex(f => f.id === finance.id);
    if (index !== -1) {
      this.data.finance[index] = finance;
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteFinance(id: number): void {
    this.data.finance = this.data.finance.filter(f => f.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Staff operations
  addStaff(staff: Omit<Staff, 'id'>): Staff {
    const newStaff = {
      ...staff,
      id: this.data.staff && this.data.staff.length > 0
        ? Math.max(...this.data.staff.map(s => s.id), 0) + 1
        : 1
    };
    if (!this.data.staff) {
      this.data.staff = [];
    }
    this.data.staff.push(newStaff);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newStaff;
  }

  updateStaff(staff: Staff): void {
    const index = this.data.staff.findIndex(s => s.id === staff.id);
    if (index !== -1) {
      this.data.staff[index] = staff;
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteStaff(id: number): void {
    this.data.staff = this.data.staff.filter(s => s.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  // Report operations
  addReport(report: Omit<StudentReport, 'id'>): StudentReport {
    const newReport = {
      ...report,
      id: this.data.reports && this.data.reports.length > 0
        ? Math.max(...this.data.reports.map(r => r.id), 0) + 1
        : 1
    };
    if (!this.data.reports) {
      this.data.reports = [];
    }
    this.data.reports.push(newReport);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
    return newReport;
  }

  updateReport(report: StudentReport): void {
    if (!this.data.reports) {
      this.data.reports = [];
    }
    const index = this.data.reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      this.data.reports[index] = { ...report, lastModified: new Date().toISOString() };
      this.updateVersion();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteReport(id: number): void {
    if (!this.data.reports) {
      this.data.reports = [];
    }
    this.data.reports = this.data.reports.filter(r => r.id !== id);
    this.updateVersion();
    this.saveToStorage();
    this.notifyListeners();
  }

  getStudentReports(studentId: number): StudentReport[] {
    if (!this.data.reports) {
      this.data.reports = [];
    }
    return this.data.reports.filter(r => r.studentId === studentId);
  }

  // Method to reload default sample data
  reloadDefaultData(): void {
    localStorage.removeItem(this.storageKey);
    this.data = this.loadFromStorage();
    this.notifyListeners();
  }
}

// Create a singleton instance
export const dataStore = new DataStore();
export type { Student, Attendance, Grade, Finance, Staff, StudentReport, DataState };
