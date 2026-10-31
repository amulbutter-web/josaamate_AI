// ====================================================
// JOSAA MATE AI – Central Application Types
// ====================================================

export interface StudentProfile {
  id?: string;
  name: string;
  email: string;
  // JEE Scores
  jeemainCRL: number | null;
  jeemainCategoryRank: number | null;
  jeeAdvancedRank: number | null;
  jeeAdvancedCategoryRank: number | null;
  jeeAdvancedQualified: boolean;
  // Eligibility
  category: Category;
  isPwD: boolean;
  gender: Gender;
  homeState: string;
  nationality: string;
  class12Percentage: number | null;
  class12Year: number | null;
  // Preferences
  preferredInstitutes: InstituteType[];
  preferredBranches: string[];
  preferredStates: string[];
  institutePriority: 'college_first' | 'branch_first' | 'balanced' | 'custom';
  branchPriority: string[];
}

export type Category = 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS' | 'OPEN-PwD' | 'OBC-NCL-PwD' | 'SC-PwD' | 'ST-PwD' | 'EWS-PwD';
export type Gender = 'Male' | 'Female' | 'Gender-Neutral';
export type InstituteType = 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'ALL';
export type Quota = 'AI' | 'HS' | 'OS' | 'GO' | 'JK' | 'LA';
export type SeatPool = 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS' | 'OPEN-PwD' | 'OBC-NCL-PwD' | 'SC-PwD' | 'ST-PwD' | 'EWS-PwD';
export type GenderPool = 'Gender-Neutral' | 'Female-only';

export interface Institute {
  id: string;
  name: string;
  shortName: string;
  type: InstituteType;
  state: string;
  city: string;
  website?: string;
  nirfRank?: number;
}

export interface Programme {
  id: string;
  instituteId: string;
  instituteName: string;
  instituteType: InstituteType;
  programName: string;
  duration: string;
  degree: string;
  state: string;
  city: string;
}

export interface CutoffRecord {
  id: string;
  year: number;
  round: number;
  instituteId: string;
  instituteName: string;
  instituteType: InstituteType;
  programName: string;
  quota: Quota;
  seatPool: SeatPool;
  genderPool: GenderPool;
  openingRank: number;
  closingRank: number;
  rankType: string;
  state: string;
}

export interface PreferenceItem {
  id: string;
  order: number;
  instituteId: string;
  instituteName: string;
  instituteType: InstituteType;
  programName: string;
  quota: Quota;
  seatPool: SeatPool;
  genderPool: GenderPool;
  eligibilityStatus: EligibilityStatus;
  closingRank2024?: number;
  closingRank2023?: number;
  notes?: string;
}

export interface PreferenceList {
  id: string;
  name: string;
  strategy: 'college_first' | 'branch_first' | 'balanced' | 'custom';
  items: PreferenceItem[];
  createdAt: string;
  updatedAt: string;
}

export type EligibilityStatus = 'eligible' | 'not_eligible' | 'requires_verification' | 'insufficient_info';

export interface EligibilityResult {
  status: EligibilityStatus;
  label: string;
  explanation: string;
  source?: string;
  checks: EligibilityCheck[];
}

export interface EligibilityCheck {
  rule: string;
  passed: boolean;
  explanation: string;
}

export interface AuditWarning {
  id: string;
  type: 'missing_choice' | 'duplicate' | 'eligibility_error' | 'ordering_issue' | 'missing_backup';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  reason: string;
  suggestion: string;
  confidence: 'high' | 'medium' | 'low';
  relatedItems?: string[];
  accepted?: boolean;
  ignored?: boolean;
}

export interface AuditReport {
  id: string;
  createdAt: string;
  totalPreferences: number;
  validatedPreferences: number;
  eligibilityWarnings: number;
  duplicateChoices: number;
  missingEligibleChoices: number;
  orderingWarnings: number;
  missingProfileInfo: number;
  auditCompletion: number;
  warnings: AuditWarning[];
}

export interface CounsellingPhase {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPast: boolean;
  description: string;
}

export interface CounsellingSchedule {
  year: number;
  phases: CounsellingPhase[];
  source: string;
}

export interface TimelineRound {
  round: number;
  label: string;
  allottedInstitute?: string;
  allottedProgramme?: string;
  preferencePosition?: number;
  action?: 'freeze' | 'float' | 'slide' | 'withdraw' | 'not_allotted';
  actionLabel?: string;
  explanation: string;
  isIllustrative: boolean;
}

export interface StudioProgress {
  profileComplete: boolean;
  eligibilityVerified: boolean;
  collegesExplored: boolean;
  preferenceListCreated: boolean;
  preferenceAuditDone: boolean;
  reportGenerated: boolean;
  totalSteps: number;
  completedSteps: number;
}

export interface FilterState {
  instituteType: InstituteType | 'ALL';
  institute: string;
  programme: string;
  state: string;
  category: SeatPool | 'ALL';
  quota: Quota | 'ALL';
  genderPool: GenderPool | 'ALL';
  year: number;
  round: number | 'ALL';
  search: string;
}
