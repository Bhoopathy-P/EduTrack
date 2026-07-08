import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory or data.json file storage for persistence across reloads
const DATA_FILE = path.join(process.cwd(), "data.json");

// Helper to load data
function loadData() {
  const initialData = {
    users: [
      { id: 1, name: "Admin User", email: "admin@edutrack.com", password: "password123", role: "ADMIN", active: true },
      { id: 2, name: "Dr. Jane Doe", email: "instructor@edutrack.com", password: "password123", role: "INSTRUCTOR", active: true },
      { id: 3, name: "Alice Smith", email: "student@edutrack.com", password: "password123", role: "STUDENT", active: true },
      { id: 4, name: "Bob Johnson", email: "bob@edutrack.com", password: "password123", role: "STUDENT", active: true }
    ],
    courses: [
      {
        id: 1,
        title: "Introduction to React & Tailwind CSS",
        description: "Learn how to build beautiful, modern, and responsive user interfaces using React and Tailwind CSS. We will cover components, state, hooks, and clean utility design.",
        instructorId: 2,
        instructorName: "Dr. Jane Doe",
        category: "Web Development",
        price: 99.99,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60",
        status: "APPROVED",
        modules: [
          {
            id: 101,
            title: "Module 1: Getting Started with React",
            order: 1,
            lectures: [
              { id: 1001, title: "1.1 Introduction to the Course", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "VIDEO" },
              { id: 1002, title: "1.2 Setting Up Your Environment", contentUrl: "Open your terminal and run 'npm create vite@latest' to bootstrap a clean workspace. Use CSS grid and flexbox inside Tailwind to arrange containers.", type: "TEXT" }
            ]
          },
          {
            id: 102,
            title: "Module 2: Tailwind Styling Foundations",
            order: 2,
            lectures: [
              { id: 1003, title: "2.1 Utility-First Principles", contentUrl: "We prioritize utility-first design: no custom styles or random paddings, use consistent margins like 'p-6', 'space-y-4', and soft slate-colored backgrounds.", type: "TEXT" },
              { id: 1004, title: "2.2 Designing Dark Modes", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "VIDEO" }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "Advanced Java Programming & Spring Boot",
        description: "Deep dive into Java 21 features, Spring Framework 6, JPA/Hibernate, Spring Security with JWT tokens, and building scalable production backends.",
        instructorId: 2,
        instructorName: "Dr. Jane Doe",
        category: "Backend Development",
        price: 149.99,
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60",
        status: "APPROVED",
        modules: [
          {
            id: 201,
            title: "Module 1: Java 21 Virtual Threads & Structured Concurrency",
            order: 1,
            lectures: [
              { id: 2001, title: "1.1 Java 21 Overview", contentUrl: "Java 21 introduces virtual threads (Project Loom) that simplify writing high-throughput, concurrent applications.", type: "TEXT" }
            ]
          }
        ]
      }
    ],
    enrollments: [
      { id: 1, studentId: 3, courseId: 1, progress: 50, enrolledDate: "2026-06-01", completedLectures: [1001, 1002] }
    ],
    assignments: [
      { id: 1, courseId: 1, title: "Assignment 1: Responsive Card Layout", description: "Design a responsive profile card using React functional components and Tailwind CSS utility classes. Submit a live website URL or source code path.", dueDate: "2026-07-20", type: "ASSIGNMENT" },
      { id: 2, courseId: 1, title: "Module 1 Quiz: React Basics", description: "Complete the questions: 1. What hook manages state? 2. What are the key benefits of virtual DOM?", dueDate: "2026-07-15", type: "QUIZ" }
    ],
    submissions: [
      { id: 1, assignmentId: 1, studentId: 3, fileUrl: "https://github.com/alice/react-card", grade: "A", status: "GRADED", submissionDate: "2026-07-01T12:00:00Z" }
    ],
    discussions: [
      { id: 1, courseId: 1, userId: 3, userName: "Alice Smith", message: "Hi Dr. Doe, will we cover advanced routing in React Router v6?", parentId: null, createdAt: "2026-07-01T14:30:00Z" },
      { id: 2, courseId: 1, userId: 2, userName: "Dr. Jane Doe", message: "Yes, Alice! Module 3 will cover loaders, nested routing, and action hooks.", parentId: 1, createdAt: "2026-07-01T16:00:00Z" }
    ],
    notifications: [
      { id: 1, userId: 3, title: "Assignment Graded", message: "Your submission for 'Assignment 1: Responsive Card Layout' was graded 'A'!", read: false, createdAt: "2026-07-01T16:05:00Z" }
    ]
  };

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
  } catch (e) {
    console.error("Error reading data.json, returning defaults:", e);
    return initialData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving data.json:", e);
  }
}

// Ensure database file is initialized
let db = loadData();

// Simple Middlewares
function getUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return decoded.id;
  } catch (e) {
    return null;
  }
}

function authFilter(req, res, next) {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }
  const user = db.users.find((u) => u.id === userId);
  if (!user || !user.active) {
    return res.status(401).json({ message: "Unauthorized: User inactive or not found" });
  }
  req.user = user;
  next();
}

function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
}

// 1. Authentication APIs
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    password, // Plain encryption-simulated password check
    role: role.toUpperCase(),
    active: true,
  };

  db.users.push(newUser);
  saveData(db);

  // Sign dummy JWT token
  const tokenPayload = { id: newUser.id, email: newUser.email, role: newUser.role };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.active) {
    return res.status(403).json({ message: "Your account has been deactivated by Admin." });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Get current logged-in user profile
app.get("/api/auth/me", authFilter, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// 2. Course APIs (CRUD)
app.get("/api/courses", (req, res) => {
  // Students and guests see APPROVED courses
  // Instructors see courses they teach + approved
  // Admins see all
  const userId = getUserIdFromToken(req.headers.authorization);
  const user = userId ? db.users.find((u) => u.id === userId) : null;

  let courses = db.courses;

  if (!user) {
    courses = courses.filter((c) => c.status === "APPROVED");
  } else if (user.role === "STUDENT") {
    courses = courses.filter((c) => c.status === "APPROVED");
  } else if (user.role === "INSTRUCTOR") {
    courses = courses.filter((c) => c.instructorId === user.id || c.status === "APPROVED");
  }

  res.json(courses);
});

app.get("/api/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const course = db.courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.json(course);
});

app.post("/api/courses", authFilter, checkRole(["INSTRUCTOR", "ADMIN"]), (req, res) => {
  const { title, description, category, price, thumbnail, modules } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const newCourse = {
    id: db.courses.length > 0 ? Math.max(...db.courses.map((c) => c.id)) + 1 : 1,
    title,
    description,
    instructorId: req.user.id,
    instructorName: req.user.name,
    category: category || "General",
    price: parseFloat(price) || 0,
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
    status: req.user.role === "ADMIN" ? "APPROVED" : "PENDING", // Admin creations are auto-approved
    modules: modules || []
  };

  db.courses.push(newCourse);
  saveData(db);
  res.status(201).json(newCourse);
});

app.put("/api/courses/:id", authFilter, checkRole(["INSTRUCTOR", "ADMIN"]), (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.courses.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  const course = db.courses[index];
  // Instructors can only edit their own courses
  if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: You do not own this course" });
  }

  const { title, description, category, price, thumbnail, modules } = req.body;

  db.courses[index] = {
    ...course,
    title: title || course.title,
    description: description || course.description,
    category: category || course.category,
    price: price !== undefined ? parseFloat(price) : course.price,
    thumbnail: thumbnail || course.thumbnail,
    modules: modules || course.modules,
    status: req.user.role === "ADMIN" ? course.status : "PENDING" // Re-verify if edited by instructor
  };

  saveData(db);

  // Notify enrolled students on updates
  const enrolledStudents = db.enrollments.filter((e) => e.courseId === id).map((e) => e.studentId);
  enrolledStudents.forEach((studentId) => {
    db.notifications.push({
      id: db.notifications.length + 1,
      userId: studentId,
      title: "Course Updated",
      message: `The course "${db.courses[index].title}" has been updated with new content!`,
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json(db.courses[index]);
});

app.delete("/api/courses/:id", authFilter, checkRole(["INSTRUCTOR", "ADMIN"]), (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.courses.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  const course = db.courses[index];
  if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: You do not own this course" });
  }

  db.courses.splice(index, 1);
  // Clean up associated enrollments
  db.enrollments = db.enrollments.filter((e) => e.courseId !== id);
  saveData(db);

  res.json({ message: "Course deleted successfully" });
});

// 3. Enrollment APIs
app.get("/api/enrollments", authFilter, (req, res) => {
  if (req.user.role === "STUDENT") {
    // Return student's enrollments with course details
    const studentEnrollments = db.enrollments.filter((e) => e.studentId === req.user.id);
    const enriched = studentEnrollments.map((e) => {
      const course = db.courses.find((c) => c.id === e.courseId);
      return { ...e, course };
    });
    res.json(enriched);
  } else {
    // Instructors see enrollments for their courses
    const myCourses = db.courses.filter((c) => c.instructorId === req.user.id).map((c) => c.id);
    const courseEnrollments = db.enrollments.filter((e) => myCourses.includes(e.courseId));
    const enriched = courseEnrollments.map((e) => {
      const student = db.users.find((u) => u.id === e.studentId);
      const course = db.courses.find((c) => c.id === e.courseId);
      return {
        ...e,
        studentName: student ? student.name : "Unknown Student",
        studentEmail: student ? student.email : "",
        courseTitle: course ? course.title : "Unknown Course"
      };
    });
    res.json(enriched);
  }
});

app.post("/api/enrollments", authFilter, checkRole(["STUDENT"]), (req, res) => {
  const { courseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course || course.status !== "APPROVED") {
    return res.status(404).json({ message: "Course not found or not approved" });
  }

  const existing = db.enrollments.find((e) => e.studentId === req.user.id && e.courseId === courseId);
  if (existing) {
    return res.status(400).json({ message: "You are already enrolled in this course" });
  }

  const newEnrollment = {
    id: db.enrollments.length > 0 ? Math.max(...db.enrollments.map((e) => e.id)) + 1 : 1,
    studentId: req.user.id,
    courseId,
    progress: 0,
    enrolledDate: new Date().toISOString().split("T")[0],
    completedLectures: []
  };

  db.enrollments.push(newEnrollment);
  saveData(db);

  res.status(201).json(newEnrollment);
});

// Update lecture completion & progress
app.post("/api/enrollments/complete-lecture", authFilter, checkRole(["STUDENT"]), (req, res) => {
  const { courseId, lectureId } = req.body;
  if (!courseId || !lectureId) {
    return res.status(400).json({ message: "Course ID and Lecture ID are required" });
  }

  const enrollment = db.enrollments.find((e) => e.studentId === req.user.id && e.courseId === courseId);
  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (!enrollment.completedLectures) {
    enrollment.completedLectures = [];
  }

  if (!enrollment.completedLectures.includes(lectureId)) {
    enrollment.completedLectures.push(lectureId);
  }

  // Calculate percentage progress
  const totalLectures = course.modules.reduce((acc, m) => acc + (m.lectures ? m.lectures.length : 0), 0);
  enrollment.progress = totalLectures > 0 ? Math.round((enrollment.completedLectures.length / totalLectures) * 100) : 100;

  saveData(db);
  res.json(enrollment);
});

// 4. Assignments & Quizzes
app.get("/api/assignments", authFilter, (req, res) => {
  const { courseId } = req.query;
  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const courseIdNum = parseInt(courseId);
  const courseAssignments = db.assignments.filter((a) => a.courseId === courseIdNum);
  res.json(courseAssignments);
});

app.post("/api/assignments", authFilter, checkRole(["INSTRUCTOR", "ADMIN"]), (req, res) => {
  const { courseId, title, description, dueDate, type } = req.body;
  if (!courseId || !title || !description || !dueDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newAssignment = {
    id: db.assignments.length > 0 ? Math.max(...db.assignments.map((a) => a.id)) + 1 : 1,
    courseId: parseInt(courseId),
    title,
    description,
    dueDate,
    type: type || "ASSIGNMENT"
  };

  db.assignments.push(newAssignment);
  saveData(db);

  // Notify all students in course
  const course = db.courses.find((c) => c.id === parseInt(courseId));
  const enrolledStudents = db.enrollments.filter((e) => e.courseId === parseInt(courseId)).map((e) => e.studentId);
  enrolledStudents.forEach((studentId) => {
    db.notifications.push({
      id: db.notifications.length + 1,
      userId: studentId,
      title: type === "QUIZ" ? "New Quiz Created" : "New Assignment Created",
      message: `A new ${type === "QUIZ" ? "Quiz" : "Assignment"} "${title}" has been published in "${course ? course.title : "your course"}" due on ${dueDate}.`,
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  res.status(201).json(newAssignment);
});

// 5. Submissions
app.get("/api/submissions", authFilter, (req, res) => {
  const { assignmentId } = req.query;

  if (req.user.role === "STUDENT") {
    let list = db.submissions.filter((s) => s.studentId === req.user.id);
    if (assignmentId) {
      list = list.filter((s) => s.assignmentId === parseInt(assignmentId));
    }
    res.json(list);
  } else {
    // Admin/Instructor can see all submissions or filter by assignmentId
    let list = db.submissions;
    if (assignmentId) {
      list = list.filter((s) => s.assignmentId === parseInt(assignmentId));
    }
    // Enrich with student name
    const enriched = list.map((s) => {
      const student = db.users.find((u) => u.id === s.studentId);
      const assignment = db.assignments.find((a) => a.id === s.assignmentId);
      return {
        ...s,
        studentName: student ? student.name : "Unknown Student",
        studentEmail: student ? student.email : "",
        assignmentTitle: assignment ? assignment.title : "Unknown Assignment"
      };
    });
    res.json(enriched);
  }
});

app.post("/api/submissions", authFilter, checkRole(["STUDENT"]), (req, res) => {
  const { assignmentId, fileUrl } = req.body;
  if (!assignmentId || !fileUrl) {
    return res.status(400).json({ message: "Assignment ID and Submission File / Response URL are required" });
  }

  const assignment = db.assignments.find((a) => a.id === parseInt(assignmentId));
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const existing = db.submissions.find((s) => s.assignmentId === parseInt(assignmentId) && s.studentId === req.user.id);
  if (existing) {
    return res.status(400).json({ message: "You have already submitted this assignment" });
  }

  const newSubmission = {
    id: db.submissions.length > 0 ? Math.max(...db.submissions.map((s) => s.id)) + 1 : 1,
    assignmentId: parseInt(assignmentId),
    studentId: req.user.id,
    fileUrl,
    grade: null,
    status: "PENDING",
    submissionDate: new Date().toISOString()
  };

  db.submissions.push(newSubmission);
  saveData(db);

  res.status(201).json(newSubmission);
});

// Grade Submissions (Instructors)
app.put("/api/submissions/:id/grade", authFilter, checkRole(["INSTRUCTOR", "ADMIN"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { grade } = req.body;
  if (!grade) {
    return res.status(400).json({ message: "Grade is required" });
  }

  const index = db.submissions.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Submission not found" });
  }

  db.submissions[index].grade = grade;
  db.submissions[index].status = "GRADED";
  saveData(db);

  // Notify student
  const sub = db.submissions[index];
  const assignment = db.assignments.find((a) => a.id === sub.assignmentId);
  db.notifications.push({
    id: db.notifications.length + 1,
    userId: sub.studentId,
    title: "Submission Graded",
    message: `Your submission for "${assignment ? assignment.title : "your assignment"}" was graded "${grade}"!`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(db.submissions[index]);
});

// 6. Discussions Forum (Per Course)
app.get("/api/discussions", authFilter, (req, res) => {
  const { courseId } = req.query;
  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const courseIdNum = parseInt(courseId);
  const posts = db.discussions.filter((d) => d.courseId === courseIdNum);
  res.json(posts);
});

app.post("/api/discussions", authFilter, (req, res) => {
  const { courseId, message, parentId } = req.body;
  if (!courseId || !message) {
    return res.status(400).json({ message: "Course ID and message are required" });
  }

  const newPost = {
    id: db.discussions.length > 0 ? Math.max(...db.discussions.map((d) => d.id)) + 1 : 1,
    courseId: parseInt(courseId),
    userId: req.user.id,
    userName: req.user.name,
    message,
    parentId: parentId ? parseInt(parentId) : null,
    createdAt: new Date().toISOString()
  };

  db.discussions.push(newPost);
  saveData(db);

  // If it's a reply, notify the author of the parent post
  if (parentId) {
    const parentPost = db.discussions.find((d) => d.id === parseInt(parentId));
    if (parentPost && parentPost.userId !== req.user.id) {
      db.notifications.push({
        id: db.notifications.length + 1,
        userId: parentPost.userId,
        title: "New Reply in Forum",
        message: `${req.user.name} replied to your question in the course discussion forum.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  res.status(201).json(newPost);
});

// 7. Notifications API
app.get("/api/notifications", authFilter, (req, res) => {
  const myNotifications = db.notifications.filter((n) => n.userId === req.user.id);
  res.json(myNotifications);
});

app.put("/api/notifications/read-all", authFilter, (req, res) => {
  db.notifications.forEach((n) => {
    if (n.userId === req.user.id) {
      n.read = true;
    }
  });
  saveData(db);
  res.json({ message: "All notifications marked as read" });
});

// 8. Admin APIs
// Admin User management: List all users
app.get("/api/admin/users", authFilter, checkRole(["ADMIN"]), (req, res) => {
  res.json(db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })));
});

// Admin User: Activate/Deactivate
app.put("/api/admin/users/:id/status", authFilter, checkRole(["ADMIN"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { active } = req.body;
  if (active === undefined) {
    return res.status(400).json({ message: "Active status boolean is required" });
  }

  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (id === req.user.id) {
    return res.status(400).json({ message: "You cannot deactivate your own admin account!" });
  }

  db.users[userIndex].active = active;
  saveData(db);
  res.json({ message: `User status changed to ${active ? "active" : "inactive"}` });
});

// Admin Courses: list all
app.get("/api/admin/courses", authFilter, checkRole(["ADMIN"]), (req, res) => {
  res.json(db.courses);
});

// Admin Course Approval: approve/reject
app.put("/api/admin/courses/:id/status", authFilter, checkRole(["ADMIN"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body; // "APPROVED" or "REJECTED" or "PENDING"
  if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const index = db.courses.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  db.courses[index].status = status;
  saveData(db);

  // Notify instructor
  const course = db.courses[index];
  db.notifications.push({
    id: db.notifications.length + 1,
    userId: course.instructorId,
    title: status === "APPROVED" ? "Course Approved" : "Course Rejected",
    message: `Your course "${course.title}" was ${status.toLowerCase()} by the Administrator.`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(db.courses[index]);
});

// Platform Statistics
app.get("/api/admin/stats", authFilter, checkRole(["ADMIN"]), (req, res) => {
  const stats = {
    totalStudents: db.users.filter((u) => u.role === "STUDENT").length,
    totalInstructors: db.users.filter((u) => u.role === "INSTRUCTOR").length,
    totalCourses: db.courses.length,
    pendingCourses: db.courses.filter((c) => c.status === "PENDING").length,
    totalEnrollments: db.enrollments.length,
    averageProgress: db.enrollments.length > 0
      ? Math.round(db.enrollments.reduce((sum, e) => sum + e.progress, 0) / db.enrollments.length)
      : 0
  };
  res.json(stats);
});


// Serve static frontend files in production or run Vite development server
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
