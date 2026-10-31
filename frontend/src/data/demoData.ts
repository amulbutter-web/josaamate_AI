// ====================================================
// JOSAA MATE AI – Demo Data
// Clearly labelled as illustrative / demo data only.
// All cutoffs are fabricated for demonstration purposes.
// ====================================================

import type { Institute, CutoffRecord, CounsellingSchedule } from '../types';

export const DEMO_INSTITUTES: Institute[] = [
  { id: 'iitb', name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', type: 'IIT', state: 'Maharashtra', city: 'Mumbai', website: 'https://www.iitb.ac.in' },
  { id: 'iitd', name: 'Indian Institute of Technology Delhi', shortName: 'IIT Delhi', type: 'IIT', state: 'Delhi', city: 'New Delhi', website: 'https://home.iitd.ac.in' },
  { id: 'iitm', name: 'Indian Institute of Technology Madras', shortName: 'IIT Madras', type: 'IIT', state: 'Tamil Nadu', city: 'Chennai', website: 'https://www.iitm.ac.in' },
  { id: 'iitk', name: 'Indian Institute of Technology Kanpur', shortName: 'IIT Kanpur', type: 'IIT', state: 'Uttar Pradesh', city: 'Kanpur', website: 'https://www.iitk.ac.in' },
  { id: 'iitkgp', name: 'Indian Institute of Technology Kharagpur', shortName: 'IIT Kharagpur', type: 'IIT', state: 'West Bengal', city: 'Kharagpur', website: 'https://www.iitkgp.ac.in' },
  { id: 'iitr', name: 'Indian Institute of Technology Roorkee', shortName: 'IIT Roorkee', type: 'IIT', state: 'Uttarakhand', city: 'Roorkee', website: 'https://www.iitr.ac.in' },
  { id: 'iitg', name: 'Indian Institute of Technology Guwahati', shortName: 'IIT Guwahati', type: 'IIT', state: 'Assam', city: 'Guwahati', website: 'https://www.iitg.ac.in' },
  { id: 'iith', name: 'Indian Institute of Technology Hyderabad', shortName: 'IIT Hyderabad', type: 'IIT', state: 'Telangana', city: 'Hyderabad', website: 'https://www.iith.ac.in' },
  { id: 'nitw', name: 'National Institute of Technology Warangal', shortName: 'NIT Warangal', type: 'NIT', state: 'Telangana', city: 'Warangal', website: 'https://www.nitw.ac.in' },
  { id: 'nitt', name: 'National Institute of Technology Tiruchirappalli', shortName: 'NIT Trichy', type: 'NIT', state: 'Tamil Nadu', city: 'Tiruchirappalli', website: 'https://www.nitt.edu' },
  { id: 'nitr', name: 'National Institute of Technology Rourkela', shortName: 'NIT Rourkela', type: 'NIT', state: 'Odisha', city: 'Rourkela', website: 'https://www.nitrkl.ac.in' },
  { id: 'nitc', name: 'National Institute of Technology Calicut', shortName: 'NIT Calicut', type: 'NIT', state: 'Kerala', city: 'Calicut', website: 'https://www.nitc.ac.in' },
  { id: 'mnnit', name: 'Motilal Nehru National Institute of Technology Allahabad', shortName: 'MNNIT Allahabad', type: 'NIT', state: 'Uttar Pradesh', city: 'Prayagraj', website: 'https://www.mnnit.ac.in' },
  { id: 'iiita', name: 'Indian Institute of Information Technology Allahabad', shortName: 'IIIT Allahabad', type: 'IIIT', state: 'Uttar Pradesh', city: 'Prayagraj', website: 'https://www.iiita.ac.in' },
  { id: 'iiith', name: 'International Institute of Information Technology Hyderabad', shortName: 'IIIT Hyderabad', type: 'IIIT', state: 'Telangana', city: 'Hyderabad', website: 'https://www.iiit.ac.in' },
  { id: 'dtudelhi', name: 'Delhi Technological University', shortName: 'DTU Delhi', type: 'GFTI', state: 'Delhi', city: 'New Delhi', website: 'https://www.dtu.ac.in' },
];

export const DEMO_PROGRAMMES = [
  { id: 'iitb-cs', instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Maharashtra', city: 'Mumbai' },
  { id: 'iitb-ee', instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT' as const, programName: 'Electrical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Maharashtra', city: 'Mumbai' },
  { id: 'iitb-mech', instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT' as const, programName: 'Mechanical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Maharashtra', city: 'Mumbai' },
  { id: 'iitd-cs', instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Delhi', city: 'New Delhi' },
  { id: 'iitd-ee', instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT' as const, programName: 'Electrical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Delhi', city: 'New Delhi' },
  { id: 'iitd-chem', instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT' as const, programName: 'Chemical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Delhi', city: 'New Delhi' },
  { id: 'iitm-cs', instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Tamil Nadu', city: 'Chennai' },
  { id: 'iitm-ee', instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT' as const, programName: 'Electrical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Tamil Nadu', city: 'Chennai' },
  { id: 'iitk-cs', instituteId: 'iitk', instituteName: 'IIT Kanpur', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Uttar Pradesh', city: 'Kanpur' },
  { id: 'iitk-ee', instituteId: 'iitk', instituteName: 'IIT Kanpur', instituteType: 'IIT' as const, programName: 'Electrical Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Uttar Pradesh', city: 'Kanpur' },
  { id: 'iitkgp-cs', instituteId: 'iitkgp', instituteName: 'IIT Kharagpur', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'West Bengal', city: 'Kharagpur' },
  { id: 'iitr-cs', instituteId: 'iitr', instituteName: 'IIT Roorkee', instituteType: 'IIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Uttarakhand', city: 'Roorkee' },
  { id: 'nitw-cs', instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Telangana', city: 'Warangal' },
  { id: 'nitw-ece', instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT' as const, programName: 'Electronics and Communication Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Telangana', city: 'Warangal' },
  { id: 'nitt-cs', instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Tamil Nadu', city: 'Tiruchirappalli' },
  { id: 'nitt-ece', instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT' as const, programName: 'Electronics and Communication Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Tamil Nadu', city: 'Tiruchirappalli' },
  { id: 'nitr-cs', instituteId: 'nitr', instituteName: 'NIT Rourkela', instituteType: 'NIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Odisha', city: 'Rourkela' },
  { id: 'nitc-cs', instituteId: 'nitc', instituteName: 'NIT Calicut', instituteType: 'NIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Kerala', city: 'Calicut' },
  { id: 'iiita-it', instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT' as const, programName: 'Information Technology', duration: '4 Years', degree: 'B.Tech', state: 'Uttar Pradesh', city: 'Prayagraj' },
  { id: 'iiita-cs', instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Uttar Pradesh', city: 'Prayagraj' },
  { id: 'iiith-cs', instituteId: 'iiith', instituteName: 'IIIT Hyderabad', instituteType: 'IIIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Telangana', city: 'Hyderabad' },
  { id: 'dtu-cs', instituteId: 'dtudelhi', instituteName: 'DTU Delhi', instituteType: 'GFTI' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Delhi', city: 'New Delhi' },
  { id: 'mnnit-cs', instituteId: 'mnnit', instituteName: 'MNNIT Allahabad', instituteType: 'NIT' as const, programName: 'Computer Science and Engineering', duration: '4 Years', degree: 'B.Tech', state: 'Uttar Pradesh', city: 'Prayagraj' },
];

// ⚠️ DEMO DATA ONLY – All cutoff ranks below are illustrative and do not represent official JoSAA data.
// Source official data from: https://josaa.nic.in/or-cr/
export const DEMO_CUTOFFS: CutoffRecord[] = [
  // IIT Bombay – CS
  { id: 'c1', year: 2021, round: 6, instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 67, rankType: 'Advanced', state: 'Maharashtra' },
  { id: 'c2', year: 2022, round: 6, instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 72, rankType: 'Advanced', state: 'Maharashtra' },
  { id: 'c3', year: 2023, round: 6, instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 58, rankType: 'Advanced', state: 'Maharashtra' },
  { id: 'c4', year: 2024, round: 6, instituteId: 'iitb', instituteName: 'IIT Bombay', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 62, rankType: 'Advanced', state: 'Maharashtra' },
  // IIT Delhi – CS
  { id: 'c5', year: 2021, round: 6, instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 118, rankType: 'Advanced', state: 'Delhi' },
  { id: 'c6', year: 2022, round: 6, instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 124, rankType: 'Advanced', state: 'Delhi' },
  { id: 'c7', year: 2023, round: 6, instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 109, rankType: 'Advanced', state: 'Delhi' },
  { id: 'c8', year: 2024, round: 6, instituteId: 'iitd', instituteName: 'IIT Delhi', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 113, rankType: 'Advanced', state: 'Delhi' },
  // IIT Madras – CS
  { id: 'c9', year: 2021, round: 6, instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 105, rankType: 'Advanced', state: 'Tamil Nadu' },
  { id: 'c10', year: 2022, round: 6, instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 111, rankType: 'Advanced', state: 'Tamil Nadu' },
  { id: 'c11', year: 2023, round: 6, instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 96, rankType: 'Advanced', state: 'Tamil Nadu' },
  { id: 'c12', year: 2024, round: 6, instituteId: 'iitm', instituteName: 'IIT Madras', instituteType: 'IIT', programName: 'Computer Science and Engineering', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1, closingRank: 102, rankType: 'Advanced', state: 'Tamil Nadu' },
  // NIT Trichy – CS
  { id: 'c13', year: 2021, round: 6, instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1820, closingRank: 3450, rankType: 'Main', state: 'Tamil Nadu' },
  { id: 'c14', year: 2022, round: 6, instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1960, closingRank: 3710, rankType: 'Main', state: 'Tamil Nadu' },
  { id: 'c15', year: 2023, round: 6, instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1750, closingRank: 3280, rankType: 'Main', state: 'Tamil Nadu' },
  { id: 'c16', year: 2024, round: 6, instituteId: 'nitt', instituteName: 'NIT Trichy', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1890, closingRank: 3520, rankType: 'Main', state: 'Tamil Nadu' },
  // NIT Warangal – CS
  { id: 'c17', year: 2021, round: 6, instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 2100, closingRank: 4200, rankType: 'Main', state: 'Telangana' },
  { id: 'c18', year: 2022, round: 6, instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 2350, closingRank: 4620, rankType: 'Main', state: 'Telangana' },
  { id: 'c19', year: 2023, round: 6, instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 1980, closingRank: 3980, rankType: 'Main', state: 'Telangana' },
  { id: 'c20', year: 2024, round: 6, instituteId: 'nitw', instituteName: 'NIT Warangal', instituteType: 'NIT', programName: 'Computer Science and Engineering', quota: 'OS', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 2200, closingRank: 4350, rankType: 'Main', state: 'Telangana' },
  // IIIT Allahabad – IT
  { id: 'c21', year: 2021, round: 6, instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT', programName: 'Information Technology', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 3800, closingRank: 7200, rankType: 'Main', state: 'Uttar Pradesh' },
  { id: 'c22', year: 2022, round: 6, instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT', programName: 'Information Technology', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 4100, closingRank: 7900, rankType: 'Main', state: 'Uttar Pradesh' },
  { id: 'c23', year: 2023, round: 6, instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT', programName: 'Information Technology', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 3650, closingRank: 6850, rankType: 'Main', state: 'Uttar Pradesh' },
  { id: 'c24', year: 2024, round: 6, instituteId: 'iiita', instituteName: 'IIIT Allahabad', instituteType: 'IIIT', programName: 'Information Technology', quota: 'AI', seatPool: 'OPEN', genderPool: 'Gender-Neutral', openingRank: 3900, closingRank: 7450, rankType: 'Main', state: 'Uttar Pradesh' },
];

export const DEMO_SCHEDULE: CounsellingSchedule = {
  year: 2026,
  source: 'https://josaa.nic.in/',
  phases: [
    { name: 'Registration & Application', startDate: '2026-06-10', endDate: '2026-06-20', isActive: false, isPast: true, description: 'Online registration, fee payment and document upload on JoSAA portal.' },
    { name: 'Choice Filling & Locking', startDate: '2026-06-10', endDate: '2026-06-22', isActive: false, isPast: true, description: 'Fill and lock your programme preferences in order of priority.' },
    { name: 'Mock Seat Allocation 1', startDate: '2026-06-21', endDate: '2026-06-21', isActive: false, isPast: true, description: 'Indicative (non-binding) mock allotment for reference only.' },
    { name: 'Mock Seat Allocation 2', startDate: '2026-06-23', endDate: '2026-06-23', isActive: false, isPast: true, description: 'Second indicative mock allotment.' },
    { name: 'Round 1 Allotment', startDate: '2026-06-25', endDate: '2026-06-25', isActive: false, isPast: true, description: 'First official seat allotment results announced.' },
    { name: 'Round 2 Allotment', startDate: '2026-07-02', endDate: '2026-07-02', isActive: false, isPast: true, description: 'Second official seat allotment results.' },
    { name: 'Round 3 Allotment', startDate: '2026-07-08', endDate: '2026-07-08', isActive: false, isPast: true, description: 'Third official seat allotment results.' },
    { name: 'Round 4 Allotment', startDate: '2026-07-13', endDate: '2026-07-13', isActive: false, isPast: true, description: 'Fourth official seat allotment results.' },
    { name: 'Round 5 Allotment', startDate: '2026-07-17', endDate: '2026-07-17', isActive: false, isPast: false, description: 'Fifth official seat allotment results.' },
    { name: 'Round 6 (Final) Allotment', startDate: '2026-07-22', endDate: '2026-07-22', isActive: false, isPast: false, description: 'Final seat allotment. No further rounds after this.' },
    { name: 'Document Verification & Reporting', startDate: '2026-07-23', endDate: '2026-08-10', isActive: false, isPast: false, description: 'Report to allotted institute with original documents for seat confirmation.' },
  ],
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const CATEGORIES = [
  { value: 'OPEN', label: 'OPEN (General)' },
  { value: 'OBC-NCL', label: 'OBC-NCL' },
  { value: 'SC', label: 'SC (Scheduled Caste)' },
  { value: 'ST', label: 'ST (Scheduled Tribe)' },
  { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
  { value: 'OPEN-PwD', label: 'OPEN-PwD' },
  { value: 'OBC-NCL-PwD', label: 'OBC-NCL-PwD' },
  { value: 'SC-PwD', label: 'SC-PwD' },
  { value: 'ST-PwD', label: 'ST-PwD' },
  { value: 'EWS-PwD', label: 'EWS-PwD' },
];

export const BRANCHES = [
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Information Technology',
  'Instrumentation Engineering',
  'Metallurgical Engineering',
  'Mathematics and Computing',
  'Engineering Physics',
  'Data Science and Artificial Intelligence',
  'Artificial Intelligence',
  'Environmental Engineering',
  'Ocean Engineering',
  'Mining Engineering',
];
