export interface IntroData {
  fullName: string;
  gender: string;
  age: string;
}

export interface Answer {
  questionId: number;
  answer?: string | number;
  rating?: number;
}

export interface QaUmum {
  answers: Answer[];
}

export interface RoleSpecific {
  answers: Answer[];
}

export interface QaEnd {
  answers: Answer[];
}

export interface QuestionnaireData {
  intro: IntroData;
  userRole: string;
  qaUmum: QaUmum;
  roleSpecific: RoleSpecific;
  qaEnd: QaEnd;
  submittedAt?: Date | string;
}
