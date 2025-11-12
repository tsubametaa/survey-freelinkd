"use client";

import { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, Users, RefreshCcw } from "lucide-react";
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

  const filteredQuestionnaires = useMemo(() => {
    if (!searchTerm) return questionnaires;
    const q = searchTerm.toLowerCase();
    return questionnaires.filter((item) => {
      const name = (item.intro?.fullName || "").toLowerCase();
      const role = (item.userRole || "").toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [questionnaires, searchTerm]);

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
        index + 1,
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
      `data-kuesioner-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-(--bg) overflow-hidden">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-8 md:px-10 lg:px-12">
          <section className="rounded-3xl bg-linear-to-r from-[#0B1F5C] via-[#132B74] to-[#0B1F5C] text-white shadow-xl px-6 py-8 md:px-12 md:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                    <LayoutDashboard className="h-7 w-7" />
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                      Admin Dashboard Management
                    </h1>
                    <p className="mt-2 text-sm text-white/80 md:text-base">
                      Manage freelancer applications, approve or reject
                      candidates, and track statistics
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center rounded-2xl bg-white/10 px-5 py-4 text-white/80 shadow-inner max-w-xs">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide">
                    Total Responden
                  </p>
                  <p className="text-2xl font-semibold">
                    {formattedRespondentCount}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Questionnaire Data Table */}
          <section className="mt-10">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Users className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Data Kuesioner
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Daftar semua responden dan jawaban mereka
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, role..."
                      className="w-64 pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-150"
                    title="Refresh"
                  >
                    <RefreshCcw className="w-4 h-4 text-gray-600" />
                  </button>

                  {questionnaires.length > 0 && (
                    <button
                      onClick={handleDownloadCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download CSV
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Kelamin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Submit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuestionnaires.map((q, index) => (
                      <tr
                        key={index}
                        className="hover:bg-indigo-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.intro?.fullName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.intro?.gender || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.intro?.age || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.userRole || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {q.submittedAt
                            ? new Date(q.submittedAt).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => setSelectedQuestionnaire(q)}
                            className="text-indigo-600 hover:text-white hover:bg-indigo-600 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg font-medium"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {questionnaires.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Belum ada data kuesioner
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedQuestionnaire && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col rounded-t-xl rounded-b-xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-linear-to-r from-indigo-50 to-blue-50 shrink-0 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Detail Kuesioner
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Responden: {selectedQuestionnaire.intro?.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuestionnaire(null)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all duration-200 transform hover:scale-110 hover:rotate-90"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                {/* Intro Data */}
                <div className="bg-gray-50 rounded-lg p-6 hover:bg-indigo-50 transition-colors duration-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Informasi Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 transform hover:scale-102">
                      <div className="text-sm font-medium text-gray-500">
                        Nama Lengkap
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedQuestionnaire.intro?.fullName}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 transform hover:scale-102">
                      <div className="text-sm font-medium text-gray-500">
                        Jenis Kelamin
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedQuestionnaire.intro?.gender}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 transform hover:scale-102">
                      <div className="text-sm font-medium text-gray-500">
                        Usia
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedQuestionnaire.intro?.age}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 transform hover:scale-102">
                      <div className="text-sm font-medium text-gray-500">
                        Peran
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedQuestionnaire.userRole}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QA Umum */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Kuesioner Umum
                  </h4>
                  <div className="space-y-4">
                    {selectedQuestionnaire.qaUmum?.answers?.map((answer) => (
                      <div
                        key={answer.questionId}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {getQuestionText(
                            selectedQuestionnaire.userRole,
                            "umum",
                            answer.questionId
                          )}
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Jawaban:</strong>{" "}
                          {answer.answer || `Rating: ${answer.rating}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Specific */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Kuesioner {selectedQuestionnaire.userRole}
                  </h4>
                  <div className="space-y-4">
                    {selectedQuestionnaire.roleSpecific?.answers?.map(
                      (answer) => (
                        <div
                          key={answer.questionId}
                          className="border-l-4 border-green-500 pl-4 py-2"
                        >
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {getQuestionText(
                              selectedQuestionnaire.userRole,
                              "role",
                              answer.questionId
                            )}
                          </div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <strong>Jawaban:</strong>{" "}
                            {answer.rating
                              ? `Rating: ${answer.rating}/5`
                              : answer.answer}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* QA End */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Kuesioner Penutup
                  </h4>
                  <div className="space-y-4">
                    {selectedQuestionnaire.qaEnd?.answers?.map((answer) => (
                      <div
                        key={answer.questionId}
                        className="border-l-4 border-purple-500 pl-4 py-2"
                      >
                        <div key={answer.questionId} className="text-sm">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {getQuestionText(
                              selectedQuestionnaire.userRole,
                              "end",
                              answer.questionId
                            )}
                          </div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <strong>Jawaban:</strong>{" "}
                            {answer.rating
                              ? `Rating: ${answer.rating}/5`
                              : answer.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0 rounded-b-xl">
              <button
                onClick={() => setSelectedQuestionnaire(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
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
