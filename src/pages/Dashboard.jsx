import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Search,
  BookMarked,
  X,
  FileText,
  UserCheck,
  UserX,
  Award,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "default";

  // State lists
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [instructorSubmissions, setInstructorSubmissions] = useState([]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Error/Success Notification alerts
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Course Creator Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [modalCourse, setModalCourse] = useState(null); // null means "Create", otherwise "Edit"
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
    modules: []
  });

  // Load appropriate data based on role
  useEffect(() => {
    fetchDashboardData();
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      // 1. Fetch courses (everyone can see relevant courses)
      const coursesRes = await axios.get("/api/courses");
      setCourses(coursesRes.data);

      if (user.role === "STUDENT") {
        const enrollRes = await axios.get("/api/enrollments");
        setEnrollments(enrollRes.data);
      }

      if (user.role === "INSTRUCTOR") {
        // Fetch submissions for courses
        const subRes = await axios.get("/api/submissions");
        setInstructorSubmissions(subRes.data);
      }

      if (user.role === "ADMIN") {
        const usersRes = await axios.get("/api/admin/users");
        setAdminUsers(usersRes.data);

        const statsRes = await axios.get("/api/admin/stats");
        setAdminStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      triggerAlert("error", "Failed to refresh dashboard data.");
    }
  };

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 5000);
  };

  // Student Actions
  const handleEnroll = async (courseId) => {
    try {
      await axios.post("/api/enrollments", { courseId });
      triggerAlert("success", "Enrolled successfully! Enjoy your learning.");
      fetchDashboardData();
      setSearchParams({ tab: "enrolled" });
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Enrollment failed.");
    }
  };

  // Instructor Course CRUD
  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setModalCourse(course);
      setCourseForm({
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        thumbnail: course.thumbnail,
        modules: course.modules || []
      });
    } else {
      setModalCourse(null);
      setCourseForm({
        title: "",
        description: "",
        category: "Web Development",
        price: "",
        thumbnail: "",
        modules: []
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      triggerAlert("error", "Title and Description are required");
      return;
    }

    try {
      if (modalCourse) {
        // Update
        await axios.put(`/api/courses/${modalCourse.id}`, courseForm);
        triggerAlert("success", "Course updated successfully! Resubmitted for Admin review.");
      } else {
        // Create
        await axios.post("/api/courses", courseForm);
        triggerAlert("success", "Course created! Pending administrator approval.");
      }
      setShowCourseModal(false);
      fetchDashboardData();
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to save course.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/courses/${courseId}`);
      triggerAlert("success", "Course deleted successfully.");
      fetchDashboardData();
    } catch (error) {
      triggerAlert("error", "Failed to delete course.");
    }
  };

  // Modules/Lectures Builder inside Modal
  const addModule = () => {
    const nextId = courseForm.modules.length + 1;
    setCourseForm((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { id: Date.now(), title: `Module ${nextId}: New Module`, order: nextId, lectures: [] }
      ]
    }));
  };

  const removeModule = (moduleId) => {
    setCourseForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId)
    }));
  };

  const updateModuleTitle = (moduleId, title) => {
    setCourseForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, title } : m))
    }));
  };

  const addLecture = (moduleId) => {
    setCourseForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id === moduleId) {
          const nextId = m.lectures.length + 1;
          return {
            ...m,
            lectures: [
              ...m.lectures,
              { id: Date.now(), title: `Lecture ${nextId}: Lecture Video`, contentUrl: "", type: "VIDEO" }
            ]
          };
        }
        return m;
      })
    }));
  };

  const updateLecture = (moduleId, lectureId, field, value) => {
    setCourseForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lectures: m.lectures.map((l) => (l.id === lectureId ? { ...l, [field]: value } : l))
          };
        }
        return m;
      })
    }));
  };

  const removeLecture = (moduleId, lectureId) => {
    setCourseForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, lectures: m.lectures.filter((l) => l.id !== lectureId) };
        }
        return m;
      })
    }));
  };

  // Instructor Grading Action
  const handleGradeSubmission = async (subId, grade) => {
    if (!grade) return;
    try {
      await axios.put(`/api/submissions/${subId}/grade`, { grade });
      triggerAlert("success", `Submission graded "${grade}" successfully!`);
      fetchDashboardData();
    } catch (error) {
      triggerAlert("error", "Failed to post grade.");
    }
  };

  // Admin Actions
  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { active: !currentActive });
      triggerAlert("success", "User status updated successfully.");
      fetchDashboardData();
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleApproveCourse = async (courseId, approve) => {
    const status = approve ? "APPROVED" : "REJECTED";
    try {
      await axios.put(`/api/admin/courses/${courseId}/status`, { status });
      triggerAlert("success", `Course is now ${status.toLowerCase()}.`);
      fetchDashboardData();
    } catch (error) {
      triggerAlert("error", "Failed to update course status.");
    }
  };

  // Category list
  const categories = ["All", "Web Development", "Backend Development", "Design", "Business", "General"];

  // Filter approved courses for student browsing
  const filteredApprovedCourses = courses.filter((c) => {
    if (c.status !== "APPROVED") return false;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Notifications/Alert Banner */}
      {alert.message && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 max-w-md ${
          alert.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Profile Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center pr-10">
          <BookOpen className="h-64 w-64 rotate-12 text-white" />
        </div>
        <div className="relative z-10">
          <span className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-indigo-500/30">
            {user.role} Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-3 tracking-tight">
            Hello, {user.name}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
            Welcome back to EduTrack. Access your catalog, review assignments, and manage your learning itinerary effortlessly.
          </p>
        </div>
      </div>

      {/* =========================================================================
          1. STUDENT DASHBOARD
          ========================================================================= */}
      {user.role === "STUDENT" && (
        <div>
          {/* Subtabs for Student */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-px">
            <button
              onClick={() => setSearchParams({ tab: "enrolled" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "enrolled" || activeTab === "default"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              My Enrolled Courses
            </button>
            <button
              onClick={() => setSearchParams({ tab: "all" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Explore Course Catalog
            </button>
          </div>

          {/* TAB: Enrolled Courses */}
          {(activeTab === "enrolled" || activeTab === "default") && (
            <div>
              {enrollments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <div className="bg-slate-50 text-slate-400 p-4 rounded-full inline-block mb-4">
                    <BookMarked className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No enrollments yet</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-6">
                    You haven't enrolled in any courses yet. Browse our professional syllabus catalog to start learning.
                  </p>
                  <button
                    onClick={() => setSearchParams({ tab: "all" })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-100"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((en) => {
                    const c = en.course;
                    if (!c) return null;
                    return (
                      <div
                        key={en.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row"
                      >
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-full sm:w-44 h-40 object-cover"
                        />
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">
                              {c.category}
                            </span>
                            <h3 className="font-bold text-slate-800 text-base mt-2 line-clamp-1">{c.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">Instructor: {c.instructorName}</p>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-600">
                              <span>Course Progress</span>
                              <span>{en.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full transition-all duration-500"
                                style={{ width: `${en.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-5 flex justify-end">
                            <Link
                              to={`/courses/${c.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Continue Syllabus
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Browse Catalog */}
          {activeTab === "all" && (
            <div>
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                <div className="relative flex-grow max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses, syllabi, topics..."
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Catalog Grid */}
              {filteredApprovedCourses.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-400 text-sm">No courses matching your filters were found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApprovedCourses.map((c) => {
                    const isEnrolled = enrollments.some((e) => e.courseId === c.id);
                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-5">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-full">
                              {c.category}
                            </span>
                            <h3 className="font-bold text-slate-800 text-base mt-3 line-clamp-1">
                              {c.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                              {c.description}
                            </p>
                            <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                              <span>Instructor: {c.instructorName}</span>
                              <span className="font-bold text-slate-700">
                                {c.price > 0 ? `$${c.price.toFixed(2)}` : "Free"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-2 border-t border-slate-50 flex justify-between items-center">
                          {isEnrolled ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Enrolled
                            </span>
                          ) : (
                            <button
                              id={`enroll-btn-${c.id}`}
                              onClick={() => handleEnroll(c.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                            >
                              Enroll Course
                            </button>
                          )}
                          <Link
                            to={`/courses/${c.id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            View Syllabus
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          2. INSTRUCTOR DASHBOARD
          ========================================================================= */}
      {user.role === "INSTRUCTOR" && (
        <div>
          {/* Tabs for Instructor */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-px">
            <button
              onClick={() => setSearchParams({ tab: "mycourses" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "mycourses" || activeTab === "default"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setSearchParams({ tab: "submissions" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "submissions"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Submissions Grading
            </button>
          </div>

          {/* TAB: My Courses */}
          {(activeTab === "mycourses" || activeTab === "default") && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Your Created Syllabi</h2>
                <button
                  id="create-course-btn"
                  onClick={() => handleOpenCourseModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Create Course
                </button>
              </div>

              {courses.filter((c) => c.instructorId === user.id).length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <div className="bg-slate-50 text-slate-400 p-4 rounded-full inline-block mb-4">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No courses designed yet</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-6">
                    Launch your first online syllabus today. Build modules, draft text lectures, and grade assignments.
                  </p>
                  <button
                    onClick={() => handleOpenCourseModal(null)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
                  >
                    Draft First Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter((c) => c.instructorId === user.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative">
                            <img
                              src={c.thumbnail}
                              alt={c.title}
                              className="w-full h-44 object-cover"
                            />
                            <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                              c.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : c.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <div className="p-5">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">
                              {c.category}
                            </span>
                            <h3 className="font-bold text-slate-800 text-base mt-3 line-clamp-1">
                              {c.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                              {c.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex justify-between items-center">
                          <Link
                            to={`/courses/${c.id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            Manage Content
                          </Link>
                          <div className="flex gap-2">
                            <button
                              id={`edit-course-btn-${c.id}`}
                              onClick={() => handleOpenCourseModal(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all border border-slate-100"
                              title="Edit Details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              id={`delete-course-btn-${c.id}`}
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100"
                              title="Delete Course"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Submissions Grading */}
          {activeTab === "submissions" && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6">Student Submissions</h2>
              {instructorSubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-400 text-sm">No submissions to grade yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-4 px-6">Student</th>
                          <th className="py-4 px-6">Assignment / Quiz</th>
                          <th className="py-4 px-6">Submission Link / Text</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {instructorSubmissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-6">
                              <p className="font-semibold text-slate-800">{sub.studentName}</p>
                              <p className="text-slate-400 text-[10px]">{sub.studentEmail}</p>
                            </td>
                            <td className="py-4 px-6 text-slate-700 font-medium">
                              {sub.assignmentTitle}
                            </td>
                            <td className="py-4 px-6">
                              <a
                                href={sub.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline truncate max-w-xs inline-block font-medium"
                              >
                                {sub.fileUrl}
                              </a>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                sub.status === "GRADED"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600 animate-pulse"
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {sub.status === "GRADED" ? (
                                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-sm">
                                  {sub.grade}
                                </span>
                              ) : (
                                <div className="flex gap-2 max-w-[150px]">
                                  <input
                                    type="text"
                                    placeholder="e.g. A+"
                                    id={`grade-input-${sub.id}`}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleGradeSubmission(sub.id, e.target.value);
                                      }
                                    }}
                                    className="block w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                  />
                                  <button
                                    onClick={(e) => {
                                      const input = document.getElementById(`grade-input-${sub.id}`);
                                      handleGradeSubmission(sub.id, input.value);
                                    }}
                                    className="bg-slate-800 text-white px-2.5 py-1 rounded-lg hover:bg-black font-semibold text-xs cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. ADMIN DASHBOARD
          ========================================================================= */}
      {user.role === "ADMIN" && (
        <div>
          {/* Platform Stat Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-indigo-600 bg-indigo-50 p-2 rounded-xl w-10 h-10 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.totalStudents || 0}</h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2 rounded-xl w-10 h-10 mb-3">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructors</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.totalInstructors || 0}</h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-rose-600 bg-rose-50 p-2 rounded-xl w-10 h-10 mb-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.totalCourses || 0}</h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-amber-600 bg-amber-50 p-2 rounded-xl w-10 h-10 mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.pendingCourses || 0}</h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-sky-600 bg-sky-50 p-2 rounded-xl w-10 h-10 mb-3">
                <BookMarked className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrollments</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.totalEnrollments || 0}</h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center text-violet-600 bg-violet-50 p-2 rounded-xl w-10 h-10 mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Progress</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{adminStats.averageProgress || 0}%</h3>
            </div>
          </div>

          {/* Subtabs for Admin */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-px">
            <button
              onClick={() => setSearchParams({ tab: "users" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "users" || activeTab === "default"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              User Accounts Management
            </button>
            <button
              onClick={() => setSearchParams({ tab: "approvals" })}
              className={`pb-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "approvals"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Course Syllabi Approvals
            </button>
          </div>

          {/* TAB: User management */}
          {(activeTab === "users" || activeTab === "default") && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Platform User Directory</h2>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Account Status</th>
                        <th className="py-4 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-6 font-mono text-slate-400">{u.id}</td>
                          <td className="py-4 px-6 font-semibold text-slate-800">{u.name}</td>
                          <td className="py-4 px-6 text-slate-500">{u.email}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                              u.role === "ADMIN"
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : u.role === "INSTRUCTOR"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-sky-50 border-sky-200 text-sky-600"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${u.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                            <span className="font-medium">{u.active ? "Active" : "Deactivated"}</span>
                          </td>
                          <td className="py-4 px-6">
                            {u.role !== "ADMIN" && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.active)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  u.active
                                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                                }`}
                              >
                                {u.active ? (
                                  <>
                                    <UserX className="h-3.5 w-3.5" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3.5 w-3.5" /> Activate
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Course Approvals */}
          {activeTab === "approvals" && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Course Launch Approvals</h2>
              {courses.filter((c) => c.status === "PENDING").length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-400 text-sm">No courses currently waiting for approval.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-4 px-6">Course Syllabus</th>
                          <th className="py-4 px-6">Instructor</th>
                          <th className="py-4 px-6">Category / Price</th>
                          <th className="py-4 px-6">Modules count</th>
                          <th className="py-4 px-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                        {courses
                          .filter((c) => c.status === "PENDING")
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="py-4 px-6">
                                <div className="flex gap-3 items-center">
                                  <img src={c.thumbnail} className="h-10 w-16 object-cover rounded" alt="Thumbnail" />
                                  <div>
                                    <p className="font-semibold text-slate-800">{c.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-medium">{c.instructorName}</td>
                              <td className="py-4 px-6">
                                <p className="font-bold">{c.category}</p>
                                <p className="text-slate-400 text-[10px]">${c.price}</p>
                              </td>
                              <td className="py-4 px-6 font-bold">{c.modules ? c.modules.length : 0} modules</td>
                              <td className="py-4 px-6">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveCourse(c.id, true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveCourse(c.id, false)}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 border border-rose-200 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. INSTRUCTOR COURSE BUILDER MODAL
          ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 animate-fade-in relative">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-display font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
              {modalCourse ? "Edit Course Syllabus" : "Design New Course Syllabus"}
            </h2>

            <form onSubmit={handleSaveCourse} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Master React JS"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Course Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Draft syllabus objectives and goals..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 49.99"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Modules & Lectures List Builder */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Syllabus Structure (Modules & Lectures)</h3>
                  <button
                    type="button"
                    onClick={addModule}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Module
                  </button>
                </div>

                {courseForm.modules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center p-4 border border-dashed border-slate-200 rounded-xl">
                    No modules added. Add a module to start attaching lectures.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {courseForm.modules.map((m) => (
                      <div key={m.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex gap-2 items-center justify-between mb-3">
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => updateModuleTitle(m.id, e.target.value)}
                            className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex-grow max-w-md"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addLecture(m.id)}
                              className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-md font-bold"
                            >
                              + Lecture
                            </button>
                            <button
                              type="button"
                              onClick={() => removeModule(m.id)}
                              className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lectures list within module */}
                        {m.lectures.length > 0 && (
                          <div className="space-y-2 mt-2 pl-4 border-l-2 border-indigo-100">
                            {m.lectures.map((l) => (
                              <div key={l.id} className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                                <div className="flex gap-2 items-center justify-between">
                                  <input
                                    type="text"
                                    value={l.title}
                                    placeholder="Lecture Title"
                                    onChange={(e) => updateLecture(m.id, l.id, "title", e.target.value)}
                                    className="bg-slate-50 px-2 py-1 border border-slate-100 rounded text-xs font-medium text-slate-700 flex-grow"
                                  />
                                  <select
                                    value={l.type}
                                    onChange={(e) => updateLecture(m.id, l.id, "type", e.target.value)}
                                    className="bg-slate-50 px-2 py-1 border border-slate-100 rounded text-xs text-slate-600"
                                  >
                                    <option value="VIDEO">Video Embed</option>
                                    <option value="TEXT">Markdown Content</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeLecture(m.id, l.id)}
                                    className="text-rose-500 hover:text-rose-700 p-0.5"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder={l.type === "VIDEO" ? "Video URL (e.g., https://www.youtube.com/embed/...)" : "Lecture plain text or content description..."}
                                  value={l.contentUrl}
                                  onChange={(e) => updateLecture(m.id, l.id, "contentUrl", e.target.value)}
                                  className="w-full bg-slate-50 px-2 py-1 border border-slate-100 rounded text-xs text-slate-500 placeholder-slate-400"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
                >
                  Save Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
