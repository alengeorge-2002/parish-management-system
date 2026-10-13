CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO wards (ward_name) VALUES 
('St. Jude Ward'),
('St. Mary Ward'),
('St. Joseph Ward')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    unit_number INTEGER NOT NULL,
    ward_id INT NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO units (unit_number, ward_id) VALUES 
(101, 1),
(202, 2),
(5, 3)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(150) NOT NULL,
    head_of_family VARCHAR(150),
    ward_id INT NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
    unit_number VARCHAR(50) NOT NULL,
    house_name VARCHAR(150) NOT NULL,
    home_address TEXT NOT NULL,
    family_photo_url TEXT NOT NULL,
    contact_number VARCHAR(20),
    unit_id INT REFERENCES units(id) ON DELETE SET NULL,
    reg_no VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert families linking to the seeded wards & units
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
    phone_number VARCHAR(20),
    email VARCHAR(150),
    relationship_role VARCHAR(50) NOT NULL,
    is_head_of_household BOOLEAN DEFAULT false,
    dob DATE NULL,
    dom DATE NULL,
    occupation VARCHAR(150) NULL,
    blood_group VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert members linking to the seeded families
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
    member_id INT UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    access_key VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'parishioner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_users_access_key ON app_users(access_key);

-- Insert sample app users for the seeded members
INSERT INTO app_users (member_id, access_key, role) VALUES 
(1, 'access_key_admin_123', 'admin'),
(2, 'access_key_user_456', 'parishioner'),
(3, 'access_key_user_789', 'parishioner'),
(4, 'access_key_user_ponnamattam', 'parishioner')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
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
    name VARCHAR(255) UNIQUE NOT NULL,
    role_type VARCHAR(100) NOT NULL,
    designation VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(100),
    blood_group VARCHAR(50),
    avatar_url VARCHAR(255)
);

INSERT INTO clergy_directory (name, role_type, designation, address, email, phone_number, blood_group, avatar_url) VALUES
('Rev. Fr. Joseph Mathew', 'parish-priest', 'Vicar', NULL, 'pp.stjosephdevagiri@gmail.com', '+91 98450 00001', 'O+', NULL),
('Rev. Fr. George Varghese', 'parish-priest', 'Associate Pastor', NULL, 'assoc.stjosephdevagiri@gmail.com', '+91 98450 00002', 'O+', NULL),
('Sr. Anitha Thomas', 'sister', 'School Principal', 'CMC', NULL, '+91 98450 00003', 'O+', NULL),
('Sr. Mary Joseph', 'sister', 'Social Service Wing', 'CMI', NULL, '+91 98450 00004', 'O+', NULL)
ON CONFLICT (name) DO NOTHING;


CREATE TABLE IF NOT EXISTS clergy_directory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    role_type VARCHAR(100) NOT NULL,
    designation VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(100),
    blood_group VARCHAR(50),
    avatar_url VARCHAR(255)
);

INSERT INTO clergy_directory (name, role_type, designation, address, email, phone_number, blood_group, avatar_url) VALUES
('Rev. Fr. Joseph Mathew', 'parish-priest', 'Vicar', NULL, 'pp.stjosephdevagiri@gmail.com', '+91 98450 00001', 'O+', NULL),
('Rev. Fr. George Varghese', 'parish-priest', 'Associate Pastor', NULL, 'assoc.stjosephdevagiri@gmail.com', '+91 98450 00002', 'O+', NULL),
('Sr. Anitha Thomas', 'sister', 'School Principal', 'CMC', NULL, '+91 98450 00003', 'O+', NULL),
('Sr. Mary Joseph', 'sister', 'Social Service Wing', 'CMI', NULL, '+91 98450 00004', 'O+', NULL)
ON CONFLICT (name) DO NOTHING;


CREATE TABLE IF NOT EXISTS clergy_directory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role_type VARCHAR(100) NOT NULL,
    designation VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(100),
    blood_group VARCHAR(50),
    avatar_url VARCHAR(255)
);

INSERT INTO clergy_directory (name, role_type, designation, address, email, phone_number, blood_group, avatar_url) VALUES
('Rev. Fr. Joseph Mathew', 'parish-priest', 'Vicar', NULL, 'pp.stjosephdevagiri@gmail.com', '+91 98450 00001', 'O+', NULL),
('Rev. Fr. George Varghese', 'parish-priest', 'Associate Pastor', NULL, 'assoc.stjosephdevagiri@gmail.com', '+91 98450 00002', 'O+', NULL),
('Sr. Anitha Thomas', 'sister', 'School Principal', 'CMC', NULL, '+91 98450 00003', 'O+', NULL),
('Sr. Mary Joseph', 'sister', 'Social Service Wing', 'CMI', NULL, '+91 98450 00004', 'O+', NULL)
ON CONFLICT DO NOTHING;
