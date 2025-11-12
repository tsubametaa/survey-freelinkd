"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

interface Answer {
  questionId: number;
  answer?: string | number;
  rating?: number;
}

interface QAEndProps {
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
  initialAnswers?: Answer[];
  isSubmitting?: boolean;
}

export default function QAEnd({
  onComplete,
  onBack,
  initialAnswers,
  isSubmitting = false,
}: QAEndProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const questions = [
    {
      id: 1,
      text: "Secara umum, saya percaya Freelinkd dapat membantu mengurangi kesenjangan antara dunia pendidikan dan dunia kerja.",
      type: "rating",
    },
    {
      id: 2,
      text: "Saya bersedia merekomendasikan Freelinkd kepada orang lain yang membutuhkan.",
      type: "rating",
    },
    {
      id: 3,
      text: "Saran atau masukan tambahan untuk pengembangan Freelinkd:",
      type: "text",
    },
  ];

  const handleAnswerChange = (questionId: number, answer: string | number) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, answer } : a
        );
      }
      return [...prev, { questionId, answer }];
    });

    // Clear error when user provides an answer
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

    // Check if required questions are answered (only rating questions are required)
    questions.forEach((question) => {
      if (question.type === "rating") {
        const answer = answers.find((a) => a.questionId === question.id);
        if (!answer || !answer.answer) {
          newErrors[question.id] = "Kolom ini wajib diisi";
        }
      }
    });

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      onComplete(answers);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Project Header */}
      <div className="text-center mb-6 mt-4 sm:mt-8"></div>

      <div className="bg-white rounded-2xl w-full p-6 sm:p-8 md:p-12">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-indigo-100 rounded-full p-3 sm:p-4 shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Kuesioner Penutup
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Berikan penilaian akhir Anda tentang platform Freelinkd
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question) => (
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
                      {question.text}
                      {question.type === "rating" && (
                        <span className="text-red-500">*</span>
                      )}
                    </p>

                    {/* Error message */}
                    {errors[question.id] && (
                      <p className="text-red-500 text-sm mb-2">
                        {errors[question.id]}
                      </p>
                    )}

                    {/* Render based on type */}
                    {question.type === "rating" && (
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
                                  )?.answer === rating
                                }
                                onChange={() =>
                                  handleAnswerChange(question.id, rating)
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
                    )}

                    {question.type === "text" && (
                      <textarea
                        value={
                          (answers.find((a) => a.questionId === question.id)
                            ?.answer as string) || ""
                        }
                        onChange={(e) =>
                          handleAnswerChange(
                            question.id,
                            e.target.value.replace(/[<>\?\/\{\}\[\]=+]/g, "")
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={4}
                        placeholder="Jawab di sini..."
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 sm:px-16 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-900 hover:bg-indigo-800 text-white font-semibold px-8 sm:px-16 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mengirim...
                </>
              ) : (
                "Kirim Jawaban"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
