CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) UNIQUE NOT NULL,
    ward_number INTEGER,
    ward_prefix VARCHAR(50) DEFAULT 'W',
    total_units INT DEFAULT 0,
    representative_name VARCHAR(150),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE wards ADD COLUMN IF NOT EXISTS ward_number INTEGER;
ALTER TABLE wards ADD COLUMN IF NOT EXISTS ward_prefix VARCHAR(50) DEFAULT 'W';
ALTER TABLE wards ADD COLUMN IF NOT EXISTS total_units INT DEFAULT 0;
ALTER TABLE wards ADD COLUMN IF NOT EXISTS representative_name VARCHAR(150);
ALTER TABLE wards ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wards_ward_name ON wards(ward_name);

INSERT INTO wards (ward_name, ward_number, total_units, representative_name, contact_phone) VALUES 
('St. Jude Ward', 1, 4, 'Varghese Mathew', '+91 94471 00001'),
('St. Mary Ward', 2, 3, 'Joseph Kuriakose', '+91 94471 00002'),
('St. Joseph Ward', 3, 5, 'Thomas George', '+91 94471 00003')
ON CONFLICT (ward_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    unit_number VARCHAR(50) NOT NULL,
    unit_name VARCHAR(150),
    representative_name VARCHAR(150),
    representative_phone VARCHAR(50),
    ward_id INT NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'name') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'unit_name') THEN
    ALTER TABLE units RENAME COLUMN name TO unit_name;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'unit_number' AND data_type IN ('integer', 'smallint', 'bigint')
  ) THEN
    ALTER TABLE units ALTER COLUMN unit_number TYPE VARCHAR(50) USING unit_number::varchar;
  END IF;
END $$;

ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_number VARCHAR(50);
ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_name VARCHAR(150);
ALTER TABLE units ADD COLUMN IF NOT EXISTS representative_name VARCHAR(150);
ALTER TABLE units ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(50);

INSERT INTO units (unit_number, unit_name, ward_id) VALUES 
('101', 'Unit 101', 1),
('202', 'Unit 202', 2),
('5', 'Unit 5', 3)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(150) NOT NULL,
    head_of_family VARCHAR(150),
    ward_id INT REFERENCES wards(id) ON DELETE RESTRICT,
    unit_number VARCHAR(50) NOT NULL,
    house_name VARCHAR(150) NOT NULL,
    home_address TEXT NOT NULL,
    family_photo_url TEXT,
    contact_number VARCHAR(50),
    unit_id INT REFERENCES units(id) ON DELETE SET NULL,
    reg_no VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    family_code VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO families (family_name, head_of_family, ward_id, unit_number, house_name, home_address, family_photo_url, contact_number, unit_id, reg_no, email) VALUES 
('Smith Family', 'John Smith', 1, 'A-101', 'Smith Villa', '123 Main St, Springfield', 'https://example.com/photos/smith.jpg', '555-1234', 1, 'REG-001', 'smith@example.com'),
('Doe Family', 'Jane Doe', 2, 'B-202', 'Doe Residence', '456 Oak Ave, Springfield', 'https://example.com/photos/doe.jpg', '555-5678', 2, 'REG-002', 'doe@example.com'),
('Ponnamattam Family', 'Benny', 3, '5', 'Ponnamattam', 'E5-225, KSHB Colony, Medical College P.O., Kozhikode - 673008', 'https://example.com/photos/ponnamattam.jpg', '555-0101', 3, 'VI-65/33', 'bennyhilarious@gmail.com')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    email VARCHAR(150),
    relationship_role VARCHAR(50) NOT NULL,
    is_head_of_household BOOLEAN DEFAULT false,
    dob DATE NULL,
    dom DATE NULL,
    occupation VARCHAR(150) NULL,
    blood_group VARCHAR(20) NULL,
    malayalam_name VARCHAR(150) NULL,
    baptism_name VARCHAR(150) NULL,
    gender VARCHAR(20) DEFAULT 'MALE',
    status VARCHAR(50) DEFAULT 'active',
    sacraments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO members (family_id, first_name, last_name, phone_number, email, relationship_role, is_head_of_household, dob, dom, occupation, blood_group) VALUES 
(1, 'John', 'Smith', '555-1234', 'john.smith@example.com', 'Husband', true, '1980-01-01', '2005-05-05', 'Engineer', 'A+'),
(1, 'Mary', 'Smith', '555-5678', 'mary.smith@example.com', 'Wife', false, '1982-02-02', '2005-05-05', 'Teacher', 'B+'),
(2, 'Jane', 'Doe', '555-9012', 'jane.doe@example.com', 'Wife', true, '1985-03-03', NULL, 'Doctor', 'O+'),
(3, 'Benny', 'Ponnamattam', '555-0101', 'bennyhilarious@gmail.com', 'Husband', true, '1975-05-12', '2000-01-20', 'Engineer', 'O+'),
(3, 'Sophia', 'Ponnamattam', '555-0102', 'sophia@example.com', 'Wife', false, '1978-08-22', '2000-01-20', 'Teacher', 'O+'),
(3, 'Shilpa', 'Ponnamattam', '555-0103', 'shilpa@example.com', 'Daughter', false, '2002-11-05', NULL, 'Student', 'O+'),
(3, 'Richard', 'Ponnamattam', '555-0104', 'richard@example.com', 'Son', false, '2005-04-14', NULL, 'Student', 'O+'),
(3, 'Sandra', 'Ponnamattam', '555-0105', 'sandra@example.com', 'Daughter', false, '2008-09-30', NULL, 'Student', 'O+')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    access_key VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'parishioner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_member_id_key;
CREATE INDEX IF NOT EXISTS idx_app_users_access_key ON app_users(access_key);

INSERT INTO app_users (member_id, access_key, role) VALUES 
(1, 'admin_secret_key_123', 'admin'),
(1, 'parishioner_key_456', 'parishioner'),
(1, 'access_key_admin_123', 'admin'),
(2, 'access_key_user_456', 'parishioner'),
(3, 'access_key_user_789', 'parishioner'),
(4, 'access_key_user_ponnamattam', 'parishioner')
ON CONFLICT (access_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    poster_url TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMP,
    announcement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO announcements (title, content, image_url, priority) VALUES 
('Solemnity of Corpus Christi Feast', 'Join us for the Eucharistic Procession around the parish grounds immediately following the 10:00 AM Solemn Mass this Sunday.', 'https://images.unsplash.com/photo-1548625361-155deee26291?auto=format&fit=crop&w=800&q=80', 'high'),
('Catechism Classes Registration', 'Registration for the new academic year of Catechism classes is now open for children ages 6 to 16. Contact the parish office to enroll.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', 'medium'),
('Youth Ministry Fellowship', 'A warm welcome to all teenagers for an evening of praise, worship, and fellowship in the parish hall this Saturday at 6:30 PM.', 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=800&q=80', 'low')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS clergy_directory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role_type VARCHAR(100) NOT NULL,
    designation VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(100),
    blood_group VARCHAR(50),
    avatar_url VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_quick_contact BOOLEAN DEFAULT false,
    house_id INT
);

ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS is_quick_contact BOOLEAN DEFAULT false;
ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS house_id INT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clergy_directory_name ON clergy_directory(name);

INSERT INTO clergy_directory (name, role_type, designation, address, email, phone_number, blood_group, avatar_url, display_order) VALUES
('Rev. Fr. Joseph Mathew', 'parish-priest', 'Vicar', NULL, 'pp.stjosephdevagiri@gmail.com', '+91 98450 00001', 'O+', NULL, 1),
('Rev. Fr. George Varghese', 'parish-priest', 'Associate Pastor', NULL, 'assoc.stjosephdevagiri@gmail.com', '+91 98450 00002', 'O+', NULL, 2),
('Sr. Anitha Thomas', 'sister', 'School Principal', 'CMC', NULL, '+91 98450 00003', 'O+', NULL, 3),
('Sr. Mary Joseph', 'sister', 'Social Service Wing', 'CMI', NULL, '+91 98450 00004', 'O+', NULL, 4)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ml VARCHAR(255),
    event_date VARCHAR(50),
    target_date VARCHAR(50),
    mass_time VARCHAR(100),
    type_badge VARCHAR(50),
    location VARCHAR(255) DEFAULT 'Main Sanctuary',
    description TEXT,
    description_en TEXT,
    description_ml TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS religious_houses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_type VARCHAR(100) DEFAULT 'Convent',
    category VARCHAR(100) DEFAULT 'Convent',
    superior_in_charge VARCHAR(255),
    resident_count INT DEFAULT 0,
    contact_number VARCHAR(100),
    email VARCHAR(255),
    address TEXT,
    photo_url TEXT,
    residents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    name_en VARCHAR(255),
    name_ml VARCHAR(255),
    category VARCHAR(100) DEFAULT 'ministry',
    description TEXT,
    icon_symbol VARCHAR(100),
    members JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parish_council (
    id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(id) ON DELETE SET NULL,
    role_title VARCHAR(150) NOT NULL,
    committee_type VARCHAR(100) NOT NULL,
    ward_id INT REFERENCES wards(id) ON DELETE SET NULL,
    display_order INT DEFAULT 0,
    term VARCHAR(50) DEFAULT '2024 – 2026',
    occupant_name VARCHAR(150),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'filled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar (
    id SERIAL PRIMARY KEY,
    date_string VARCHAR(50) UNIQUE NOT NULL,
    day_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    keys JSONB NOT NULL,
    device_type VARCHAR(50) DEFAULT 'web',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mass_schedules (
    id SERIAL PRIMARY KEY,
    day_type VARCHAR(100) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ml TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
