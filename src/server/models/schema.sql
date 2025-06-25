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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, date);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_member ON emergency_contacts(member_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_member ON medical_conditions(member_id);
CREATE INDEX IF NOT EXISTS idx_challenging_behaviours_member ON challenging_behaviours(member_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();