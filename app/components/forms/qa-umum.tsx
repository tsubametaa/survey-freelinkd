"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";

interface Answer {
  questionId: number;
  answer?: string | number;
  rating?: number;
}

type UserRole =
  | "Mahasiswa/Pelajar Non Freelancer"
  | "Mahasiswa/Pelajar Freelancer"
  | "Guru/Dosen/Tenaga Pendidik"
  | "UMKM";

interface QAUmumProps {
  onComplete: (answers: Answer[], role: UserRole) => void;
  onBack: () => void;
  initialAnswers?: Answer[];
}

export default function QAUmum({
  onComplete,
  onBack,
  initialAnswers,
}: QAUmumProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const questions = [
    {
      id: 1,
      text: "Sejauh mana Anda mengenal platform freelancing seperti Upwork, Fiverr, Sribulancer, atau Fastwork?",
      type: "radio",
      options: [
        "Tidak pernah mendengar",
        "Pernah dengar, tapi belum pernah pakai",
        "Pernah mencoba",
        "Sering menggunakan",
      ],
    },
    {
      id: 2,
      text: "Menurut Anda, apa tantangan utama dalam mencari/merekrut freelancer di platform online saat ini?",
      type: "text",
    },
    {
      id: 3,
      text: "Sebagai apa anda saat ini?",
      type: "select",
      options: [
        "Mahasiswa/Pelajar Non Freelancer",
        "Mahasiswa/Pelajar Freelancer",
        "Guru/Dosen/Tenaga Pendidik",
        "UMKM",
      ],
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

    // Clear error when user starts typing/selecting
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
      if (!answer || !answer.answer || answer.answer === "") {
        newErrors[question.id] = "Kolom ini wajib diisi";
      }
    });

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      // Get selected role from answers
      const roleAnswer = answers.find((a) => a.questionId === 3);
      if (
        roleAnswer &&
        roleAnswer.answer &&
        typeof roleAnswer.answer === "string"
      ) {
        onComplete(answers, roleAnswer.answer as UserRole);
      }
    }
  };

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
                Kuesioner Umum
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Berikan penilaian Umum tentang pengalaman menggunakan platform
                Freelancing
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-semibold text-indigo-600 min-w-fit">
                      {question.id}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-4">
                        {question.text} <span className="text-red-500">*</span>
                      </p>

                      {/* Error message */}
                      {errors[question.id] && (
                        <p className="text-red-500 text-sm mb-2">
                          {errors[question.id]}
                        </p>
                      )}

                      {/* Render based on type */}
                      {question.type === "radio" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, index) => (
                            <label
                              key={index}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={
                                  answers.find(
                                    (a) => a.questionId === question.id
                                  )?.answer === option
                                }
                                onChange={() =>
                                  handleAnswerChange(question.id, option)
                                }
                                className="w-4 h-4 cursor-pointer accent-indigo-600"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
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

                      {question.type === "select" && question.options && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all flex items-center justify-between"
                          >
                            <span
                              className={
                                answers.find(
                                  (a) => a.questionId === question.id
                                )?.answer
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }
                            >
                              {(answers.find(
                                (a) => a.questionId === question.id
                              )?.answer as string) || "Pilih opsi..."}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isDropdownOpen ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute z-10 w-full bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                              {question.options.map((option, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    handleAnswerChange(question.id, option);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors ${
                                    answers.find(
                                      (a) => a.questionId === question.id
                                    )?.answer === option
                                      ? "bg-indigo-50 text-indigo-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
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
