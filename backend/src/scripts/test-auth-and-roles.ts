import { pool } from '../config/db';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 VERIFICATION AND TESTING SUITE');
  console.log('========================================================\n');

  // Test 1: Query app_users joined with members
  console.log('Test 1: SQL Join Query between app_users and members...');
  const joinResult = await pool.query(`
    SELECT u.id, u.member_id, u.access_key, u.role,
           m.first_name, m.last_name, m.email, m.phone_number
    FROM app_users u
    JOIN members m ON u.member_id = m.id
    WHERE u.access_key IN ('admin_secret_key_123', 'parishioner_key_456')
    ORDER BY u.role ASC;
  `);

  if (joinResult.rows.length < 2) {
    throw new Error(`Expected at least 2 records from JOIN query, found ${joinResult.rows.length}`);
  }
  console.log('✓ Found records:');
  console.table(joinResult.rows);

  const adminRow = joinResult.rows.find((r) => r.role === 'admin' && r.access_key === 'admin_secret_key_123');
  const parishionerRow = joinResult.rows.find((r) => r.role === 'parishioner' && r.access_key === 'parishioner_key_456');

  if (!adminRow || !adminRow.first_name) {
    throw new Error('Admin user row missing valid member details!');
  }
  if (!parishionerRow || !parishionerRow.first_name) {
    throw new Error('Parishioner user row missing valid member details!');
  }
  console.log('✓ Verified: Both records exist and reference valid member details.\n');

  // Test 2: Admin Dashboard login with admin_secret_key_123
  console.log('Test 2: Logging in with Admin Key ("admin_secret_key_123")...');
  const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
    accessKey: 'admin_secret_key_123',
  });

  if (adminLoginRes.status !== 200 || !adminLoginRes.data.token) {
    throw new Error('Admin login failed: No token returned');
  }
  if (adminLoginRes.data.user.role !== 'admin') {
    throw new Error(`Expected admin role, got: ${adminLoginRes.data.user.role}`);
  }
  const adminToken = adminLoginRes.data.token;
  console.log('✓ Admin login succeeded. Received valid JWT and admin role.');

  // Verify full administrative access using adminToken
  console.log('Verifying full administrative access with admin token on protected route /api/admin/users...');
  const adminAccessRes = await axios.get(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (adminAccessRes.status !== 200 || !Array.isArray(adminAccessRes.data)) {
    throw new Error('Failed to access protected admin endpoint with admin token');
  }
  console.log(`✓ Admin access granted. Retrieved ${adminAccessRes.data.length} registered users.\n`);

  // Test 3: Frontend PWA login with parishioner_key_456
  console.log('Test 3: Logging in with Parishioner Key ("parishioner_key_456")...');
  const parishionerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
    access_key: 'parishioner_key_456',
  });

  if (parishionerLoginRes.status !== 200 || !parishionerLoginRes.data.token) {
    throw new Error('Parishioner login failed: No token returned');
  }
  if (parishionerLoginRes.data.user.role !== 'parishioner') {
    throw new Error(`Expected parishioner role, got: ${parishionerLoginRes.data.user.role}`);
  }
  const parishionerToken = parishionerLoginRes.data.token;
  console.log('✓ Parishioner login succeeded. Received valid JWT and parishioner role.');

  // Verify parishioner can access parish data (Directory, Feasts, Announcements)
  console.log('Verifying parishioner access to parish directory (/api/directory/search)...');
  const directoryRes = await axios.get(`${BASE_URL}/directory/search`, {
    headers: { Authorization: `Bearer ${parishionerToken}` },
  });
  console.log(`✓ Parishioner directory access succeeded. (Status ${directoryRes.status})`);

  // Verify parishioner is denied access to admin endpoints (403 Forbidden)
  console.log('Verifying parishioner is restricted from administrative portal endpoints (/api/admin/users)...');
  try {
    await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${parishionerToken}` },
    });
    throw new Error('Security Breach: Parishioner was unexpectedly granted admin access!');
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      console.log('✓ Parishioner access correctly restricted with 403 Forbidden on admin endpoint.');
    } else {
      throw err;
    }
  }

  // Test 4: Also test compatibility with legacy seeded keys
  console.log('\nTest 4: Verifying legacy keys (access_key_admin_123 & access_key_user_456)...');
  const legacyAdminRes = await axios.post(`${BASE_URL}/auth/login`, { accessKey: 'access_key_admin_123' });
  const legacyUserRes = await axios.post(`${BASE_URL}/auth/login`, { accessKey: 'access_key_user_456' });
  if (legacyAdminRes.data.user.role === 'admin' && legacyUserRes.data.user.role === 'parishioner') {
    console.log('✓ Legacy keys remain fully compatible and functional.');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('========================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
