# 🔧 Fix Database Error in XAMPP - Step by Step Instructions

## ❌ **Problem**
You imported the database to XAMPP but when you open the application, you get a "database error".

## ✅ **Solution**
The issue is that the frontend React application is still using localStorage (client-side storage) instead of connecting to your MySQL database. Follow these steps to fix it:

---

## **Step 1: Place Files in Correct XAMPP Location**

1. **Copy the entire project folder** to your XAMPP htdocs directory:
   ```
   C:\xampp\htdocs\school-management\
   ```

2. **Your folder structure should look like**:
   ```
   C:\xampp\htdocs\school-management\
   ├── client/              # React application files
   ├── server/              # PHP backend files (NEW)
   ├── database/            # Database files
   ├── xampp_setup.php      # Setup test file (NEW)
   └── xampp_database_import.sql
   ```

---

## **Step 2: Verify Database Import**

1. **Open phpMyAdmin**: `http://localhost/phpmyadmin`
2. **Check if database exists**: Look for `ialibu_school` in the left sidebar
3. **Verify tables**: Click on `ialibu_school` and confirm you see these 8 tables:
   - ✅ `attendance`
   - ✅ `audit_log`
   - ✅ `finance`
   - ✅ `grades`
   - ✅ `staff`
   - ✅ `student_reports`
   - ✅ `students`
   - ✅ `users`

---

## **Step 3: Test Database Connection**

1. **Open the setup test page**: `http://localhost/school-management/xampp_setup.php`
2. **Click "Test Database Connection"**
3. **You should see**: ✅ "Database Connection Successful!"
4. **If you see an error**: Follow the troubleshooting steps on that page

---

## **Step 4: Test Backend API**

1. **Test database API**: `http://localhost/school-management/server/database.php?action=test`
   - **Expected response**: `{"success":true,"message":"Database connected successfully"}`

2. **Test authentication API**: `http://localhost/school-management/server/auth.php`
   - **Expected response**: API information with available endpoints

---

## **Step 5: Update Frontend Configuration**

The frontend needs to be configured to use the PHP backend instead of localStorage.

**Update the API base URL in** `client/lib/apiService.ts`:
```typescript
const API_BASE_URL = 'http://localhost/school-management/server';
```

---

## **Step 6: Build and Serve the Frontend**

Since this is a React application, you need to either:

### **Option A: Development Server (Recommended)**
1. **Open command prompt** in the project folder
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Open**: `http://localhost:5173` (or the port shown)

### **Option B: Build for Production**
1. **Build the application**: `npm run build`
2. **Copy build files** to `C:\xampp\htdocs\school-management\`
3. **Access via**: `http://localhost/school-management/`

---

## **Step 7: Test Login**

1. **Open the application** in your browser
2. **Try logging in** with:
   - **Admin**: username `admin`, password `admin123`
   - **Staff**: username `staff`, password `staff123`
3. **Success**: You should see the dashboard without database errors

---

## **🔍 Troubleshooting Common Issues**

### **Database Connection Failed**
- ✅ **Check XAMPP**: Make sure MySQL is running (green indicator)
- ✅ **Check database name**: Must be exactly `ialibu_school`
- ✅ **Re-import database**: Delete and re-import `xampp_database_import.sql`

### **API Endpoints Not Working**
- ✅ **Check file location**: Files must be in `C:\xampp\htdocs\school-management\`
- ✅ **Check Apache**: Make sure Apache is running in XAMPP
- ✅ **Check PHP**: Test `http://localhost/` to ensure PHP is working

### **Frontend Not Connecting to Backend**
- ✅ **Check API URL**: Verify the API_BASE_URL in `apiService.ts`
- ✅ **CORS issues**: The PHP files include CORS headers
- ✅ **Network tab**: Check browser developer tools for failed requests

### **Login Still Using localStorage**
- ✅ **Clear browser data**: Clear localStorage and cookies
- ✅ **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- ✅ **Check authStore**: Verify it's using the new API service

---

## **✅ Quick Test Checklist**

Before trying to login, verify these work:

1. ✅ **XAMPP running**: Apache and MySQL both green
2. ✅ **Database imported**: `ialibu_school` exists with 8 tables  
3. ✅ **Files in place**: Project in `C:\xampp\htdocs\school-management\`
4. ✅ **Setup test passes**: `xampp_setup.php` shows success
5. ✅ **API responds**: `server/database.php?action=test` returns success
6. ✅ **Frontend built**: Either dev server running or build deployed

---

## **🎯 Expected Result**

After completing these steps:

- ✅ **No more database errors**
- ✅ **Login works with admin/admin123 or staff/staff123**
- ✅ **Data comes from MySQL database** (not localStorage)
- ✅ **Real-time synchronization** between admin and staff dashboards
- ✅ **All features working**: students, attendance, grades, finance

---

## **📞 Still Need Help?**

If you're still getting database errors:

1. **Check the setup test page**: `http://localhost/school-management/xampp_setup.php`
2. **Look at browser console**: Press F12 and check for JavaScript errors
3. **Check XAMPP logs**: Look for errors in XAMPP Control Panel
4. **Verify versions**: Make sure you're using a recent version of XAMPP

**The key fix is connecting the React frontend to the PHP backend API instead of using localStorage!**
