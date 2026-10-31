// ====================================================
// JOSAA MATE AI – ProfilePage.tsx
// Multi-step profile form (3 steps) with react-hook-form + zod
// ====================================================

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Settings2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Info,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORIES, INDIAN_STATES, BRANCHES } from '../data/demoData';
import type { StudentProfile, InstituteType } from '../types';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const step1Schema = z.object({
  jeemainCRL: z
    .number({ required_error: 'JEE Main CRL is required', invalid_type_error: 'Must be a number' })
    .int()
    .positive('Rank must be a positive integer'),
  jeemainCategoryRank: z
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .positive()
    .nullable()
    .optional(),
  jeeAdvancedRank: z
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .positive()
    .nullable()
    .optional(),
  jeeAdvancedCategoryRank: z
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .positive()
    .nullable()
    .optional(),
  jeeAdvancedQualified: z.boolean().default(false),
  class12Percentage: z
    .number({ required_error: 'Required', invalid_type_error: 'Must be a number' })
    .min(0, 'Minimum 0%')
    .max(100, 'Maximum 100%'),
  class12Year: z
    .number({ required_error: 'Required', invalid_type_error: 'Must be a number' })
    .int()
    .refine((v) => [2023, 2024, 2025, 2026].includes(v), 'Select a valid year'),
});

const step2Schema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  category: z.enum([
    'OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS',
    'OPEN-PwD', 'OBC-NCL-PwD', 'SC-PwD', 'ST-PwD', 'EWS-PwD',
  ]),
  isPwD: z.boolean().default(false),
  gender: z.enum(['Male', 'Female', 'Gender-Neutral']),
  homeState: z.string().min(1, 'Please select your home state'),
  nationality: z.enum(['Indian', 'Foreign National', 'OCI']),
});

const step3Schema = z.object({
  preferredInstitutes: z
    .array(z.enum(['IIT', 'NIT', 'IIIT', 'GFTI'] as const))
    .min(1, 'Select at least one institute type'),
  preferredBranches: z
    .array(z.string())
    .min(1, 'Select at least one branch'),
  institutePriority: z.enum(['college_first', 'branch_first', 'balanced', 'custom']),
  additionalNotes: z.string().max(500).optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormValues = z.infer<typeof fullSchema>;

// ─── Step meta ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'JEE Scores', icon: GraduationCap, description: 'Your examination ranks' },
  { label: 'Eligibility', icon: User, description: 'Category & personal info' },
  { label: 'Preferences', icon: Settings2, description: 'Institutes & branches' },
];

// ─── Shared field components ──────────────────────────────────────────────────

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
      <Info size={11} className="flex-shrink-0" />
      {children}
    </p>
  );
}

function Label({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function InputField({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint && <FieldHint>{hint}</FieldHint>}
      <ErrorMsg message={error} />
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';
const selectCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

// ─── Step 1 – JEE Scores ─────────────────────────────────────────────────────

function Step1({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* JEE Main CRL */}
        <InputField
          label="JEE Main CRL"
          required
          hint="Common Rank List rank from JEE Main Score Card"
          error={errors.jeemainCRL?.message}
        >
          <Controller
            name="jeemainCRL"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                placeholder="e.g. 12500"
                className={inputCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                }
                value={field.value ?? ''}
              />
            )}
          />
        </InputField>

        {/* JEE Main Category Rank */}
        <InputField
          label="JEE Main Category Rank"
          hint="Category-wise rank from JEE Main Score Card (if applicable)"
          error={errors.jeemainCategoryRank?.message}
        >
          <Controller
            name="jeemainCategoryRank"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                placeholder="e.g. 850 (optional)"
                className={inputCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? null : Number(e.target.value))
                }
                value={field.value ?? ''}
              />
            )}
          />
        </InputField>

        {/* JEE Advanced Rank */}
        <InputField
          label="JEE Advanced Rank (CRL)"
          hint="Your Common Rank List rank in JEE Advanced — required for IIT seats"
          error={errors.jeeAdvancedRank?.message}
        >
          <Controller
            name="jeeAdvancedRank"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                placeholder="e.g. 4200 (optional)"
                className={inputCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? null : Number(e.target.value))
                }
                value={field.value ?? ''}
              />
            )}
          />
        </InputField>

        {/* JEE Advanced Category Rank */}
        <InputField
          label="JEE Advanced Category Rank"
          hint="Category-wise rank in JEE Advanced (OBC-NCL/SC/ST/EWS/PwD)"
          error={errors.jeeAdvancedCategoryRank?.message}
        >
          <Controller
            name="jeeAdvancedCategoryRank"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                placeholder="e.g. 300 (optional)"
                className={inputCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? null : Number(e.target.value))
                }
                value={field.value ?? ''}
              />
            )}
          />
        </InputField>

        {/* Class 12 Percentage */}
        <InputField
          label="Class 12 Percentage"
          required
          hint="Aggregate percentage in Class 12 — used for eligibility verification"
          error={errors.class12Percentage?.message}
        >
          <Controller
            name="class12Percentage"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                step="0.01"
                placeholder="e.g. 87.4"
                className={inputCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                }
                value={field.value ?? ''}
              />
            )}
          />
        </InputField>

        {/* Class 12 Year */}
        <InputField
          label="Class 12 Year of Passing"
          required
          hint="Students who passed in 2023 or 2024 are eligible for JoSAA 2026"
          error={errors.class12Year?.message}
        >
          <Controller
            name="class12Year"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={selectCls}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                }
                value={field.value ?? ''}
              >
                <option value="">Select year</option>
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          />
        </InputField>
      </div>

      {/* JEE Advanced Qualified */}
      <Controller
        name="jeeAdvancedQualified"
        control={control}
        render={({ field }) => (
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition">
                I have qualified JEE Advanced
              </span>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1">
                <Info size={11} />
                Required to be eligible for IIT seats via JoSAA counselling
              </p>
            </div>
          </label>
        )}
      />
    </div>
  );
}

// ─── Step 2 – Eligibility & Category ─────────────────────────────────────────

function Step2({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <InputField
          label="Full Name"
          required
          hint="As it appears on your JEE admit card / Score Card"
          error={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input {...field} type="text" placeholder="e.g. Arjun Sharma" className={inputCls} />
            )}
          />
        </InputField>

        {/* Email */}
        <InputField
          label="Email Address"
          required
          hint="Used for notifications; not shared with JoSAA"
          error={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="e.g. arjun@example.com"
                className={inputCls}
              />
            )}
          />
        </InputField>

        {/* Category */}
        <InputField
          label="Category"
          required
          hint="As certified by competent authority — determines cutoff pool"
          error={errors.category?.message}
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
          />
        </InputField>

        {/* Gender */}
        <InputField
          label="Gender"
          required
          hint="Used to check female-only seat pool eligibility"
          error={errors.gender?.message}
        >
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Gender-Neutral">Third Gender / Prefer not to say</option>
              </select>
            )}
          />
        </InputField>

        {/* Home State */}
        <InputField
          label="Home State"
          required
          hint="Determines Home State (HS) quota eligibility for NITs & GFTIs"
          error={errors.homeState?.message}
        >
          <Controller
            name="homeState"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          />
        </InputField>

        {/* Nationality */}
        <InputField
          label="Nationality"
          required
          hint="Foreign National / OCI students have separate seat pools"
          error={errors.nationality?.message}
        >
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="Indian">Indian</option>
                <option value="OCI">OCI (Overseas Citizen of India)</option>
                <option value="Foreign National">Foreign National</option>
              </select>
            )}
          />
        </InputField>
      </div>

      {/* PwD Status */}
      <Controller
        name="isPwD"
        control={control}
        render={({ field }) => (
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition">
                Person with Disability (PwD) status
              </span>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1">
                <Info size={11} />
                5% seats in every category are reserved for PwD candidates with ≥40% disability
              </p>
            </div>
          </label>
        )}
      />
    </div>
  );
}

// ─── Step 3 – Preferences ────────────────────────────────────────────────────

const INSTITUTE_TYPES: { value: InstituteType; label: string; desc: string }[] = [
  { value: 'IIT', label: 'IIT', desc: 'Indian Institutes of Technology — requires JEE Advanced' },
  { value: 'NIT', label: 'NIT', desc: 'National Institutes of Technology — JEE Main ranks' },
  { value: 'IIIT', label: 'IIIT', desc: 'Indian Institutes of Information Technology' },
  { value: 'GFTI', label: 'GFTI', desc: 'Government Funded Technical Institutes' },
];

const PRIORITY_OPTIONS = [
  {
    value: 'college_first',
    label: 'College First',
    desc: 'Prioritise prestige of the institute over branch choice',
  },
  {
    value: 'branch_first',
    label: 'Branch First',
    desc: 'Prioritise preferred branch over institute ranking',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    desc: 'Equal weight to both institute reputation and branch preference',
  },
  {
    value: 'custom',
    label: 'Custom',
    desc: 'Manually order all choices in the Preference Studio',
  },
];

function Step3({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      {/* Preferred Institute Types */}
      <div>
        <Label required>Preferred Institute Types</Label>
        <p className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          <Info size={11} />
          Select all institute types you want to appear in your preference list
        </p>
        <Controller
          name="preferredInstitutes"
          control={control}
          render={({ field }) => {
            const selected: InstituteType[] = Array.isArray(field.value) ? field.value : [];
            const toggle = (v: InstituteType) => {
              const next = selected.includes(v)
                ? selected.filter((x) => x !== v)
                : [...selected, v];
              field.onChange(next);
            };
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INSTITUTE_TYPES.map((it) => {
                  const active = selected.includes(it.value);
                  return (
                    <button
                      key={it.value}
                      type="button"
                      onClick={() => toggle(it.value)}
                      className={`relative flex flex-col items-center rounded-xl border-2 px-3 py-4 text-center transition-all cursor-pointer ${
                        active
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      {active && (
                        <span className="absolute top-2 right-2 text-indigo-600">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                      <span
                        className={`text-xl font-bold mb-1 ${
                          active ? 'text-indigo-700' : 'text-gray-500'
                        }`}
                      >
                        {it.label}
                      </span>
                      <span className="text-[10px] leading-tight text-gray-400">{it.desc}</span>
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
        <ErrorMsg message={errors.preferredInstitutes?.message} />
      </div>

      {/* Preferred Branches */}
      <div>
        <Label required>Preferred Branches</Label>
        <p className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          <Info size={11} />
          Select all engineering disciplines you're interested in
        </p>
        <Controller
          name="preferredBranches"
          control={control}
          render={({ field }) => {
            const selected: string[] = Array.isArray(field.value) ? field.value : [];
            const toggle = (v: string) => {
              const next = selected.includes(v)
                ? selected.filter((x) => x !== v)
                : [...selected, v];
              field.onChange(next);
            };
            return (
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map((b) => {
                  const active = selected.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggle(b)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'border-violet-500 bg-violet-100 text-violet-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-600'
                      }`}
                    >
                      {active && <CheckCircle2 size={11} />}
                      {b}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
        <ErrorMsg message={errors.preferredBranches?.message} />
      </div>

      {/* Institute Priority */}
      <div>
        <Label required>Priority Strategy</Label>
        <p className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          <Info size={11} />
          How should the AI rank institutes vs branches when generating your preference list?
        </p>
        <Controller
          name="institutePriority"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                    field.value === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                    className="mt-0.5 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        field.value === opt.value ? 'text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        />
        <ErrorMsg message={errors.institutePriority?.message} />
      </div>

      {/* Additional Notes */}
      <InputField
        label="Additional Notes"
        hint="Any special preferences or constraints the AI should know about (max 500 characters)"
        error={errors.additionalNotes?.message}
      >
        <Controller
          name="additionalNotes"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              placeholder="e.g. Prefer institutes in South India; want to pursue research; interested in dual degree…"
              className={`${inputCls} resize-none`}
            />
          )}
        />
      </InputField>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      // Step 1
      jeemainCRL: state.profile?.jeemainCRL ?? undefined,
      jeemainCategoryRank: state.profile?.jeemainCategoryRank ?? null,
      jeeAdvancedRank: state.profile?.jeeAdvancedRank ?? null,
      jeeAdvancedCategoryRank: state.profile?.jeeAdvancedCategoryRank ?? null,
      jeeAdvancedQualified: state.profile?.jeeAdvancedQualified ?? false,
      class12Percentage: state.profile?.class12Percentage ?? undefined,
      class12Year: state.profile?.class12Year ?? undefined,
      // Step 2
      name: state.profile?.name ?? '',
      email: state.profile?.email ?? '',
      category: state.profile?.category ?? 'OPEN',
      isPwD: state.profile?.isPwD ?? false,
      gender: state.profile?.gender ?? 'Male',
      homeState: state.profile?.homeState ?? '',
      nationality: (state.profile?.nationality as 'Indian' | 'Foreign National' | 'OCI') ?? 'Indian',
      // Step 3
      preferredInstitutes: ((state.profile?.preferredInstitutes?.filter(
        (t) => t !== 'ALL'
      ) ?? ['IIT', 'NIT']) as ('IIT' | 'NIT' | 'IIIT' | 'GFTI')[]),
      preferredBranches: state.profile?.preferredBranches ?? [],
      institutePriority: state.profile?.institutePriority ?? 'balanced',
      additionalNotes: '',
    },
    mode: 'onTouched',
  });

  // Step field mappings for partial validation
  const stepFields: Record<number, (keyof FormValues)[]> = {
    0: [
      'jeemainCRL',
      'jeemainCategoryRank',
      'jeeAdvancedRank',
      'jeeAdvancedCategoryRank',
      'jeeAdvancedQualified',
      'class12Percentage',
      'class12Year',
    ],
    1: ['name', 'email', 'category', 'isPwD', 'gender', 'homeState', 'nationality'],
    2: ['preferredInstitutes', 'preferredBranches', 'institutePriority', 'additionalNotes'],
  };

  const goNext = async () => {
    const valid = await trigger(stepFields[currentStep]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, 2));
  };

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const onSubmit = (data: FormValues) => {
    const profile: StudentProfile = {
      name: data.name,
      email: data.email,
      jeemainCRL: data.jeemainCRL,
      jeemainCategoryRank: data.jeemainCategoryRank ?? null,
      jeeAdvancedRank: data.jeeAdvancedRank ?? null,
      jeeAdvancedCategoryRank: data.jeeAdvancedCategoryRank ?? null,
      jeeAdvancedQualified: data.jeeAdvancedQualified,
      class12Percentage: data.class12Percentage,
      class12Year: data.class12Year,
      category: data.category,
      isPwD: data.isPwD,
      gender: data.gender,
      homeState: data.homeState,
      nationality: data.nationality,
      preferredInstitutes: data.preferredInstitutes as InstituteType[],
      preferredBranches: data.preferredBranches,
      preferredStates: [],
      institutePriority: data.institutePriority,
      branchPriority: [],
    };
    dispatch({ type: 'SET_PROFILE', payload: profile });
    setSaved(true);
  };

  // ── Saved success state ──
  if (saved) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828] mb-2">Profile Saved!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your JEE scores, eligibility details and preferences have been saved. You can now
            explore institutes and build your preference list.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSaved(false)}
              className="w-full rounded-xl bg-[#5145CD] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4338b3] transition"
            >
              Edit Profile
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F0FF]">
              <User size={18} className="text-[#5145CD]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#101828]">Student Profile</h1>
              <p className="text-xs text-gray-400">
                Provide your JEE scores and preferences to personalise JOSAA MATE AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Step Indicators */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center flex-1 relative">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-[#5145CD] bg-[#5145CD]'
                        : isActive
                        ? 'border-[#5145CD] bg-[#F3F0FF]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-white" />
                    ) : (
                      <Icon
                        size={17}
                        className={isActive ? 'text-[#5145CD]' : 'text-gray-400'}
                      />
                    )}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isActive ? 'text-[#5145CD]' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 mb-6 rounded transition-all ${
                      idx < currentStep ? 'bg-[#5145CD]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-50 bg-gradient-to-r from-[#F3F0FF] to-white flex items-center gap-3">
              {React.createElement(STEPS[currentStep].icon, {
                size: 20,
                className: 'text-[#5145CD]',
              })}
              <div>
                <h2 className="text-base font-bold text-[#101828]">
                  Step {currentStep + 1}: {STEPS[currentStep].label}
                </h2>
                <p className="text-xs text-gray-400">{STEPS[currentStep].description}</p>
              </div>
              <span className="ml-auto text-xs font-medium text-gray-400">
                {currentStep + 1} / {STEPS.length}
              </span>
            </div>

            {/* Step Content */}
            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                  {currentStep === 0 && <Step1 control={control} errors={errors} />}
                  {currentStep === 1 && <Step2 control={control} errors={errors} />}
                  {currentStep === 2 && <Step3 control={control} errors={errors} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
                Back
              </button>

              <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-6 bg-[#5145CD]'
                        : i < currentStep
                        ? 'w-2 bg-indigo-300'
                        : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5145CD] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338b3] transition"
                >
                  Continue
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5145CD] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338b3] transition shadow-md shadow-indigo-200"
                >
                  <Save size={15} />
                  Save Profile
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Info banner */}
        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
          <BookOpen size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Privacy:</strong> All profile data is stored locally in your browser and is never
            uploaded to any server. JOSAA MATE AI uses this information solely to personalise cutoff
            predictions and preference list suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}



