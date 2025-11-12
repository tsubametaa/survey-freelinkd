"use client";

import { useState } from "react";
import Header from "./components/forms/header";
import Breadcrumb from "./components/forms/breadcrumb";
import Intro from "./components/forms/intro";
import QAFreelancer from "./components/forms/qa-freelancer";
import QAUmum from "./components/forms/qa-umum";
import QAUmkm from "./components/forms/qa-umkm";
import QAGuru from "./components/forms/qa-guru";
import QAStudent from "./components/forms/qa-student";
import QAEnd from "./components/forms/qa-end";
import Results from "./components/forms/results";

type Step =
  | "intro"
  | "qa-umum"
  | "qa-freelancer"
  | "qa-umkm"
  | "qa-guru"
  | "qa-student"
  | "qa-end"
  | "results";
type UserRole =
  | "Mahasiswa/Pelajar Non Freelancer"
  | "Mahasiswa/Pelajar Freelancer"
  | "Guru/Dosen/Tenaga Pendidik"
  | "UMKM"
  | "";

interface IntroData {
  fullName: string;
  gender: string;
  age: string;
}

interface Answer {
  questionId: number;
  answer?: string | number;
  rating?: number;
}

interface FormData {
  intro?: IntroData;
  qaUmum?: { answers: Answer[] };
  roleSpecific?: { answers: Answer[] };
  qaEnd?: { answers: Answer[] };
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [userRole, setUserRole] = useState<UserRole>("");
  const [formData, setFormData] = useState<FormData>({});

  const handleIntroComplete = (data: IntroData) => {
    setFormData({ ...formData, intro: data });
    setCurrentStep("qa-umum");
  };

  const handleQAUmumComplete = (data: Answer[], role: UserRole) => {
    setFormData({ ...formData, qaUmum: { answers: data } });
    setUserRole(role);

    // Navigate based on user role
    if (role === "Guru/Dosen/Tenaga Pendidik") {
      setCurrentStep("qa-guru");
    } else if (role === "UMKM") {
      setCurrentStep("qa-umkm");
    } else if (role === "Mahasiswa/Pelajar Non Freelancer") {
      setCurrentStep("qa-student");
    } else if (role === "Mahasiswa/Pelajar Freelancer") {
      setCurrentStep("qa-freelancer");
    }
  };

  const handleRoleSpecificComplete = (data: Answer[]) => {
    setFormData({ ...formData, roleSpecific: { answers: data } });
    setCurrentStep("qa-end");
  };

  const handleQAEndComplete = async (data: Answer[]) => {
    const finalData = { ...formData, qaEnd: { answers: data }, userRole };

    try {
      const response = await fetch("/api/submit-questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setFormData(finalData);
        setCurrentStep("results");
      } else {
        console.error("Failed to submit questionnaire");
        setFormData(finalData);
        setCurrentStep("results");
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      setFormData(finalData);
      setCurrentStep("results");
    }
  };

  const getStepNumber = () => {
    const steps: Step[] = ["intro", "qa-umum"];

    if (userRole === "Guru/Dosen/Tenaga Pendidik") {
      steps.push("qa-guru");
    } else if (userRole === "UMKM") {
      steps.push("qa-umkm");
    } else if (userRole === "Mahasiswa/Pelajar Non Freelancer") {
      steps.push("qa-student");
    } else if (userRole === "Mahasiswa/Pelajar Freelancer") {
      steps.push("qa-freelancer");
    }

    steps.push("qa-end");

    const currentIndex = steps.indexOf(currentStep);
    return currentIndex + 1;
  };

  const getBreadcrumbItems = () => {
    const items = ["Home"];

    if (
      currentStep === "qa-umum" ||
      currentStep === "qa-freelancer" ||
      currentStep === "qa-umkm" ||
      currentStep === "qa-guru" ||
      currentStep === "qa-student" ||
      currentStep === "qa-end"
    ) {
      items.push("Kuesioner Umum");
    }

    if (currentStep === "qa-freelancer") {
      items.push("Kuesioner Freelancer");
    } else if (currentStep === "qa-umkm") {
      items.push("Kuesioner UMKM");
    } else if (currentStep === "qa-guru") {
      items.push("Kuesioner Guru");
    } else if (currentStep === "qa-student") {
      items.push("Kuesioner Mahasiswa");
    }

    if (currentStep === "qa-end") {
      if (userRole === "Guru/Dosen/Tenaga Pendidik") {
        items.push("Kuesioner Guru");
      } else if (userRole === "UMKM") {
        items.push("Kuesioner UMKM");
      } else if (userRole === "Mahasiswa/Pelajar Non Freelancer") {
        items.push("Kuesioner Mahasiswa");
      } else if (userRole === "Mahasiswa/Pelajar Freelancer") {
        items.push("Kuesioner Freelancer");
      }
      items.push("Kuesioner Penutup");
    }

    return items;
  };

  const getBreadcrumbSteps = (): Step[] => {
    const steps: Step[] = ["intro"];

    if (
      currentStep === "qa-umum" ||
      currentStep === "qa-freelancer" ||
      currentStep === "qa-umkm" ||
      currentStep === "qa-guru" ||
      currentStep === "qa-student" ||
      currentStep === "qa-end"
    ) {
      steps.push("qa-umum");
    }

    if (currentStep === "qa-freelancer") {
      steps.push("qa-freelancer");
    } else if (currentStep === "qa-umkm") {
      steps.push("qa-umkm");
    } else if (currentStep === "qa-guru") {
      steps.push("qa-guru");
    } else if (currentStep === "qa-student") {
      steps.push("qa-student");
    }

    if (currentStep === "qa-end") {
      if (userRole === "Guru/Dosen/Tenaga Pendidik") {
        steps.push("qa-guru");
      } else if (userRole === "UMKM") {
        steps.push("qa-umkm");
      } else if (userRole === "Mahasiswa/Pelajar Non Freelancer") {
        steps.push("qa-student");
      } else if (userRole === "Mahasiswa/Pelajar Freelancer") {
        steps.push("qa-freelancer");
      }
      steps.push("qa-end");
    }

    return steps;
  };

  const handleBack = () => {
    if (currentStep === "qa-umum") {
      setCurrentStep("intro");
    } else if (
      currentStep === "qa-freelancer" ||
      currentStep === "qa-umkm" ||
      currentStep === "qa-guru" ||
      currentStep === "qa-student"
    ) {
      setCurrentStep("qa-umum");
    } else if (currentStep === "qa-end") {
      if (userRole === "Guru/Dosen/Tenaga Pendidik") {
        setCurrentStep("qa-guru");
      } else if (userRole === "UMKM") {
        setCurrentStep("qa-umkm");
      } else if (userRole === "Mahasiswa/Pelajar Non Freelancer") {
        setCurrentStep("qa-student");
      } else if (userRole === "Mahasiswa/Pelajar Freelancer") {
        setCurrentStep("qa-freelancer");
      }
    }
  };

  return (
    <>
      {currentStep !== "results" && currentStep !== "intro" && (
        <Breadcrumb
          items={getBreadcrumbItems()}
          onItemClick={(index) => setCurrentStep(getBreadcrumbSteps()[index])}
        />
      )}

      {currentStep !== "results" && (
        <Header currentStep={getStepNumber()} userRole={userRole} />
      )}

      {currentStep === "intro" && (
        <Intro onComplete={handleIntroComplete} initialData={formData.intro} />
      )}

      {currentStep === "qa-umum" && (
        <QAUmum
          onComplete={handleQAUmumComplete}
          onBack={handleBack}
          initialAnswers={formData.qaUmum?.answers}
        />
      )}

      {currentStep === "qa-freelancer" && (
        <QAFreelancer
          onComplete={handleRoleSpecificComplete}
          onBack={handleBack}
          initialAnswers={formData.roleSpecific?.answers}
        />
      )}

      {currentStep === "qa-umkm" && (
        <QAUmkm
          onComplete={handleRoleSpecificComplete}
          onBack={handleBack}
          initialAnswers={formData.roleSpecific?.answers}
        />
      )}

      {currentStep === "qa-guru" && (
        <QAGuru
          onComplete={handleRoleSpecificComplete}
          onBack={handleBack}
          initialAnswers={formData.roleSpecific?.answers}
        />
      )}

      {currentStep === "qa-student" && (
        <QAStudent
          onComplete={handleRoleSpecificComplete}
          onBack={handleBack}
          initialAnswers={formData.roleSpecific?.answers}
        />
      )}

      {currentStep === "qa-end" && (
        <QAEnd
          onComplete={handleQAEndComplete}
          onBack={handleBack}
          initialAnswers={formData.qaEnd?.answers}
        />
      )}

      {currentStep === "results" && <Results />}
    </>
  );
}
