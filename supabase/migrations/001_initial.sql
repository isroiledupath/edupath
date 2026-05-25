-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'organizer', 'company', 'mentor', 'admin');
CREATE TYPE listing_status AS ENUM ('pending', 'active', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE listing_type AS ENUM ('volunteer', 'internship');
CREATE TYPE session_type AS ENUM ('free', 'paid');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE video_category AS ENUM ('academics', 'leadership', 'skills', 'university_guide', 'visa');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  school_name TEXT,
  grade TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gpa DECIMAL(3,2),
  major_interest TEXT,
  target_country TEXT,
  target_university TEXT,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  resume_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Volunteer listings
CREATE TABLE volunteer_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  requirements TEXT,
  benefits TEXT,
  eligibility_criteria TEXT,
  disqualifications TEXT,
  deadline DATE,
  spots_available INTEGER,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status listing_status NOT NULL DEFAULT 'pending',
  category TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internship listings
CREATE TABLE internship_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  field TEXT,
  min_gpa DECIMAL(3,2),
  motivation_essay_required BOOLEAN NOT NULL DEFAULT false,
  resume_required BOOLEAN NOT NULL DEFAULT true,
  additional_requirements TEXT,
  duration TEXT,
  compensation TEXT,
  deadline DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status listing_status NOT NULL DEFAULT 'pending',
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL,
  listing_type listing_type NOT NULL,
  resume_url TEXT,
  motivation_essay TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  organizer_notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor profiles
CREATE TABLE mentor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university TEXT NOT NULL,
  degree TEXT,
  graduation_year INTEGER,
  country TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  session_type session_type NOT NULL DEFAULT 'free',
  price_per_session DECIMAL(10,2),
  availability_schedule JSONB DEFAULT '{}',
  languages_spoken TEXT[] DEFAULT '{}',
  total_sessions INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor bookings
CREATE TABLE mentor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  topic TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video lessons
CREATE TABLE video_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category video_category NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scholarships
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL,
  amount TEXT,
  target_country TEXT[] DEFAULT '{}',
  deadline DATE,
  link TEXT,
  eligibility TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Student profiles policies
CREATE POLICY "Students can manage own profile" ON student_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view student profiles" ON student_profiles FOR SELECT USING (true);

-- Volunteer listings policies
CREATE POLICY "Anyone can view active listings" ON volunteer_listings FOR SELECT USING (status = 'active' AND is_verified = true);
CREATE POLICY "Organizers can manage own listings" ON volunteer_listings FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Admins can view all listings" ON volunteer_listings FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update listings" ON volunteer_listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Internship listings policies
CREATE POLICY "Anyone can view active internships" ON internship_listings FOR SELECT USING (status = 'active' AND is_verified = true);
CREATE POLICY "Companies can manage own listings" ON internship_listings FOR ALL USING (auth.uid() = company_id);
CREATE POLICY "Admins can view all internships" ON internship_listings FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update internships" ON internship_listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Applications policies
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Students can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Organizers can view applications for their listings" ON applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM volunteer_listings WHERE id = listing_id AND organizer_id = auth.uid()
    UNION
    SELECT 1 FROM internship_listings WHERE id = listing_id AND company_id = auth.uid()
  )
);
CREATE POLICY "Organizers can update application status" ON applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM volunteer_listings WHERE id = listing_id AND organizer_id = auth.uid()
    UNION
    SELECT 1 FROM internship_listings WHERE id = listing_id AND company_id = auth.uid()
  )
);

-- Mentor profiles policies
CREATE POLICY "Anyone can view verified mentors" ON mentor_profiles FOR SELECT USING (verified = true);
CREATE POLICY "Mentors can manage own profile" ON mentor_profiles FOR ALL USING (auth.uid() = user_id);

-- Mentor bookings policies
CREATE POLICY "Students can view own bookings" ON mentor_bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Mentors can view own bookings" ON mentor_bookings FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Students can create bookings" ON mentor_bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Mentors can update bookings" ON mentor_bookings FOR UPDATE USING (auth.uid() = mentor_id);

-- Video lessons policies
CREATE POLICY "Anyone can view video lessons" ON video_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage video lessons" ON video_lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Scholarships policies
CREATE POLICY "Anyone can view scholarships" ON scholarships FOR SELECT USING (true);
CREATE POLICY "Admins can manage scholarships" ON scholarships FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes for performance
CREATE INDEX idx_volunteer_listings_status ON volunteer_listings(status, is_verified);
CREATE INDEX idx_volunteer_listings_organizer ON volunteer_listings(organizer_id);
CREATE INDEX idx_internship_listings_status ON internship_listings(status, is_verified);
CREATE INDEX idx_internship_listings_company ON internship_listings(company_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_listing ON applications(listing_id);
CREATE INDEX idx_mentor_bookings_student ON mentor_bookings(student_id);
CREATE INDEX idx_mentor_bookings_mentor ON mentor_bookings(mentor_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
