import React from "react";
import Image from "next/image";

interface HeaderProps {
  currentStep: number;
  userRole?: string;
}

const Header: React.FC<HeaderProps> = ({ currentStep, userRole }) => {
  // Determine title and description based on current step and user role
  const getHeaderContent = () => {
    // Step 1: Intro
    if (currentStep === 1) {
      return {
        title: "Kuesioner Penelitian",
        description:
          "Isi kuesioner untuk membantu proses pengumpulan data penelitian",
      };
    }

    // Step 2: General Questions (qa-umum)
    if (currentStep === 2) {
      return {
        title: "Pertanyaan Umum",
        description:
          "Menilai aspek pengalaman menggunakan platform freelancing",
      };
    }

    // Step 3: Role-specific questions
    if (currentStep === 3) {
      if (userRole === "Guru/Dosen/Tenaga Pendidik") {
        return {
          title: "Kuesioner Untuk Guru",
          description:
            "Bantu kami memahami perspektif Anda sebagai tenaga pendidik",
        };
      } else if (userRole === "UMKM") {
        return {
          title: "Kuesioner Untuk UMKM",
          description:
            "Bantu kami memahami kebutuhan bisnis Anda terkait platform freelance",
        };
      } else if (userRole === "Mahasiswa/Pelajar Non Freelancer") {
        return {
          title: "Kuesioner Untuk Mahasiswa",
          description:
            "Bantu kami memahami pandangan Anda mengenai ekosistem freelance",
        };
      } else if (userRole === "Mahasiswa/Pelajar Freelancer") {
        return {
          title: "Kuesioner Untuk Freelancer",
          description:
            "Bantu kami memahami kebutuhan dan pengalaman Anda di platform digital",
        };
      }
    }

    // Step 4: End questions
    if (currentStep === 4) {
      return {
        title: "Kuesioner Penutup",
        description: "Pertanyaan akhir untuk melengkapi data penelitian",
      };
    }

    // Default/Results
    return {
      title: "Jawaban Anda Telah Tersimpan",
      description: "Terima kasih atas partisipasi Anda dalam penelitian ini",
    };
  };

  const { title, description } = getHeaderContent();

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="py-4"></nav>

      <div
        className="px-4 py-4 md:px-8 md:py-6 rounded-2xl"
        style={{
          background: "var(--foreground)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Logo */}
            <div className="rounded-lg p-1.5 md:p-2.5 shrink-0">
              <Image
                src="/assets/freelinkd.svg"
                alt="FreeLinkd"
                width={80}
                height={80}
                className="w-12 h-12 md:w-16 md:h-16"
              />
            </div>
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-2xl font-bold leading-tight">
                {title}
              </h1>
              <p className="text-gray-200 text-xs sm:text-sm md:text-base mt-0.5 md:mt-1 line-clamp-2">
                {description}
              </p>
            </div>
          </div>
          <div className="hidden md:flex md:items-center text-white md:ml-4">
            <div className="text-right">
              <p className="text-lg font-bold">Step {currentStep} of 4</p>
            </div>
          </div>
          <div className="md:hidden flex items-center text-white mt-2">
            <div className="text-center w-full">
              <p className="text-sm font-bold">Step {currentStep} of 4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
