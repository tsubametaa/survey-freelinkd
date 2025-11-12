"use client";

import { useState } from "react";
import { User, ChevronDown, Handshake } from "lucide-react";

interface IntroProps {
  onComplete: (data: { fullName: string; gender: string; age: string }) => void;
  initialData?: { fullName: string; gender: string; age: string };
}

export default function Intro({ onComplete, initialData }: IntroProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [age, setAge] = useState(initialData?.age || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const genderOptions = ["Laki-laki", "Perempuan"];
  const roleOptions = ["<20 tahun", "21-30 tahun", "31-40 tahun", ">40 tahun"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!fullName.trim()) {
      newErrors.fullName = "Kolom ini wajib diisi";
    }
    if (!gender) {
      newErrors.gender = "Kolom ini wajib diisi";
    }
    if (!age) {
      newErrors.age = "Kolom ini wajib diisi";
    }

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      onComplete({ fullName, gender, age });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Project Header */}
      <div className="text-center mb-8 mt-4 sm:mt-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Persepsi dan Pengalaman Pengguna terhadap Sistem Freelinkd
        </h1>

        <div className="bg-linear-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 sm:p-10 max-w-5xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 first-line:font-medium first-line:text-slate-800">
              Perkenalkan, saya{" "}
              <span className="font-semibold text-slate-800">
                Alvin Ferina Putra
              </span>
              , mahasiswa Program Studi Sistem Informasi yang sedang
              melaksanakan penelitian untuk mata kuliah Metodologi Penelitian.
              Penelitian ini berfokus pada evaluasi awal terhadap sistem
              Freelinkd, yaitu sebuah platform berbasis kecerdasan buatan (AI)
              yang dikembangkan secara mandiri sebagai media penghubung antara
              freelancer dan pelaku Usaha Mikro Kecil Menengah (UMKM).
            </p>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
              Saya memohon kesediaan Bapak/Ibu/Saudara/i untuk meluangkan waktu
              sekitar{" "}
              <span className="font-medium text-slate-800">5 - 10 menit</span>{" "}
              guna mengisi kuesioner ini. Seluruh data yang dikumpulkan akan
              dijaga kerahasiaannya dan hanya digunakan untuk kepentingan
              akademik.
            </p>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed italic pl-6 bg-blue-50/50 py-4 rounded-r-lg">
              Atas partisipasi dan waktu yang telah diberikan, saya ucapkan
              terima kasih{" "}
              <Handshake className="inline w-5 h-5 text-blue-600 ml-2" />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl w-full p-6 sm:p-8 md:p-12">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-indigo-100 rounded-full p-3 sm:p-4 shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Informasi Pribadi
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Agar kami bisa menghubungi Anda, silakan isi data diri di bawah.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nama Anda <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Boleh menggunakan nama samaran atau inisial.
            </p>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value.replace(/[<>\?\/\{\}\[\]=+]/g, ""));
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: "" }));
                }
              }}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Dropdown */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Pilih jenis kelamin Anda
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all flex items-center justify-between"
                >
                  <span className={gender ? "text-gray-900" : "text-gray-400"}>
                    {gender || "Pilih jenis kelamin"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isGenderDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}

                {isGenderDropdownOpen && (
                  <div className="absolute z-10 w-full bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {genderOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setGender(option);
                          setIsGenderDropdownOpen(false);
                          if (errors.gender) {
                            setErrors((prev) => ({ ...prev, gender: "" }));
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors ${
                          gender === option
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
            </div>

            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Usia <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Pilih usia Anda</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all flex items-center justify-between"
                >
                  <span className={age ? "text-gray-900" : "text-gray-400"}>
                    {age || "Pilih usia"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {roleOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setAge(option);
                          setIsDropdownOpen(false);
                          if (errors.age) {
                            setErrors((prev) => ({ ...prev, age: "" }));
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors ${
                          age === option
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
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
  );
}
