# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A comprehensive HRMS solution built with React, TypeScript, Node.js, and SQLite. This system digitizes and streamlines core HR operations including employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows.

## Features

### Authentication & Authorization
- ✅ Secure user registration (Sign Up) with email verification requirement
- ✅ Secure login (Sign In) with JWT token-based authentication
- ✅ Role-based access control (Admin/HR vs Employee)
- ✅ Password security requirements (uppercase, lowercase, numbers, min 8 chars)

### Employee Dashboard
- ✅ Quick-access cards for Profile, Attendance, Leave Requests, and Payroll
- ✅ Today's attendance status
- ✅ Recent activity alerts
- ✅ Pending leave requests badge

### Admin/HR Dashboard
- ✅ Employee management overview
- ✅ Attendance records monitoring
- ✅ Leave approval queue
- ✅ Analytics and statistics
- ✅ Quick action buttons

### Employee Profile Management
- ✅ View personal details, job information, salary structure, and documents
- ✅ Employees can edit limited fields (address, phone, profile picture)
- ✅ Admin can edit all employee details

### Attendance Management
- ✅ Daily check-in/check-out functionality
- ✅ Daily and weekly attendance views
- ✅ Status types: Present, Absent, Half-day, Leave
- ✅ Employees view only their own attendance
- ✅ Admin/HR can view attendance of all employees

### Leave & Time-Off Management
- ✅ Employees can apply for leave (Paid, Sick, Unpaid)
- ✅ Date range selection with remarks
- ✅ Leave request status tracking (Pending, Approved, Rejected)
- ✅ Admin/HR can approve or reject requests with comments
- ✅ Real-time status updates

### Payroll/Salary Management
- ✅ Read-only payroll view for employees
- ✅ Admin can view payroll of all employees
- ✅ Update salary structure
- ✅ Salary slip generation and download
- ✅ Monthly payroll records

### Reports & Analytics
- ✅ Attendance reports with date range filtering
- ✅ Summary statistics by employee
- ✅ Detailed attendance records
- ✅ Salary slip generation
- ✅ Analytics dashboard for admins

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **date-fns** for date formatting

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** with better-sqlite3 for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Project Structure

```
dayflow-hrms/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── database/       # Database setup
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── data/               # SQLite database files
│   └── package.json
└── package.json            # Root package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install:all
```

### Step 2: Environment Setup

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Step 3: Run the Application

#### Development Mode (Both Frontend and Backend)

```bash
# From root directory
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Run Separately

**Backend only:**
```bash
cd server
npm run dev
```

**Frontend only:**
```bash
cd client
npm run dev
```

### Step 4: Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Usage

### First Time Setup

1. **Create an Account**
   - Navigate to Sign Up page
   - Enter Employee ID, Email, Password, and select Role (Employee or HR)
   - Password must meet security requirements

2. **Sign In**
   - Use your email and password to sign in
   - You'll be redirected to the appropriate dashboard based on your role

### For Employees

1. **Check In/Out**: Use the Attendance page to check in at the start of the day and check out at the end
2. **Apply for Leave**: Go to Leave Management and submit a leave request
3. **View Payroll**: Check your salary details in the Payroll section
4. **Update Profile**: Edit your contact information and profile picture

### For Admin/HR Officers

1. **Manage Employees**: View and edit employee profiles
2. **Approve Leaves**: Review and approve/reject leave requests
3. **Monitor Attendance**: View attendance records for all employees
4. **Manage Payroll**: Create and update payroll records
5. **Generate Reports**: Create attendance and salary reports

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (Admin only)
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee profile

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/weekly` - Get weekly attendance
- `GET /api/attendance/all` - Get all attendance (Admin only)

### Leave
- `POST /api/leave` - Apply for leave
- `GET /api/leave/my-leaves` - Get user's leave requests
- `GET /api/leave/all` - Get all leave requests (Admin only)
- `PUT /api/leave/:id/approve` - Approve/reject leave (Admin only)

### Payroll
- `GET /api/payroll/my-payroll` - Get user's payroll
- `GET /api/payroll/all` - Get all payroll (Admin only)
- `POST /api/payroll` - Create payroll record (Admin only)
- `PUT /api/payroll/salary/:userId` - Update salary (Admin only)

### Reports
- `GET /api/reports/salary-slip/:userId` - Get salary slip
- `GET /api/reports/attendance` - Get attendance report (Admin only)
- `GET /api/reports/analytics` - Get analytics (Admin only)

## Database Schema

The system uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `employee_profiles` - Employee profile information
- `attendance` - Daily attendance records
- `leave_requests` - Leave applications
- `payroll` - Monthly payroll records

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection protection (parameterized queries)

## Future Enhancements

- Email notifications for leave approvals
- Push notifications for important updates
- Advanced analytics and charts
- Document management system
- Performance reviews
- Employee directory with search
- Calendar integration
- Mobile app support

## Contributing

This is a complete HRMS solution. Feel free to extend it with additional features as needed.

## License

This project is provided as-is for educational and business use.

---

**Built with ❤️ for modern HR management**

