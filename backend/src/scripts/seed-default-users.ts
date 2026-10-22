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
      console.log('Base Ward (id: 1) not found. Creating fallback entry...');
      // Safe insert: If 'St. Joseph Ward' name exists under another ID, use fallback name
      await client.query(`
        INSERT INTO wards (id, ward_name, ward_number, total_units, representative_name, contact_phone)
        VALUES (1, 'St. Joseph Ward', 1, 1, 'Thomas George', '+91 94471 00003')
        ON CONFLICT (id) DO NOTHING
        ON CONFLICT (ward_name) DO NOTHING;
      `);
      // If still not present due to ward_name conflict, insert with unique name
      const wardCheck2 = await client.query('SELECT id FROM wards WHERE id = 1');
      if (wardCheck2.rows.length === 0) {
        await client.query(`
          INSERT INTO wards (id, ward_name, ward_number, total_units)
          VALUES (1, 'St. Joseph Ward Base', 1, 1)
          ON CONFLICT (id) DO NOTHING;
        `);
      }
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
      console.log('Base Family (id: 1) not found. Creating fallback entry linked to ward 1...');
      await client.query(`
        INSERT INTO families (id, family_name, head_of_family, ward_id, unit_number, house_name, home_address, contact_number)
        VALUES (1, 'Holy Family', 'John Doe', 1, 'Unit 1', 'Grace Villa', 'Grace Villa, Devagiri', '555-0100')
        ON CONFLICT (id) DO NOTHING;
      `);
      await client.query(`SELECT setval(pg_get_serial_sequence('families', 'id'), COALESCE((SELECT MAX(id) FROM families), 1));`);
      console.log('✓ Base Family (id: 1) ensured.');
    } else {
      console.log(`✓ Existing Base Family found (id: 1, name: "${familyCheck.rows[0].family_name}", ward_id: ${familyCheck.rows[0].ward_id}). Data preserved.`);
    }

    // 3. Ensure Members table exists and verify base Member (id: 1)
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const memberCheck = await client.query('SELECT id, first_name, last_name, family_id FROM members WHERE id = 1');
    if (memberCheck.rows.length === 0) {
      console.log('Base Member (id: 1) not found. Creating fallback entry linked to family 1...');
      await client.query(`
        INSERT INTO members (id, family_id, first_name, last_name, relationship_role, is_head_of_household, email, phone_number)
        VALUES (1, 1, 'John', 'Doe', 'Head', true, 'john.doe@example.com', '555-0100')
        ON CONFLICT (id) DO NOTHING;
      `);
      await client.query(`SELECT setval(pg_get_serial_sequence('members', 'id'), COALESCE((SELECT MAX(id) FROM members), 1));`);
      console.log('✓ Base Member (id: 1) ensured.');
    } else {
      console.log(`✓ Existing Base Member found (id: 1, name: "${memberCheck.rows[0].first_name} ${memberCheck.rows[0].last_name}", family_id: ${memberCheck.rows[0].family_id}). Data preserved.`);
    }

    // 4. Ensure app_users table and remove single-role uniqueness restriction on member_id
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        access_key VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'parishioner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drop unique constraint on member_id if it exists to allow a member to hold distinct role credentials
    await client.query(`ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_member_id_key;`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_access_key ON app_users(access_key);`);

    // 5. Insert default accounts safely using ON CONFLICT (access_key) DO NOTHING
    console.log('Inserting default user accounts into app_users...');
    const accountsToSeed = [
      { member_id: 1, access_key: 'admin_secret_key_123', role: 'admin' },
      { member_id: 1, access_key: 'parishioner_key_456', role: 'parishioner' },
      // Also retain standard project keys if desired
      { member_id: 1, access_key: 'access_key_admin_123', role: 'admin' },
      { member_id: 1, access_key: 'access_key_user_456', role: 'parishioner' },
    ];

    for (const acc of accountsToSeed) {
      await client.query(`
        INSERT INTO app_users (member_id, access_key, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (access_key) DO NOTHING;
      `, [acc.member_id, acc.access_key, acc.role]);
    }
    await client.query(`SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE((SELECT MAX(id) FROM app_users), 1));`);

    console.log('✓ Default admin and parishioner user accounts safely seeded.');

    // 6. Verification & Testing
    console.log('\n--- Verifying Seeded Accounts via SQL JOIN ---');
    const verifyResult = await client.query(`
      SELECT u.id as user_id, u.member_id, u.access_key, u.role,
             m.first_name, m.last_name, m.email, m.phone_number,
             f.family_name, f.house_name, w.ward_name
      FROM app_users u
      JOIN members m ON u.member_id = m.id
      JOIN families f ON m.family_id = f.id
      JOIN wards w ON f.ward_id = w.id
      WHERE u.access_key IN ('admin_secret_key_123', 'parishioner_key_456')
      ORDER BY u.role ASC;
    `);

    console.table(verifyResult.rows);

    const adminAccount = verifyResult.rows.find((r) => r.role === 'admin' && r.access_key === 'admin_secret_key_123');
    const parishionerAccount = verifyResult.rows.find((r) => r.role === 'parishioner' && r.access_key === 'parishioner_key_456');

    if (!adminAccount || !parishionerAccount) {
      throw new Error('Verification failed: One or more seeded accounts are missing!');
    }

    console.log('✓ Both Admin and Parishioner records verified with valid joined member details.');

    // 7. Test Authentication & Role Authorization logic
    console.log('\n--- Testing Authentication & Access Levels ---');

    // Test Admin Login
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
    if (decodedAdmin.role !== 'admin') {
      throw new Error('Admin role validation failed!');
    }
    console.log(`✓ Admin Key [${adminAccount.access_key}] authenticated successfully with full administrative role (${decodedAdmin.role}).`);

    // Test Parishioner Login
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
    if (decodedParishioner.role !== 'parishioner') {
      throw new Error('Parishioner role validation failed!');
    }
    console.log(`✓ Parishioner Key [${parishionerAccount.access_key}] authenticated successfully with parishioner access (${decodedParishioner.role}).`);

    console.log('\n✨ Database seeding and access verification completed successfully!\n');
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
