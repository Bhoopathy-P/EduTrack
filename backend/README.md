# EduTrack - Online Learning Management System

EduTrack is a full-featured, secure, and responsive Online Learning Management System (LMS) built with Spring Boot, Spring Security + JWT, JPA/Hibernate, MySQL, and React.

---

## Features Implemented

1. **User Authentication & Authorization**:
   - Secure register/login with passwords encrypted using BCrypt.
   - Stateless JWT token-based authentication with auto-validation filters.
   - Role-based dashboard layouts (Student, Instructor, Admin).

2. **Course & Syllabus Creation**:
   - Instructors can create, edit, or delete detailed syllabi containing multiple modules and lectures (either embedded YouTube video players or text readouts).
   - Real-time notification system alerts students of course updates and published exercises.

3. **Student Enrolment & Progress Trackers**:
   - Students can search, filter categories, and enroll in course syllabi instantly.
   - Interactive progress trackers calculate the completion percentage as students mark lectures completed.

4. **Graded Assignments & Quizzes**:
   - Instructors can design homework tasks or multiple-question quizzes with specific due dates.
   - Students can submit their code repo links or responses directly.
   - Instructors can review submissions and submit grades (e.g. A+, B, 95/100).

5. **Class Discussion Boards**:
   - Every course includes an interactive, cascading forum board.
   - Students and instructors can start threads or reply directly to queries.

6. **Admin Control Panel**:
   - Displays comprehensive platform statistics (Total Students, Instructors, Courses, Enrollments, Average Progress).
   - Direct user directory to activate or deactivate accounts instantly.
   - Syllabus launch approvals table to approve or reject pending courses.

---

## Technical Stack

- **Backend**: Java 21, Spring Boot 3.2.x, Spring Security, Hibernate ORM, Spring Data JPA, JWT (jjwt 0.12.5), Maven.
- **Frontend**: React 18, React Router v6, Axios, Context API, Tailwind CSS, Lucide Icons, pure JavaScript (`.js` and `.jsx` files).
- **Database**: MySQL 8.x.

---

## Project Directory Layout

```
├── backend/                  # Java Maven Spring Boot Backend
│   ├── pom.xml               # Maven builds & dependency manager
│   └── src/
│       └── main/
│           ├── java/com/edutrack/
│           │   ├── config/      # Spring Security & JWT filter chains
│           │   ├── controller/  # REST API mappings (DTO responses)
│           │   ├── dto/         # Request & Response data wrappers
│           │   ├── entity/      # JPA Hibernate models (Course, User, etc.)
│           │   ├── exception/   # Global @ControllerAdvice handling
│           │   ├── repository/  # Data JPA Query gateways
│           │   ├── security/    # UserDetailsService custom adapters
│           │   └── EduTrackApplication.java
│           └── resources/
│               └── application.properties # Ports & database settings
└── src/                      # Plain JavaScript React Frontend (in parent workspace)
    ├── App.jsx               # Application Router guards
    ├── index.css             # Tailwind theme configurations
    ├── main.jsx              # DOM client mounting point
    ├── components/           # Core components (Navbar, CourseCard)
    ├── context/              # Auth Context state manager
    └── pages/                # Dashboards, Login, Register, Course Detail views
```

---

## Quick Setup Instructions

### 1. Database Setup
1. Open your MySQL command-line shell or admin client (e.g., MySQL Workbench).
2. Create a clean database schema named `edutrack_db`:
   ```sql
   CREATE DATABASE edutrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2. Backend Configuration
1. Navigate to `/backend/src/main/resources/application.properties`.
2. Ensure your MySQL username and password match your local environment configuration:
   ```properties
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the backend using Maven:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   The backend will launch on [http://localhost:8080](http://localhost:8080).

### 3. Frontend Configuration
1. Open a new terminal in the root workspace directory.
2. Build and run the React frontend:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000).

---

## Seed Credentials & Demo Accounts

The system automatically initializes with pre-configured accounts for testing each dashboard instantly.

| Account Role | Demo Email Address | Password |
| :--- | :--- | :--- |
| **STUDENT** | `student@edutrack.com` | `password123` |
| **INSTRUCTOR** | `instructor@edutrack.com` | `password123` |
| **ADMIN** | `admin@edutrack.com` | `password123` |
