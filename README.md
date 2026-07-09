# 📚 EduTrack — Online Learning Management System

> A full-stack Learning Management System built with **Java 21 + Spring Boot 3** backend and **React 18 (Plain JavaScript)** frontend, featuring role-based access for Admin, Instructor, and Student.

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Auth-red?style=for-the-badge&logo=jsonwebtokens)
![Maven](https://img.shields.io/badge/Maven-Build-purple?style=for-the-badge&logo=apachemaven)

---

## ✨ Features

- 🔐 **JWT Authentication** with Spring Security (stateless, token-based)
- 👥 **Role-Based Access Control** — Admin / Instructor / Student
- 📖 **Course Management** — create, update, delete courses with modules & lectures
- 🎓 **Enrollment System** — students enroll and track learning progress
- 📝 **Assignments & Submissions** — instructors create, students submit, instructors grade
- 💬 **Discussion Forum** — per-course Q&A between students and instructors
- 🛠️ **Admin Panel** — manage users, approve/reject courses, view platform stats
- 📊 **Swagger UI** — API documentation at `/swagger-ui.html`

---

## 🛠️ Tech Stack

### Backend
| Technology | Version |
|-----------|---------|
| Java | 21 |
| Spring Boot | 3.2 |
| Spring Security + JWT | Latest |
| Spring Data JPA + Hibernate | Latest |
| MySQL | 8.0 |
| Maven | 3.x |
| Lombok | Latest |
| SpringDoc OpenAPI (Swagger) | Latest |

### Frontend
| Technology | Version |
|-----------|---------|
| React | 18 |
| JavaScript (Plain JS — No TypeScript) | ES6+ |
| React Router | v6 |
| Axios | Latest |
| Lucide React (Icons) | Latest |
| Vite | Latest |

---

## 📁 Project Structure

```
EduTrack/
├── backend/
│   ├── src/main/java/com/edutrack/lms/
│   │   ├── config/              # Security configuration
│   │   ├── controller/          # REST API controllers
│   │   │   ├── AuthController.java
│   │   │   ├── CourseController.java
│   │   │   ├── EnrollmentController.java
│   │   │   ├── AssignmentController.java
│   │   │   ├── SubmissionController.java
│   │   │   ├── DiscussionPostController.java
│   │   │   └── AdminController.java
│   │   ├── dto/                 # Request/Response DTOs
│   │   ├── entity/              # JPA Entities
│   │   ├── exception/           # Global Exception Handling
│   │   ├── repository/          # Spring Data Repositories
│   │   ├── security/            # JWT Provider & Filters
│   │   └── EduTrackLmsApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── schema.sql
│   │   └── data.sql
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardCards.jsx
│   │   │   ├── ManagementPanels.jsx
│   │   │   └── ReportsPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- JDK 21
- Maven 3.x
- MySQL 8.0
- Node.js v18+
- npm

---

### Step 1 — Database Setup

```sql
CREATE DATABASE edutrack_lms_db;
```

> `schema.sql` and `data.sql` under `backend/src/main/resources/` will auto-run on startup and seed sample data.

---

### Step 2 — Configure Backend

Open `backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/edutrack_lms_db
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### Step 3 — Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

✅ API runs at: `http://localhost:8080/api`  
✅ Swagger UI: `http://localhost:8080/api/swagger-ui.html`

---

### Step 4 — Run Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ App runs at: `http://localhost:3000`

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edutrack.com | password |
| Instructor | instructor@edutrack.com | password |
| Student | student@edutrack.com | password |

---

## 📡 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/courses` | All | List all courses |
| POST | `/api/courses` | Instructor | Create course |
| PUT | `/api/courses/{id}` | Instructor | Update course |
| DELETE | `/api/courses/{id}` | Admin | Delete course |
| POST | `/api/enrollments` | Student | Enroll in course |
| GET | `/api/enrollments` | Student | My enrollments |
| POST | `/api/assignments` | Instructor | Create assignment |
| POST | `/api/submissions` | Student | Submit assignment |
| GET | `/api/discussions` | All | View discussions |
| POST | `/api/discussions` | All | Post message |
| GET | `/api/admin/users` | Admin | Manage users |

---

## 🐳 Docker (Frontend)

```bash
cd frontend
docker build -t edutrack-frontend .
docker run -p 3000:3000 edutrack-frontend
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Bhoopathy P** — Java Full Stack Developer | 2026 Batch  
📧 bhoopathysjcetbe@gmail.com  
🐙 [github.com/Bhoopathy-P](https://github.com/Bhoopathy-P)
