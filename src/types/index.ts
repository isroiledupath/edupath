export type UserRole = 'student' | 'organizer' | 'company' | 'mentor' | 'admin';
export type ListingStatus = 'pending' | 'active' | 'closed';
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type ListingType = 'volunteer' | 'internship';
export type SessionType = 'free' | 'paid';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type VideoCategory = 'academics' | 'leadership' | 'skills' | 'university_guide' | 'visa';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  school_name?: string;
  grade?: string;
  bio?: string;
  location?: string;
  created_at: string;
}

export interface StudentProfile {
  user_id: string;
  gpa?: number;
  major_interest?: string;
  target_country?: string;
  target_university?: string;
  skills: string[];
  languages: string[];
  resume_url?: string;
  updated_at: string;
}

export interface VolunteerListing {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  min_age?: number;
  max_age?: number;
  requirements?: string;
  benefits?: string;
  eligibility_criteria?: string;
  disqualifications?: string;
  deadline?: string;
  spots_available?: number;
  is_verified: boolean;
  status: ListingStatus;
  category?: string;
  location?: string;
  created_at: string;
  organizer?: User;
}

export interface InternshipListing {
  id: string;
  company_id: string;
  title: string;
  description: string;
  field?: string;
  min_gpa?: number;
  motivation_essay_required: boolean;
  resume_required: boolean;
  additional_requirements?: string;
  duration?: string;
  compensation?: string;
  deadline?: string;
  is_verified: boolean;
  status: ListingStatus;
  location?: string;
  created_at: string;
  company?: User;
}

export interface Application {
  id: string;
  applicant_id: string;
  listing_id: string;
  listing_type: ListingType;
  resume_url?: string;
  motivation_essay?: string;
  status: ApplicationStatus;
  organizer_notes?: string;
  applied_at: string;
  applicant?: User;
}

export interface MentorProfile {
  user_id: string;
  university: string;
  degree?: string;
  graduation_year?: number;
  country?: string;
  expertise_areas: string[];
  session_type: SessionType;
  price_per_session?: number;
  availability_schedule: Record<string, string[]>;
  languages_spoken: string[];
  total_sessions: number;
  rating: number;
  verified: boolean;
  updated_at: string;
  user?: User;
}

export interface MentorBooking {
  id: string;
  student_id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  topic?: string;
  status: BookingStatus;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  student?: User;
  mentor?: User;
}

export interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  category: VideoCategory;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  tags: string[];
  views: number;
  published_at: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description?: string;
  provider: string;
  amount?: string;
  target_country: string[];
  deadline?: string;
  link?: string;
  eligibility?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Extended types with joins
export interface MentorWithProfile extends User {
  mentor_profiles: MentorProfile;
}

export interface ApplicationWithDetails extends Application {
  applicant: User;
  student_profiles?: StudentProfile;
}

// Form types
export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  school_name?: string;
  grade?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface VolunteerListingForm {
  title: string;
  description: string;
  min_age?: number;
  max_age?: number;
  requirements?: string;
  benefits?: string;
  eligibility_criteria?: string;
  disqualifications?: string;
  deadline?: string;
  spots_available?: number;
  category?: string;
  location?: string;
}

export interface InternshipListingForm {
  title: string;
  description: string;
  field?: string;
  min_gpa?: number;
  motivation_essay_required: boolean;
  resume_required: boolean;
  additional_requirements?: string;
  duration?: string;
  compensation?: string;
  deadline?: string;
  location?: string;
}

export interface ApplicationForm {
  listing_id: string;
  listing_type: ListingType;
  resume_url?: string;
  motivation_essay?: string;
}

export interface BookingForm {
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  topic?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
