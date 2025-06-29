-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table for community members
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(20),
    birth_month INTEGER CHECK (birth_month >= 1 AND birth_month <= 12),
    birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    employment_status VARCHAR(100) NOT NULL,
    ethnicity VARCHAR(100) NOT NULL,
    religion VARCHAR(100) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    sexual_orientation VARCHAR(50) NOT NULL,
    transgender_status VARCHAR(50) NOT NULL,
    hobbies_interests TEXT,
    pregnancy_maternity VARCHAR(100),
    additional_health_info TEXT,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenging behaviours table
CREATE TABLE IF NOT EXISTS challenging_behaviours (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    behaviour VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance tracking table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    present BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, date)
);

-- UCLA Loneliness Scale submissions table
CREATE TABLE IF NOT EXISTS ucla_loneliness_scale (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isolated_response VARCHAR(50) NOT NULL CHECK (isolated_response IN ('hardly_ever', 'some_of_the_time', 'often')),
    left_out_response VARCHAR(50) NOT NULL CHECK (left_out_response IN ('hardly_ever', 'some_of_the_time', 'often')),
    lack_companionship_response VARCHAR(50) NOT NULL CHECK (lack_companionship_response IN ('hardly_ever', 'some_of_the_time', 'often')),
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo Consent Form table
CREATE TABLE IF NOT EXISTS photo_consent_forms (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_type VARCHAR(100) NOT NULL DEFAULT 'GENERAL (All events)',
    participant_name VARCHAR(255) NOT NULL,
    participant_signature VARCHAR(255) NOT NULL,
    adult_consent BOOLEAN NOT NULL DEFAULT TRUE,
    child_consent BOOLEAN NOT NULL DEFAULT FALSE,
    child_names TEXT, -- JSON array or comma-separated list of children's names
    responsible_adult_name VARCHAR(255), -- Name of adult responsible for children
    responsible_adult_signature VARCHAR(255), -- Signature of adult responsible for children
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wellbeing Index Questionnaire submissions table
CREATE TABLE IF NOT EXISTS wellbeing_index_submissions (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    age_group VARCHAR(50) NOT NULL,
    gender VARCHAR(50),
    location VARCHAR(255),
    wellbeing_score INTEGER NOT NULL CHECK (wellbeing_score >= 4 AND wellbeing_score <= 24),
    mental_health_score INTEGER NOT NULL CHECK (mental_health_score >= 4 AND mental_health_score <= 24),
    social_score INTEGER NOT NULL CHECK (social_score >= 4 AND social_score <= 24),
    physical_health_score INTEGER NOT NULL CHECK (physical_health_score >= 4 AND physical_health_score <= 24),
    purpose_score INTEGER NOT NULL CHECK (purpose_score >= 4 AND purpose_score <= 24),
    responses JSONB NOT NULL, -- Store all individual question responses
    additional_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, date);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_member ON emergency_contacts(member_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_member ON medical_conditions(member_id);
CREATE INDEX IF NOT EXISTS idx_challenging_behaviours_member ON challenging_behaviours(member_id);
CREATE INDEX IF NOT EXISTS idx_ucla_loneliness_scale_date ON ucla_loneliness_scale(submission_date);
CREATE INDEX IF NOT EXISTS idx_ucla_loneliness_scale_name ON ucla_loneliness_scale(name);
CREATE INDEX IF NOT EXISTS idx_photo_consent_submission_date ON photo_consent_forms(submission_date);
CREATE INDEX IF NOT EXISTS idx_photo_consent_event_date ON photo_consent_forms(event_date);
CREATE INDEX IF NOT EXISTS idx_wellbeing_submissions_created_at ON wellbeing_index_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_wellbeing_submissions_name ON wellbeing_index_submissions(full_name);
CREATE INDEX IF NOT EXISTS idx_wellbeing_submissions_age_group ON wellbeing_index_submissions(age_group);
CREATE INDEX IF NOT EXISTS idx_wellbeing_submissions_location ON wellbeing_index_submissions(location);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();