export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  zipCodes: string[];
  statewide: boolean;
  gpaMin: number;
  majors: string[];
  demographics: string[];
  description: string;
  essayPrompt: string;
  matchScore?: number;
  matchReason?: string;
}

export interface StudentQuery {
  zipCode?: string;
  gpa?: string | number;
  major?: string;
  demographics?: string[];
  extracurriculars?: string[];
}

export interface StudentProfile {
  firstName: string;
  major: string;
  extracurriculars: string[];
  demographics: string[];
  gpa: number;
  personalNote?: string;
}

export interface DraftRequest {
  scholarshipId: string;
  studentProfile: StudentProfile;
}
