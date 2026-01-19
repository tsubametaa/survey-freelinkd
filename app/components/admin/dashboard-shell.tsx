"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  RefreshCcw,
  Search,
  Download,
  X,
  ChevronRight,
  Filter,
  FileText,
  Calendar,
  Briefcase,
} from "lucide-react";
import AdminNavbar from "./navbar";
import AdminSidebar from "./sidebar";
import { QuestionnaireData, Answer } from "../../types/kuesioner";
import { getQuestionText } from "../../lib/questions";

interface AdminDashboardShellProps {
  respondentCount: number | null;
  questionnaires: QuestionnaireData[];
}

export default function AdminDashboardShell({
  respondentCount,
  questionnaires,
}: AdminDashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<QuestionnaireData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredQuestionnaires = useMemo(() => {
    if (!searchTerm) return questionnaires;
    const q = searchTerm.toLowerCase();
    return questionnaires.filter((item) => {
      const name = (item.intro?.fullName || "").toLowerCase();
      const role = (item.userRole || "").toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [questionnaires, searchTerm]);

  // Show all filtered questionnaires (no pagination)
  const paginatedQuestionnaires = filteredQuestionnaires;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formattedRespondentCount = useMemo(() => {
    if (typeof respondentCount !== "number") {
      return "—";
    }
    return respondentCount.toLocaleString("id-ID");
  }, [respondentCount]);

  const startIndexOffset = 0; // Always start from 0 since we're showing all data

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleDownloadCSV = () => {
    if (questionnaires.length === 0) return;

    // Prepare CSV headers
    const headers = [
      "No",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Usia",
      "Peran",
      "Tanggal Submit",
      "QA Umum - Pertanyaan 1",
      "QA Umum - Pertanyaan 2",
      "QA Umum - Pertanyaan 3",
      "Role Specific - Pertanyaan 1",
      "Role Specific - Pertanyaan 2",
      "Role Specific - Pertanyaan 3",
      "Role Specific - Pertanyaan 4",
      "Role Specific - Pertanyaan 5",
      "Role Specific - Pertanyaan 6",
      "Role Specific - Pertanyaan 7",
      "Role Specific - Pertanyaan 8",
      "Role Specific - Pertanyaan 9",
      "Role Specific - Pertanyaan 10",
      "QA End - Pertanyaan 1",
      "QA End - Pertanyaan 2",
      "QA End - Pertanyaan 3",
    ];

    // Prepare CSV rows
    const rows = questionnaires.map((q, index) => {
      const qaUmumAnswers = q.qaUmum?.answers || [];
      const roleSpecificAnswers = q.roleSpecific?.answers || [];
      const qaEndAnswers = q.qaEnd?.answers || [];

      const getAnswer = (arr: Answer[], id: number) =>
        arr.find((a) => a.questionId === id)?.answer ??
        arr.find((a) => a.questionId === id)?.rating ??
        "";

      return [
        startIndexOffset + index + 1,
        q.intro?.fullName || "",
        q.intro?.gender || "",
        q.intro?.age ?? "",
        q.userRole || "",
        q.submittedAt
          ? new Date(q.submittedAt).toLocaleDateString("id-ID")
          : "",
        getAnswer(qaUmumAnswers, 1),
        getAnswer(qaUmumAnswers, 2),
        getAnswer(qaUmumAnswers, 3),
        getAnswer(roleSpecificAnswers, 1),
        getAnswer(roleSpecificAnswers, 2),
        getAnswer(roleSpecificAnswers, 3),
        getAnswer(roleSpecificAnswers, 4),
        getAnswer(roleSpecificAnswers, 5),
        getAnswer(roleSpecificAnswers, 6),
        getAnswer(roleSpecificAnswers, 7),
        getAnswer(roleSpecificAnswers, 8),
        getAnswer(roleSpecificAnswers, 9),
        getAnswer(roleSpecificAnswers, 10),
        getAnswer(qaEndAnswers, 1),
        getAnswer(qaEndAnswers, 2),
        getAnswer(qaEndAnswers, 3),
      ];
    });

    // Helper to format CSV cells: keep pure numbers unquoted so Excel treats them as numbers
    const formatCell = (cell: unknown) => {
      if (cell === null || cell === undefined) return "";
      // If already a number, return raw
      if (typeof cell === "number") return String(cell);
      // If string that looks like a number (integer or float), return raw
      if (typeof cell === "string" && /^-?\d+(?:[.,]\d+)?$/.test(cell.trim())) {
        // replace comma decimal with dot for CSV numeric value
        return cell.trim().replace(",", ".");
      }
      // Otherwise escape quotes and wrap in quotes
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => formatCell(cell)).join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `data-kuesioner-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8fafc] overflow-hidden relative selection:bg-indigo-500/30 font-sans">
      {/* Decorative Background Blobs for Glassmorphism */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/10 rounded-full blur-[100px] mix-blend-multiply opacity-80" />
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply opacity-80" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-purple-400/10 rounded-full blur-[100px] mix-blend-multiply opacity-80" />
      </div>

      <div className="z-30 h-full shadow-2xl relative">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleCloseMobileSidebar}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <AdminNavbar
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />

        <main className="flex-1 flex flex-col overflow-hidden px-4 md:px-8 py-6 relative">
          {/* Header Card */}
          <section className="relative rounded-3xl overflow-hidden shadow-xl mb-6 group shrink-0">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F5C] via-[#132B74] to-[#0B1F5C] opacity-95" />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]" />

            <div className="relative px-6 py-8 md:px-10 md:py-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm shrink-0">
                  <LayoutDashboard className="h-7 w-7 text-indigo-100" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-indigo-100/80 text-sm mt-1 max-w-lg font-light">
                    Monitor questionnaire responses, track statistics, and
                    manage data.
                  </p>
                </div>
              </div>

              <div className="flex items-center backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl px-5 py-3 shadow-lg hover:bg-white/15 transition-all duration-300">
                <div className="mr-4 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10">
                  <Users className="h-5 w-5 text-indigo-100" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold mb-0.5">
                    Total Responden
                  </p>
                  <p className="text-2xl font-bold text-white tracking-tight leading-none">
                    {formattedRespondentCount}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Area - Glass Container */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg flex flex-col overflow-hidden ring-1 ring-white/40">
              {/* Handlers & Filters */}
              <div className="px-6 py-4 border-b border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="p-2 rounded-lg bg-indigo-100/50 text-indigo-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Data Kuesioner
                  </h2>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative group flex-1 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search name or role..."
                      className="w-full pl-9 pr-4 py-2 bg-white/70 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all hover:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="cursor-pointer p-2 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:shadow-md text-slate-600 transition-all"
                      title="Refresh"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>

                    {questionnaires.length > 0 && (
                      <button
                        onClick={handleDownloadCSV}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Content */}
              <div className="flex-1 overflow-auto relative">
                {/* Mobile View */}
                <div className="lg:hidden p-4 space-y-3">
                  {paginatedQuestionnaires.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <FileText className="h-12 w-12 mb-3 opacity-20" />
                      <p>No data found</p>
                    </div>
                  ) : (
                    paginatedQuestionnaires.map((q, index) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm border border-indigo-50/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {q.intro?.fullName || "Unnamed"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {q.userRole}
                            </p>
                          </div>
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                            #{startIndexOffset + index + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{q.intro?.gender || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {q.intro?.age ? `${q.intro.age} thn` : "-"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedQuestionnaire(q)}
                          className="cursor-pointer w-full py-2 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-indigo-50/40 backdrop-blur-sm sticky top-0 z-10 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">No</th>
                        <th className="px-6 py-4">Nama Lengkap</th>
                        <th className="px-6 py-4">Jenis Kelamin</th>
                        <th className="px-6 py-4">Usia</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Tanggal Submit</th>
                        <th className="px-6 py-4 rounded-tr-lg">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50/50">
                      {paginatedQuestionnaires.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            No data available
                          </td>
                        </tr>
                      ) : (
                        paginatedQuestionnaires.map((q, index) => (
                          <tr
                            key={index}
                            className="hover:bg-indigo-50/30 transition-colors group"
                          >
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {startIndexOffset + index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
                              {q.intro?.fullName || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {q.intro?.gender || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {q.intro?.age || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {q.userRole || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {q.submittedAt
                                ? new Date(q.submittedAt).toLocaleDateString(
                                    "id-ID",
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => setSelectedQuestionnaire(q)}
                                className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 bg-white/50 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Modal - Improved Glass Style */}
      {selectedQuestionnaire && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedQuestionnaire(null)}
          />

          {/* Modal Container */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Detail Kuesioner
                </h3>
                <p className="text-slate-500 text-sm">
                  Responden:{" "}
                  <span className="font-semibold text-indigo-700">
                    {selectedQuestionnaire.intro?.fullName}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedQuestionnaire(null)}
                className="cursor-pointer p-2 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
              <div className="space-y-6">
                {/* Personal Info Section */}
                <div className="bg-white/80 rounded-2xl p-6 border border-indigo-50 shadow-sm">
                  <h4 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Informasi Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">
                        Nama Lengkap
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedQuestionnaire.intro?.fullName}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">
                        Jenis Kelamin
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedQuestionnaire.intro?.gender}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">
                        Usia
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedQuestionnaire.intro?.age}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">
                        Role
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedQuestionnaire.userRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kuesioner Umum */}
                <div className="bg-white/80 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h4 className="text-sm uppercase tracking-wider text-blue-400 font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />{" "}
                    Kuesioner Umum
                  </h4>
                  <div className="space-y-3">
                    {selectedQuestionnaire.qaUmum?.answers?.map((answer) => (
                      <div
                        key={answer.questionId}
                        className="group p-4 rounded-xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100"
                      >
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          {getQuestionText(
                            selectedQuestionnaire.userRole,
                            "umum",
                            answer.questionId,
                          )}
                        </p>
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-blue-200">
                          {answer.answer || `Rating: ${answer.rating}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kuesioner Role Specific */}
                <div className="bg-white/80 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <h4 className="text-sm uppercase tracking-wider text-emerald-400 font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                    Kuesioner {selectedQuestionnaire.userRole}
                  </h4>
                  <div className="space-y-3">
                    {selectedQuestionnaire.roleSpecific?.answers?.map(
                      (answer) => (
                        <div
                          key={answer.questionId}
                          className="group p-4 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100"
                        >
                          <p className="text-sm font-medium text-slate-700 mb-2">
                            {getQuestionText(
                              selectedQuestionnaire.userRole,
                              "role",
                              answer.questionId,
                            )}
                          </p>
                          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-emerald-200">
                            {answer.rating ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                Rating: {answer.rating}/5
                              </span>
                            ) : (
                              answer.answer
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Kuesioner Penutup */}
                <div className="bg-white/80 rounded-2xl p-6 border border-purple-100 shadow-sm">
                  <h4 className="text-sm uppercase tracking-wider text-purple-400 font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />{" "}
                    Kuesioner Penutup
                  </h4>
                  <div className="space-y-3">
                    {selectedQuestionnaire.qaEnd?.answers?.map((answer) => (
                      <div
                        key={answer.questionId}
                        className="group p-4 rounded-xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-100"
                      >
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          {getQuestionText(
                            selectedQuestionnaire.userRole,
                            "end",
                            answer.questionId,
                          )}
                        </p>
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-purple-200">
                          {answer.rating ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                              Rating: {answer.rating}/5
                            </span>
                          ) : (
                            answer.answer
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedQuestionnaire(null)}
                className="cursor-pointer px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
