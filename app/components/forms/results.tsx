"use client";

import { CheckCircle } from "lucide-react";

export default function Results() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-emerald-50 rounded-full p-5 border-2 border-emerald-200">
              <CheckCircle
                className="w-14 h-14 text-emerald-600"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-5">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Terima Kasih atas Partisipasi Anda
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Kontribusi Anda sangat berarti bagi kelancaran studi akademik ini
            </p>
            <div className="pt-4 pb-2">
              <div className="inline-block bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg px-6 py-4 shadow-sm">
                <p className="text-base text-slate-700 leading-relaxed">
                  <span className="font-semibold text-emerald-700">
                    Jawaban Anda
                  </span>{" "}
                  telah berhasil tersimpan dengan aman
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            <div className="space-y-5 text-base text-slate-600 leading-relaxed">
              <p className="text-justify">
                Terima kasih telah meluangkan waktu untuk mengisi kuesioner
                penelitian ini. Kontribusi Anda sangat berharga untuk
                pengembangan dan penyempurnaan platform Freelinkd yang bertujuan
                membantu mempertemukan freelancer dengan klien secara lebih
                efektif.
              </p>
              <p className="text-justify">
                Semua data yang Anda berikan akan dijaga kerahasiaannya dengan
                ketat dan hanya digunakan untuk keperluan penelitian akademik
                sesuai dengan etika penelitian yang berlaku.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-700 hover:bg-slate-800 text-white font-medium text-base px-10 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-slate-600">
            Jika Anda memiliki pertanyaan atau memerlukan informasi lebih
            lanjut,
          </p>
          <p className="text-sm text-slate-600">
            <a
              href="mailto:alvinferinaputra2023@student.unas.ac.id"
              className="text-slate-700 hover:text-slate-900 underline hover:no-underline transition-colors duration-200"
            >
              silakan hubungi tim peneliti.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
