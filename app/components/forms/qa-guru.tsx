"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

interface Answer {
  questionId: number;
  answer?: string | number;
  rating?: number;
}

interface QAGuruProps {
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
  initialAnswers?: Answer[];
}

export default function QAGuru({
  onComplete,
  onBack,
  initialAnswers,
}: QAGuruProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const questions = [
    {
      id: 1,
      category: "Efisiensi Pencocokan (Matching) Berbasis AI",
      text: "Sistem seperti Freelinkd dapat mengurangi ketidaksesuaian keterampilan lulusan dengan kebutuhan industri (skills mismatch).",
    },
    {
      id: 2,
      category: "Efisiensi Pencocokan (Matching) Berbasis AI",
      text: "Teknologi pencocokan berbasis embedding AI dapat meningkatkan efisiensi sistem perekrutan digital.",
    },
    {
      id: 3,
      category: "AI Fairness",
      text: "Saya setuju bahwa sistem yang tidak melihat usia atau gender dapat meningkatkan keadilan akses bagi siswa.",
    },
    {
      id: 4,
      category: "Transparansi, Kepercayaan, dan Dampak Pendidikan",
      text: "Saya melihat pentingnya siswa/mahasiswa mendapatkan pengalaman kerja nyata selama masa studi.",
    },
    {
      id: 5,
      category: "Transparansi, Kepercayaan, dan Dampak Pendidikan",
      text: "Platform dengan fitur portofolio digital membantu siswa membangun identitas profesional sejak dini.",
    },
    {
      id: 6,
      category: "User Experience",
      text: "Antarmuka website Freelinkd mudah digunakan dan intuitif.",
    },
  ];

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, rating } : a
        );
      }
      return [...prev, { questionId, rating }];
    });

    // Clear error when user selects a rating
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: number]: string } = {};

    // Check if all questions are answered
    questions.forEach((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer || !answer.rating) {
        newErrors[question.id] = "Kolom ini wajib diisi";
      }
    });

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      onComplete(answers);
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    const category = question.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(question);
    return acc;
  }, {} as Record<string, typeof questions>);

  return (
    <div className="w-full py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl w-full p-6 sm:p-8 md:p-12">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-indigo-100 rounded-full p-3 sm:p-4 shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Kuesioner Guru
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Relevansi pendidikan, kolaborasi akademik dan industri
              </p>
            </div>
          </div>

          {/* Research Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">
              Informasi Penelitian
            </h2>
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm">
              <p>
                <span className="font-semibold">Tujuan Penelitian:</span>{" "}
                Mengukur persepsi dan pengalaman pengguna terhadap sistem
                Freelinkd, platform AI yang menghubungkan antara freelancer
                dengan UMKM.
              </p>
              <p>
                <span className="font-semibold">Kerahasiaan:</span> Semua
                jawaban akan dijaga kerahasiaannya dan hanya digunakan untuk
                keperluan akademik.
              </p>
              <p>
                <span className="font-semibold">Petunjuk Pengisian:</span> Mohon
                isi sesuai dengan pengalaman atau pandangan Anda.
              </p>
            </div>
          </div>

          {/* Rating Scale Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-amber-900 mb-3 sm:mb-4">
              Skala Penilaian
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-amber-100 text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1 sm:mb-2">
                  1
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  Sangat Tidak Setuju
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-amber-100 text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
                  2
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  Tidak Setuju
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-amber-100 text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1 sm:mb-2">
                  3
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  Netral
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-amber-100 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
                  4
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  Setuju
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-amber-100 text-center col-span-2 sm:col-span-1 md:col-span-1">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 mb-1 sm:mb-2">
                  5
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  Sangat Setuju
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Questions by Category */}
            {Object.entries(groupedQuestions).map((entry) => {
              const [category, categoryQuestions] = entry;
              return (
                <div
                  key={category}
                  className="border-b border-gray-200 pb-8 last:border-b-0"
                >
                  {/* Category Header */}
                  <h2 className="text-base sm:text-lg font-semibold text-indigo-900 mb-4 sm:mb-6 bg-indigo-50 px-3 sm:px-4 py-2 rounded-lg wrap-break-word">
                    {category}
                  </h2>

                  {/* Questions in Category */}
                  <div className="space-y-6">
                    {categoryQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 p-4 sm:p-6 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <span className="text-sm font-semibold text-indigo-600 min-w-fit">
                            {question.id}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm sm:text-base text-gray-900 font-medium mb-4">
                              {question.text}{" "}
                              <span className="text-red-500">*</span>
                            </p>

                            {/* Error message */}
                            {errors[question.id] && (
                              <p className="text-red-500 text-sm mb-2">
                                {errors[question.id]}
                              </p>
                            )}

                            {/* Rating Scale */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="hidden sm:inline text-xs text-gray-500 whitespace-nowrap">
                                Sangat Tidak Setuju
                              </span>
                              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 overflow-x-auto">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <label
                                    key={rating}
                                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 cursor-pointer shrink-0"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={rating}
                                      checked={
                                        answers.find(
                                          (a) => a.questionId === question.id
                                        )?.rating === rating
                                      }
                                      onChange={() =>
                                        handleRatingChange(question.id, rating)
                                      }
                                      className="w-4 h-4 cursor-pointer accent-indigo-600"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                                      {rating}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <span className="hidden sm:inline text-xs text-gray-500 whitespace-nowrap">
                                Sangat Setuju
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 sm:px-16 py-3 rounded-lg transition-colors duration-200"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="bg-indigo-900 hover:bg-indigo-800 text-white font-semibold px-8 sm:px-16 py-3 rounded-lg transition-colors duration-200"
              >
                Lanjutkan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
