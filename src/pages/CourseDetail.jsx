import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Plus,
  X,
  PlusCircle,
  CheckSquare
} from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Lecture state
  const [activeLecture, setActiveLecture] = useState(null);

  // Discussion state
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [newPostMessage, setNewPostMessage] = useState("");
  const [replyPostId, setReplyPostId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    type: "ASSIGNMENT"
  });

  // Submission Form state per assignment
  const [submitUrls, setSubmitUrls] = useState({}); // { [assignId]: url }

  // Alerts
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchCourseDetail();
  }, [id, user]);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 5000);
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      // Get course details
      const courseRes = await axios.get(`/api/courses/${id}`);
      setCourse(courseRes.data);

      // Check enrollment if student
      if (user) {
        const enrollRes = await axios.get("/api/enrollments");
        const currentEnroll = enrollRes.data.find((e) => e.courseId === parseInt(id));
        setEnrollment(currentEnroll || null);

        // Fetch Assignments & Discussions
        const assignRes = await axios.get(`/api/assignments?courseId=${id}`);
        setAssignments(assignRes.data);

        const subRes = await axios.get("/api/submissions");
        setStudentSubmissions(subRes.data);

        const discRes = await axios.get(`/api/discussions?courseId=${id}`);
        setDiscussionPosts(discRes.data);

        // Pre-select first lecture if available
        if (courseRes.data.modules && courseRes.data.modules.length > 0) {
          const firstModule = courseRes.data.modules[0];
          if (firstModule.lectures && firstModule.lectures.length > 0) {
            setActiveLecture(firstModule.lectures[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course detail:", error);
      triggerAlert("error", "Course not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  // Student: mark lecture completed
  const handleMarkCompleted = async (lectureId) => {
    if (!enrollment) return;
    try {
      const response = await axios.post("/api/enrollments/complete-lecture", {
        courseId: course.id,
        lectureId
      });
      setEnrollment(response.data);
      triggerAlert("success", "Lecture progress registered!");
    } catch (error) {
      console.error(error);
      triggerAlert("error", "Failed to mark lecture complete.");
    }
  };

  // Student: submit assignment/quiz
  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    const url = submitUrls[assignmentId];
    if (!url) {
      triggerAlert("error", "Please provide a solution link or plain response text.");
      return;
    }

    try {
      await axios.post("/api/submissions", {
        assignmentId,
        fileUrl: url
      });
      triggerAlert("success", "Assignment solution uploaded! Reviewing pending.");
      // Refresh submissions
      const subRes = await axios.get("/api/submissions");
      setStudentSubmissions(subRes.data);
      setSubmitUrls({ ...submitUrls, [assignmentId]: "" });
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Submission failed.");
    }
  };

  // Instructor: add assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const { title, description, dueDate, type } = assignForm;
    if (!title || !description || !dueDate) {
      triggerAlert("error", "Please fill in all details.");
      return;
    }

    try {
      await axios.post("/api/assignments", {
        courseId: course.id,
        title,
        description,
        dueDate,
        type
      });
      triggerAlert("success", `New ${type === "QUIZ" ? "Quiz" : "Assignment"} created! Students notified.`);
      setShowAssignModal(false);
      setAssignForm({ title: "", description: "", dueDate: "", type: "ASSIGNMENT" });

      // Refresh assignments
      const assignRes = await axios.get(`/api/assignments?courseId=${id}`);
      setAssignments(assignRes.data);
    } catch (error) {
      triggerAlert("error", "Failed to design assignment.");
    }
  };

  // Discussion Forums Actions
  const handleCreateDiscussionPost = async (e) => {
    e.preventDefault();
    if (!newPostMessage.trim()) return;

    try {
      await axios.post("/api/discussions", {
        courseId: course.id,
        message: newPostMessage
      });
      setNewPostMessage("");
      // Refresh discussions
      const discRes = await axios.get(`/api/discussions?courseId=${id}`);
      setDiscussionPosts(discRes.data);
    } catch (error) {
      triggerAlert("error", "Failed to publish question.");
    }
  };

  const handleCreateDiscussionReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      await axios.post("/api/discussions", {
        courseId: course.id,
        message: replyMessage,
        parentId
      });
      setReplyMessage("");
      setReplyPostId(null);
      // Refresh discussions
      const discRes = await axios.get(`/api/discussions?courseId=${id}`);
      setDiscussionPosts(discRes.data);
    } catch (error) {
      triggerAlert("error", "Failed to submit reply.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold animate-pulse text-sm">Synchronizing course catalog...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-6">Course content could not be located.</p>
        <Link to="/dashboard" className="text-indigo-600 font-bold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Group discussion posts into parents and children
  const topLevelPosts = discussionPosts.filter((p) => p.parentId === null);
  const getRepliesForPost = (postId) => discussionPosts.filter((p) => p.parentId === postId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Alert banner */}
      {alert.message && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 max-w-md ${
          alert.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <CheckSquare className="h-5 w-5" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {course.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-800 mt-1">{course.title}</h1>
          </div>
        </div>

        {/* Course progress block or instructor badge */}
        {enrollment ? (
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-4">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Progress</p>
              <p className="text-sm font-bold text-slate-800">{enrollment.progress || 0}% Completed</p>
            </div>
            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs font-semibold text-indigo-700">
            Instructor: {course.instructorName}
          </div>
        )}
      </div>

      {/* Main Grid: Left Curriculum Syllabus, Center Screen View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Syllabus Index (Modules / Lectures tree) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Course Curriculum
            </h2>

            {course.modules.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No modules published in this curriculum.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {course.modules.map((m) => (
                  <div key={m.id} className="space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg truncate border-l-2 border-slate-400">
                      {m.title}
                    </h3>
                    {m.lectures && m.lectures.length > 0 ? (
                      <div className="pl-2 space-y-1">
                        {m.lectures.map((l) => {
                          const isCompleted = enrollment?.completedLectures?.includes(l.id);
                          const isActive = activeLecture?.id === l.id;
                          return (
                            <button
                              key={l.id}
                              onClick={() => setActiveLecture(l)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                                isActive
                                  ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-100"
                                  : "bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {l.type === "VIDEO" ? (
                                  <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 shrink-0" />
                                )}
                                <span className="truncate">{l.title}</span>
                              </div>
                              {isCompleted && (
                                <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic pl-4">No lectures created.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Lecture Screen & Tabbed Panels */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* LECTURE VIEWER PANEL */}
          {activeLecture ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {activeLecture.type === "VIDEO" ? "VIDEO INSTRUCTION" : "TEXT LECTURE"}
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 mt-1">{activeLecture.title}</h2>
                </div>

                {enrollment && (
                  <button
                    onClick={() => handleMarkCompleted(activeLecture.id)}
                    disabled={enrollment?.completedLectures?.includes(activeLecture.id)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                      enrollment?.completedLectures?.includes(activeLecture.id)
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-slate-800 border-slate-800 text-white hover:bg-black"
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {enrollment?.completedLectures?.includes(activeLecture.id) ? "Completed" : "Mark Complete"}
                  </button>
                )}
              </div>

              {/* Viewer body */}
              <div className="mt-4">
                {activeLecture.type === "VIDEO" ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200">
                    <iframe
                      width="100%"
                      height="100%"
                      src={activeLecture.contentUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                      title={activeLecture.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[250px] leading-relaxed text-sm text-slate-700 font-sans whitespace-pre-wrap">
                    {activeLecture.contentUrl || "No content written for this lecture. Draft text or syllabus guidelines inside this field."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Please select a lecture module from the left tree index to begin studying.</p>
            </div>
          )}

          {/* TABBED INTERFACES: 1. ASSIGNMENTS & QUIZZES, 2. DISCUSSION BOARD */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex border-b border-slate-100 mb-6 pb-px overflow-x-auto">
              <span className="font-display font-bold text-slate-800 mr-8 pb-3 text-base">Assignments & Class Activity</span>
            </div>

            {/* ASSIGNMENTS MODULE LIST */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Exercises & Quizzes</h3>
                {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Design Assignment / Quiz
                  </button>
                )}
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                  No graded exercises or quizzes have been assigned yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {assignments.map((as) => {
                    // Check if student has submitted
                    const submission = studentSubmissions.find((s) => s.assignmentId === as.id && s.studentId === user.id);
                    const isSubmitted = !!submission;

                    return (
                      <div key={as.id} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                              as.type === "QUIZ" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                            }`}>
                              {as.type}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">{as.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Due: {as.dueDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{as.description}</p>

                        {/* Submission status or form */}
                        {user.role === "STUDENT" && (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            {isSubmitted ? (
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="text-xs">
                                  <p className="text-slate-400">Your Solution Link:</p>
                                  <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">
                                    {submission.fileUrl}
                                  </a>
                                </div>
                                <div className="text-right">
                                  <p className="text-slate-400 text-[10px]">Status / Grade</p>
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                    submission.status === "GRADED"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-600"
                                  }`}>
                                    {submission.status === "GRADED" ? `Graded: ${submission.grade}` : "Awaiting Grade"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <form onSubmit={(e) => handleSubmitAssignment(e, as.id)} className="flex gap-2">
                                <input
                                  type="text"
                                  required
                                  value={submitUrls[as.id] || ""}
                                  onChange={(e) => setSubmitUrls({ ...submitUrls, [as.id]: e.target.value })}
                                  placeholder={as.type === "QUIZ" ? "Enter your answer text here..." : "GitHub Repository Link or Google Drive URL..."}
                                  className="flex-grow bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs"
                                />
                                <button
                                  type="submit"
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
                                >
                                  Submit
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COURSE DISCUSSION BOARD */}
            <div className="border-t border-slate-100 mt-8 pt-8 space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Forum Board</h3>

              {/* Post query form */}
              <form onSubmit={handleCreateDiscussionPost} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newPostMessage}
                  onChange={(e) => setNewPostMessage(e.target.value)}
                  placeholder="Have a question about modules? Publish it here..."
                  className="flex-grow bg-slate-50 px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-black text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Message Feed Threads */}
              {topLevelPosts.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                  No discussion threads started yet. Be the first to ask!
                </p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {topLevelPosts.map((post) => {
                    const replies = getRepliesForPost(post.id);
                    return (
                      <div key={post.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{post.userName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{post.message}</p>

                        {/* Reply links */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setReplyPostId(replyPostId === post.id ? null : post.id);
                              setReplyMessage("");
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" /> Reply Thread
                          </button>
                          <span className="text-[10px] text-slate-400">{replies.length} replies</span>
                        </div>

                        {/* Reply submission form */}
                        {replyPostId === post.id && (
                          <form onSubmit={(e) => handleCreateDiscussionReply(e, post.id)} className="mt-3 flex gap-2 pl-4">
                            <input
                              type="text"
                              required
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder={`Reply to ${post.userName}...`}
                              className="flex-grow bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                            >
                              Send
                            </button>
                          </form>
                        )}

                        {/* Child replies */}
                        {replies.length > 0 && (
                          <div className="space-y-2 mt-3 pl-4 border-l-2 border-indigo-100">
                            {replies.map((reply) => (
                              <div key={reply.id} className="bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-700">{reply.userName}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. ASSIGNMENT / QUIZ DESIGNER MODAL (Instructors)
          ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 sm:p-8 animate-fade-in relative">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-display font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
              Design Exercise
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. Profiling Cards with Grid"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Exercise Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["ASSIGNMENT", "QUIZ"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAssignForm({ ...assignForm, type: t })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        assignForm.type === t
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Instructions / Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={assignForm.description}
                  onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="Outline submission instructions, code parameters, or quiz questions clearly..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
                >
                  Design Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
