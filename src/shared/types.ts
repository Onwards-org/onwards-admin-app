export interface User {
  id: number
  username: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export interface Member {
  id: number
  name: string
  phone: string
  email: string
  address: string
  postcode: string
  birth_month: number
  birth_year: number
  employment_status: string
  ethnicity: string
  religion: string
  gender: string
  sexual_orientation: string
  transgender_status: string
  hobbies_interests: string
  pregnancy_maternity: string
  additional_health_info: string
  privacy_accepted: boolean
  created_at: Date
  updated_at: Date
}

export interface EmergencyContact {
  id: number
  member_id: number
  name: string
  phone: string
}

export interface MedicalCondition {
  id: number
  member_id: number
  condition: string
}

export interface ChallengingBehaviour {
  id: number
  member_id: number
  behaviour: string
}

export interface Attendance {
  id: number
  member_id: number
  date: Date
  present: boolean
}

export interface AttendanceReport {
  month: number
  year: number
  stats: {
    genders: Record<string, number>
    age_groups: Record<string, number>
    ethnicities: Record<string, number>
    disabilities: Record<string, number>
    sexual_orientations: Record<string, number>
    employment_status: Record<string, number>
    postcodes: Record<string, number>
  }
}

export const EMPLOYMENT_OPTIONS = [
  'Full-time employment',
  'Part-time employment', 
  'Self-employed',
  'Unemployed',
  'Student - Full-time',
  'Student - Part-time',
  'Retired',
  'Unable to work due to disability',
  'Volunteer work',
  'Other'
] as const

export const ETHNICITY_OPTIONS = [
  'White - British',
  'White - Irish',
  'White - Other',
  'Mixed - White and Black Caribbean',
  'Mixed - White and Black African',
  'Mixed - White and Asian',
  'Mixed - Other',
  'Asian - Indian',
  'Asian - Pakistani',
  'Asian - Bangladeshi',
  'Asian - Chinese',
  'Asian - Other',
  'Black - Caribbean',
  'Black - African',
  'Black - Other',
  'Arab',
  'Other ethnic group',
  'Prefer not to say'
] as const

export const RELIGION_OPTIONS = [
  'No religion',
  'Christian',
  'Buddhist',
  'Hindu',
  'Jewish',
  'Muslim',
  'Sikh',
  'Any other religion',
  'Prefer not to say'
] as const

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Other',
  'Prefer not to say'
] as const

export const SEXUAL_ORIENTATION_OPTIONS = [
  'Heterosexual/Straight',
  'Gay or Lesbian',
  'Bisexual',
  'Pansexual',
  'Asexual',
  'Other',
  'Prefer not to say'
] as const

export const TRANSGENDER_OPTIONS = [
  'No',
  'Yes',
  'Prefer not to say'
] as const

export const PREGNANCY_OPTIONS = [
  'Not applicable',
  'Pregnant',
  'On maternity leave',
  'Recently given birth (within 26 weeks)',
  'Prefer not to say'
] as const

export const MEDICAL_CONDITIONS_OPTIONS = [
  'Autism Spectrum Disorder',
  'ADHD',
  'Anxiety disorders',
  'Depression',
  'Bipolar disorder',
  'OCD',
  'PTSD',
  'Learning disability',
  'Physical disability',
  'Sensory impairment',
  'Chronic illness',
  'Other'
] as const

export const CHALLENGING_BEHAVIOURS_OPTIONS = [
  'Self-harm',
  'Aggression towards others',
  'Property destruction',
  'Verbal outbursts',
  'Social withdrawal',
  'Repetitive behaviours',
  'Sensory seeking behaviours',
  'Food-related issues',
  'Sleep difficulties',
  'Other'
] as const