# Dayflow - Human Resource Management System

A comprehensive HRMS (Human Resource Management System) built with modern web technologies. Dayflow provides a complete solution for managing employees, attendance, leave requests, payroll, and generating reports.

## 🚀 Features

- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Employee, Admin, HR)
  - Protected routes and API endpoints

- **Employee Management**
  - Employee profiles with detailed information
  - Employee directory and listing
  - Profile management

- **Attendance Tracking**
  - Check-in/Check-out functionality
  - Attendance history and records
  - Status tracking (present, absent, half-day, leave)

- **Leave Management**
  - Leave request submission
  - Leave type management (paid, sick, unpaid)
  - Approval workflow (pending, approved, rejected)
  - Admin comments and remarks

- **Payroll Management**
  - Monthly payroll generation
  - Salary calculations (base salary, allowances, deductions)
  - Payroll status tracking

- **Reports & Analytics**
  - Comprehensive reporting dashboard
  - Data visualization with charts
  - Admin-only reports

- **Dashboard**
  - Employee dashboard with personal information
  - Admin dashboard with system overview
  - Role-specific views

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **date-fns** - Date utility library
- **Recharts** - Chart library for data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Better-Sqlite3** - SQLite database
- **JSON Web Token (JWT)** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **tsx** - TypeScript execution for development
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
Dayflow-Human-Resource-Management-System-main/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── LeaveManagement.tsx
│   │   │   ├── Payroll.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── database/       # Database setup and migrations
│   │   │   ├── db.ts
│   │   │   └── migrate.ts
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.ts
│   │   ├── routes/         # API routes
│   │   │   ├── attendance.ts
│   │   │   ├── auth.ts
│   │   │   ├── employees.ts
│   │   │   ├── leave.ts
│   │   │   ├── payroll.ts
│   │   │   └── reports.ts
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── package.json            # Root package.json
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayflow-Human-Resource-Management-System-main
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   
   This will install dependencies for:
   - Root project
   - Server
   - Client

   Alternatively, you can install them separately:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

## 🚀 Running the Application

### Development Mode

Run both client and server concurrently:
```bash
npm run dev
```

This will start:
- **Frontend** on `http://localhost:3000`
- **Backend API** on `http://localhost:5000`

### Run Separately

**Start the server only:**
```bash
npm run dev:server
```

**Start the client only:**
```bash
npm run dev:client
```

### Production Build

**Build the client:**
```bash
cd client
npm run build
```

**Build the server:**
```bash
cd server
npm run build
npm start
```

## 🗄️ Database

The application uses **SQLite** database (Better-Sqlite3). The database file is automatically created at `server/data/dayflow.db` when you first run the server.

### Database Schema

The system includes the following tables:
- **users** - User accounts and authentication
- **employee_profiles** - Employee personal and professional information
- **attendance** - Attendance records
- **leave_requests** - Leave applications
- **payroll** - Payroll records

Database migrations run automatically on server startup.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Employees
- `GET /api/employees` - Get all employees (admin)
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee (protected)
- `DELETE /api/employees/:id` - Delete employee (admin)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/:id` - Get attendance by ID

### Leave Management
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id` - Update leave request
- `DELETE /api/leave/:id` - Delete leave request
- `PUT /api/leave/:id/approve` - Approve leave (admin)
- `PUT /api/leave/:id/reject` - Reject leave (admin)

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll record (admin)
- `GET /api/payroll/:id` - Get payroll by ID
- `PUT /api/payroll/:id` - Update payroll (admin)

### Reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/leave` - Leave reports
- `GET /api/reports/payroll` - Payroll reports

### Health Check
- `GET /api/health` - API health status

**Note:** Most endpoints require authentication via JWT token. Include the token in the Authorization header: `Bearer <token>`

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication. After login, include the token in subsequent requests:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **employee** - Basic access to personal dashboard, attendance, leave, and payroll
- **admin** - Full access including employee management and reports
- **hr** - Human resources access (similar to admin)

## 🎨 Frontend Routes

- `/signin` - Sign in page
- `/signup` - Sign up page
- `/dashboard` - Employee dashboard (protected)
- `/admin` - Admin dashboard (admin only)
- `/profile` - User profile (protected)
- `/attendance` - Attendance management (protected)
- `/leave` - Leave management (protected)
- `/payroll` - Payroll view (protected)
- `/employees` - Employee list (admin only)
- `/reports` - Reports and analytics (admin only)

## 🧪 Development

### TypeScript Configuration
Both client and server use TypeScript with strict type checking enabled.

### Code Structure
- **Client**: Component-based architecture with React hooks and context API
- **Server**: RESTful API with Express.js, route-based organization
- **Database**: SQLite with Better-Sqlite3 for synchronous operations

## 📝 Scripts

### Root Level
- `npm run dev` - Run both client and server in development mode
- `npm run dev:server` - Run server only
- `npm run dev:client` - Run client only
- `npm run install:all` - Install all dependencies

### Client Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server Scripts
- `npm run dev` - Start server with hot reload (tsx watch)
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name/Team

## 🙏 Acknowledgments

- Built with modern web technologies
- Uses open-source libraries and frameworks

---

**Note:** Make sure to set up your `.env` file with appropriate values before running the application in production.
