import { pool } from '../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'parish_management_secret_key';

export async function seedDefaultUsersAndDependencies() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Safe Database Seeding and Relational Dependency Verification ---');

    // 1. Ensure Wards table exists and verify base Ward (id: 1)
    await client.query(`
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
    `);

    const wardCheck = await client.query('SELECT id, ward_name FROM wards WHERE id = 1');
    if (wardCheck.rows.length === 0) {
      console.log('Base Ward (id: 1) not found. Creating entry...');
      await client.query(`
        INSERT INTO wards (id, ward_name, ward_number, total_units, representative_name, contact_phone)
        VALUES (1, 'St. Joseph Ward', 1, 1, 'Thomas George', '+91 94471 00003')
        ON CONFLICT (id) DO NOTHING;
      `);
      await client.query(`SELECT setval(pg_get_serial_sequence('wards', 'id'), COALESCE((SELECT MAX(id) FROM wards), 1));`);
      console.log('✓ Base Ward (id: 1) ensured.');
    } else {
      console.log(`✓ Existing Base Ward found (id: 1, name: "${wardCheck.rows[0].ward_name}"). Data preserved.`);
    }

    // 2. Ensure Families table exists and verify base Family (id: 1)
    await client.query(`
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
        unit_id INT,
        reg_no VARCHAR(50) NULL,
        email VARCHAR(150) NULL,
        family_code VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const familyCheck = await client.query('SELECT id, family_name, ward_id FROM families WHERE id = 1');
    if (familyCheck.rows.length === 0) {
      console.log('Base Family (id: 1) not found. Creating entry linked to ward 1...');
      await client.query(`
        INSERT INTO families (id, family_name, head_of_family, ward_id, unit_number, house_name, home_address, contact_number, email)
        VALUES (1, 'Parish Family', 'Parishioner User', 1, '101', 'Parish House', 'Devagiri, Kozhikode', '+91 98450 00002', 'parishioner@devagiriparish.com')
        ON CONFLICT (id) DO NOTHING;
      `);
      await client.query(`SELECT setval(pg_get_serial_sequence('families', 'id'), COALESCE((SELECT MAX(id) FROM families), 1));`);
      console.log('✓ Base Family (id: 1) ensured.');
    } else {
      console.log(`✓ Existing Base Family found (id: 1, name: "${familyCheck.rows[0].family_name}", ward_id: ${familyCheck.rows[0].ward_id}).`);
    }

    // 3. Ensure Members table exists with role and is_directory_visible columns
    await client.query(`
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
        is_directory_visible BOOLEAN DEFAULT true,
        role VARCHAR(50) DEFAULT 'parishioner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE members ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT true;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'parishioner';
    `);

    // Ensure Admin Member (id: 1, role: 'admin', is_directory_visible: false)
    const adminMemberCheck = await client.query('SELECT id FROM members WHERE id = 1');
    if (adminMemberCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO members (id, family_id, first_name, last_name, phone_number, email, relationship_role, is_head_of_household, is_directory_visible, role)
        VALUES (1, 1, 'Admin', 'User', '+91 98450 00001', 'admin@devagiriparish.com', 'Administrator', false, false, 'admin')
        ON CONFLICT (id) DO UPDATE SET is_directory_visible = false, role = 'admin';
      `);
    } else {
      await client.query(`
        UPDATE members SET role = 'admin', is_directory_visible = false, first_name = 'Admin', last_name = 'User'
        WHERE id = 1;
      `);
    }

    // Ensure Parishioner Member (id: 2, role: 'parishioner', is_directory_visible: true)
    const parishionerMemberCheck = await client.query('SELECT id FROM members WHERE id = 2');
    if (parishionerMemberCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO members (id, family_id, first_name, last_name, phone_number, email, relationship_role, is_head_of_household, is_directory_visible, role, dob, occupation, blood_group)
        VALUES (2, 1, 'Parishioner', 'User', '+91 98450 00002', 'parishioner@devagiriparish.com', 'Head', true, true, 'parishioner', '1985-05-15', 'Parishioner', 'O+')
        ON CONFLICT (id) DO UPDATE SET is_directory_visible = true, role = 'parishioner';
      `);
    } else {
      await client.query(`
        UPDATE members SET role = 'parishioner', is_directory_visible = true, first_name = 'Parishioner', last_name = 'User'
        WHERE id = 2;
      `);
    }

    // Clean up any demo mock members (e.g. from earlier runs) with IDs > 2 if families/members like Ponnamattam or dummy data were created
    await client.query(`
      DELETE FROM members WHERE id > 2 AND last_name IN ('Ponnamattam', 'Smith', 'Doe');
      DELETE FROM families WHERE id > 1 AND family_name IN ('Ponnamattam Family', 'Smith Family', 'Doe Family');
    `);

    await client.query(`SELECT setval(pg_get_serial_sequence('members', 'id'), COALESCE((SELECT MAX(id) FROM members), 2));`);

    // 4. Ensure app_users table and populate strictly the 2 active accounts
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        access_key VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'parishioner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_member_id_key;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_access_key ON app_users(access_key);
    `);

    // Purge any legacy accounts so that strictly the 2 active accounts remain in app_users
    await client.query(`DELETE FROM app_users WHERE access_key NOT IN ('admin123', 'user123');`);

    // Insert User 1: Admin User (role: 'admin', access key: 'admin123')
    await client.query(`
      INSERT INTO app_users (member_id, access_key, role)
      VALUES (1, 'admin123', 'admin')
      ON CONFLICT (access_key) DO UPDATE SET role = 'admin', member_id = 1;
    `);

    // Insert User 2: Parishioner User (role: 'parishioner', access key: 'user123')
    await client.query(`
      INSERT INTO app_users (member_id, access_key, role)
      VALUES (2, 'user123', 'parishioner')
      ON CONFLICT (access_key) DO UPDATE SET role = 'parishioner', member_id = 2;
    `);

    await client.query(`SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE((SELECT MAX(id) FROM app_users), 2));`);

    console.log('✓ Exactly 2 active user accounts configured in app_users.');

    // 5. Verification
    const verifyResult = await client.query(`
      SELECT u.id as user_id, u.member_id, u.access_key, u.role,
             m.first_name, m.last_name, m.email, m.phone_number, m.is_directory_visible,
             f.family_name, f.house_name, w.ward_name
      FROM app_users u
      JOIN members m ON u.member_id = m.id
      JOIN families f ON m.family_id = f.id
      JOIN wards w ON f.ward_id = w.id
      ORDER BY u.id ASC;
    `);

    console.table(verifyResult.rows);

    const adminAccount = verifyResult.rows.find((r) => r.role === 'admin' && r.access_key === 'admin123');
    const parishionerAccount = verifyResult.rows.find((r) => r.role === 'parishioner' && r.access_key === 'user123');

    if (!adminAccount || !parishionerAccount || verifyResult.rows.length !== 2) {
      throw new Error(`Verification failed: Expected exactly 2 users, found ${verifyResult.rows.length}!`);
    }

    console.log('✓ Both Admin (admin123) and Parishioner (user123) records verified successfully.');

    // 6. Test Authentication
    const adminToken = jwt.sign(
      {
        userId: String(adminAccount.user_id),
        memberId: String(adminAccount.member_id),
        role: adminAccount.role,
        firstName: adminAccount.first_name,
        lastName: adminAccount.last_name,
      },
      JWT_SECRET
    );
    const decodedAdmin = jwt.verify(adminToken, JWT_SECRET) as any;
    if (decodedAdmin.role !== 'admin') throw new Error('Admin role validation failed!');

    const parishionerToken = jwt.sign(
      {
        userId: String(parishionerAccount.user_id),
        memberId: String(parishionerAccount.member_id),
        role: parishionerAccount.role,
        firstName: parishionerAccount.first_name,
        lastName: parishionerAccount.last_name,
      },
      JWT_SECRET
    );
    const decodedParishioner = jwt.verify(parishionerToken, JWT_SECRET) as any;
    if (decodedParishioner.role !== 'parishioner') throw new Error('Parishioner role validation failed!');

    console.log('✓ Both tokens verified with correct roles.');
    return {
      adminAccount,
      parishionerAccount,
      adminToken,
      parishionerToken,
    };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDefaultUsersAndDependencies()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during seeding:', err);
      process.exit(1);
    });
}
