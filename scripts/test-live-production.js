/**
 * Live Production Diagnostic Suite
 * parish-management-system
 * 
 * Verifies live deployed production environment:
 * - Admin Dashboard (Vercel)
 * - Parishioner PWA (Vercel)
 * - Backend API (Render)
 * - Database & Relational Sync (PostgreSQL / Neon)
 * - Authentication & RBAC Isolation
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { Pool } = require('pg');

const TARGETS = {
  adminDashboard: 'https://parish-management-system-rouge.vercel.app',
  parishionerPwa: 'https://parish-management-system-frontend.vercel.app',
  liveApi: 'https://parish-api-57rx.onrender.com/api',
};

// Allow CLI argument or environment variable override
const cliDbUrl = process.argv[2];
const DATABASE_URL = cliDbUrl || process.env.DATABASE_URL || 'postgresql://parish_user:parish_password@localhost:5432/parish_db';

const results = [];

function recordResult(category, testName, passed, details = '') {
  results.push({
    category,
    test: testName,
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
}

async function runDiagnostics() {
  console.log('='.repeat(80));
  console.log('       LIVE PRODUCTION END-TO-END DIAGNOSTIC SUITE');
  console.log('='.repeat(80));
  console.log(`Timestamp:        ${new Date().toISOString()}`);
  console.log(`Backend API:      ${TARGETS.liveApi}`);
  console.log(`Admin Dashboard:  ${TARGETS.adminDashboard}`);
  console.log(`Parishioner PWA:  ${TARGETS.parishionerPwa}`);
  console.log(`DB Connection:    ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
  console.log('='.repeat(80));
  console.log('\nRunning diagnostics...\n');

  let adminToken = null;
  let parishionerToken = null;
  let createdWardId = null;
  let pgPool = null;
  let dbAvailable = false;

  // Initialize DB Pool
  try {
    const isLocalhost = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    dbAvailable = true;
  } catch (err) {
    dbAvailable = false;
    // Log helpful diagnostic on DB connection failure
  }

  // -------------------------------------------------------------
  // Task 1.a: Backend Availability & CORS
  // -------------------------------------------------------------
  console.log('--- [1/4] Testing Backend Availability, CORS & Frontend Deployments ---');

  // 1.a.1 Health Endpoint
  try {
    const healthRes = await fetch(`${TARGETS.liveApi}/health`);
    const healthJson = await healthRes.json().catch(() => ({}));
    const ok = healthRes.status === 200 && healthJson.status === 'ok';
    recordResult(
      'Availability',
      'GET /api/health returns 200 OK',
      ok,
      `Status: ${healthRes.status}, Uptime: ${healthJson.uptime ? Math.round(healthJson.uptime) + 's' : 'N/A'}`
    );
  } catch (err) {
    recordResult('Availability', 'GET /api/health returns 200 OK', false, err.message);
  }

  // 1.a.2 CORS for Admin Dashboard
  try {
    const corsAdmin = await fetch(`${TARGETS.liveApi}/health`, {
      method: 'GET',
      headers: { Origin: TARGETS.adminDashboard },
    });
    const allowOrigin = corsAdmin.headers.get('access-control-allow-origin');
    const ok = allowOrigin === TARGETS.adminDashboard || allowOrigin === '*';
    recordResult(
      'CORS',
      'Allow Origin for Admin Dashboard',
      ok,
      `Access-Control-Allow-Origin: ${allowOrigin}`
    );
  } catch (err) {
    recordResult('CORS', 'Allow Origin for Admin Dashboard', false, err.message);
  }

  // 1.a.3 CORS for Parishioner PWA
  try {
    const corsPwa = await fetch(`${TARGETS.liveApi}/health`, {
      method: 'GET',
      headers: { Origin: TARGETS.parishionerPwa },
    });
    const allowOrigin = corsPwa.headers.get('access-control-allow-origin');
    const ok = allowOrigin === TARGETS.parishionerPwa || allowOrigin === '*';
    recordResult(
      'CORS',
      'Allow Origin for Parishioner PWA',
      ok,
      `Access-Control-Allow-Origin: ${allowOrigin}`
    );
  } catch (err) {
    recordResult('CORS', 'Allow Origin for Parishioner PWA', false, err.message);
  }

  // 1.a.4 Admin Dashboard Web App Reachability
  try {
    const adminWebRes = await fetch(TARGETS.adminDashboard);
    recordResult(
      'Frontend',
      'Admin Dashboard Vercel Deployment',
      adminWebRes.status === 200,
      `Status: ${adminWebRes.status}`
    );
  } catch (err) {
    recordResult('Frontend', 'Admin Dashboard Vercel Deployment', false, err.message);
  }

  // 1.a.5 Parishioner PWA Web App Reachability
  try {
    const pwaWebRes = await fetch(TARGETS.parishionerPwa);
    recordResult(
      'Frontend',
      'Parishioner PWA Vercel Deployment',
      pwaWebRes.status === 200,
      `Status: ${pwaWebRes.status}`
    );
  } catch (err) {
    recordResult('Frontend', 'Parishioner PWA Vercel Deployment', false, err.message);
  }

  // -------------------------------------------------------------
  // Task 1.b: Authentication Flow
  // -------------------------------------------------------------
  console.log('--- [2/4] Testing Authentication Flow & Roles ---');

  // 1.b.1 Admin Login
  try {
    const res = await fetch(`${TARGETS.liveApi}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: 'admin123' }),
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.status === 200 && !!data.token && data.user?.role === 'admin';
    if (ok) adminToken = data.token;
    recordResult(
      'Auth Flow',
      'Admin Login ("admin123")',
      ok,
      `Status: ${res.status}, Role: ${data.user?.role || 'none'}, JWT extracted`
    );
  } catch (err) {
    recordResult('Auth Flow', 'Admin Login ("admin123")', false, err.message);
  }

  // 1.b.2 Parishioner Login
  try {
    const res = await fetch(`${TARGETS.liveApi}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: 'user123' }),
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.status === 200 && !!data.token && data.user?.role === 'parishioner';
    if (ok) parishionerToken = data.token;
    recordResult(
      'Auth Flow',
      'Parishioner Login ("user123")',
      ok,
      `Status: ${res.status}, Role: ${data.user?.role || 'none'}, JWT extracted`
    );
  } catch (err) {
    recordResult('Auth Flow', 'Parishioner Login ("user123")', false, err.message);
  }

  // 1.b.3 Invalid Key Rejection
  try {
    const res = await fetch(`${TARGETS.liveApi}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: 'test_invalid_999' }),
    });
    recordResult(
      'Auth Flow',
      'Invalid Access Key ("test_invalid_999")',
      res.status === 401,
      `Status: ${res.status} (Expected 401)`
    );
  } catch (err) {
    recordResult('Auth Flow', 'Invalid Access Key ("test_invalid_999")', false, err.message);
  }

  // -------------------------------------------------------------
  // Task 1.c: Database Mutation & Live API Sync
  // -------------------------------------------------------------
  console.log('--- [3/4] Testing Database Mutation & Live API Sync ---');

  // 1.c.1 Insert Temporary Ward via Admin JWT
  try {
    if (!adminToken) throw new Error('Admin JWT not available');

    const wardPayload = {
      name: 'Live Diagnostic Ward',
      wardName: 'Live Diagnostic Ward',
      number: 999,
      wardNumber: 999,
    };

    // Try /api/wards first, fallback to /api/admin/wards
    let postRes = await fetch(`${TARGETS.liveApi}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(wardPayload),
    });

    let endpointUsed = '/api/wards';
    if (postRes.status === 404) {
      endpointUsed = '/api/admin/wards';
      postRes = await fetch(`${TARGETS.liveApi}/admin/wards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(wardPayload),
      });
    }

    const postData = await postRes.json().catch(() => ({}));
    const ok = (postRes.status === 201 || postRes.status === 200) && !!(postData.id || postData._id);
    if (ok) {
      createdWardId = postData.id || postData._id;
    }

    recordResult(
      'DB & Sync',
      'POST Ward: "Live Diagnostic Ward" (#999)',
      ok,
      `Status: ${postRes.status} on ${endpointUsed}, Created ID: ${createdWardId || 'N/A'}`
    );
  } catch (err) {
    recordResult('DB & Sync', 'POST Ward: "Live Diagnostic Ward" (#999)', false, err.message);
  }

  // 1.c.2 Verify row directly in PostgreSQL (Neon)
  if (dbAvailable) {
    try {
      const res = await pgPool.query('SELECT id, ward_name, ward_number FROM wards WHERE ward_number = 999');
      const found = res.rows.length > 0;
      recordResult(
        'DB & Sync',
        'Direct DB Query: Temporary Ward Written to Disk',
        found,
        found
          ? `Verified row in DB: ID ${res.rows[0].id}, Name "${res.rows[0].ward_name}"`
          : 'Row not found in direct database query'
      );
    } catch (err) {
      recordResult('DB & Sync', 'Direct DB Query: Temporary Ward Written to Disk', false, err.message);
    }
  } else {
    const isLocalhost = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');
    const msg = isLocalhost
      ? `backend/.env has local URL (${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}). Update DATABASE_URL with live Neon connection string to enable direct disk verification.`
      : 'Could not connect directly to database';
    recordResult('DB & Sync', 'Direct DB Query: Temporary Ward Written to Disk', false, msg);
  }

  // 1.c.3 Call GET /api/wards via Live API to confirm immediate sync
  try {
    const wardsRes = await fetch(`${TARGETS.liveApi}/wards`);
    const wards = await wardsRes.json().catch(() => []);
    const found = Array.isArray(wards) && wards.some(
      (w) => (w.ward_number === 999 || w.wardNumber === 999) && (w.ward_name === 'Live Diagnostic Ward' || w.wardName === 'Live Diagnostic Ward')
    );
    recordResult(
      'DB & Sync',
      'Live API Sync: GET /api/wards contains new ward',
      found,
      found ? `Found created ward in live API list (${wards.length} total wards)` : `Ward not found in live API list (${wards.length} total)`
    );
  } catch (err) {
    recordResult('DB & Sync', 'Live API Sync: GET /api/wards contains new ward', false, err.message);
  }

  // 1.c.4 Delete temporary ward via admin JWT
  try {
    if (!adminToken) throw new Error('Admin JWT not available');
    if (!createdWardId) throw new Error('Temporary ward ID not available for deletion');

    let delRes = await fetch(`${TARGETS.liveApi}/wards/${createdWardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    let delEndpoint = `/api/wards/${createdWardId}`;
    if (delRes.status === 404) {
      delEndpoint = `/api/admin/wards/${createdWardId}`;
      delRes = await fetch(`${TARGETS.liveApi}/admin/wards/${createdWardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }

    const ok = delRes.status === 200 || delRes.status === 204;
    recordResult(
      'DB & Sync',
      'DELETE Ward via Admin JWT',
      ok,
      `Status: ${delRes.status} on ${delEndpoint}`
    );
  } catch (err) {
    recordResult('DB & Sync', 'DELETE Ward via Admin JWT', false, err.message);
  }

  // 1.c.5 Verify temporary record was deleted cleanly in PostgreSQL (Neon)
  if (dbAvailable) {
    try {
      const res = await pgPool.query('SELECT id, ward_name, ward_number FROM wards WHERE ward_number = 999');
      const clean = res.rows.length === 0;
      recordResult(
        'DB & Sync',
        'Direct DB Query: Clean Deletion from Disk',
        clean,
        clean ? '0 rows found with ward_number = 999' : `${res.rows.length} rows still exist in database`
      );
    } catch (err) {
      recordResult('DB & Sync', 'Direct DB Query: Clean Deletion from Disk', false, err.message);
    }
  } else {
    const isLocalhost = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');
    const msg = isLocalhost
      ? `backend/.env has local URL (${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}). Update DATABASE_URL with live Neon connection string.`
      : 'Could not connect directly to database';
    recordResult('DB & Sync', 'Direct DB Query: Clean Deletion from Disk', false, msg);
  }

  // -------------------------------------------------------------
  // Task 1.d: Data & User Isolation
  // -------------------------------------------------------------
  console.log('--- [4/4] Testing Data & User Isolation ---');

  // 1.d.1 Assert ONLY the 2 authorized users exist in GET /api/admin/users
  try {
    if (!adminToken) throw new Error('Admin JWT not available');

    const usersRes = await fetch(`${TARGETS.liveApi}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const users = await usersRes.json().catch(() => []);

    const isArray = Array.isArray(users);
    const hasAdmin = isArray && users.some((u) => u.access_key === 'admin123' && u.role === 'admin');
    const hasParishioner = isArray && users.some((u) => u.access_key === 'user123' && u.role === 'parishioner');
    const strictlyTwo = isArray && users.length === 2;

    const ok = usersRes.status === 200 && strictlyTwo && hasAdmin && hasParishioner;
    recordResult(
      'Isolation',
      'Admin Users: Exactly 2 Authorized Accounts',
      ok,
      `Status: ${usersRes.status}, Total accounts: ${users.length} (admin123: ${hasAdmin}, user123: ${hasParishioner})`
    );
  } catch (err) {
    recordResult('Isolation', 'Admin Users: Exactly 2 Authorized Accounts', false, err.message);
  }

  // 1.d.2 Directory View Loads & Credentials are NOT Exposed
  try {
    if (!parishionerToken) throw new Error('Parishioner JWT not available');

    // Test /api/directory, fallback to /api/directory/search if needed
    let dirRes = await fetch(`${TARGETS.liveApi}/directory`, {
      headers: { Authorization: `Bearer ${parishionerToken}` },
    });

    let dirEndpoint = '/api/directory';
    if (dirRes.status === 404) {
      dirEndpoint = '/api/directory/search';
      dirRes = await fetch(`${TARGETS.liveApi}/directory/search`, {
        headers: { Authorization: `Bearer ${parishionerToken}` },
      });
    }

    const dirData = await dirRes.json().catch(() => null);
    const loadsOk = dirRes.status === 200 && dirData !== null;

    // Check that admin credentials / private access keys are NOT exposed
    const dataString = JSON.stringify(dirData || {});
    const adminKeyExposed = dataString.includes('admin123');
    const parishionerKeyExposed = dataString.includes('user123');
    const passwordExposed = /password|hash|secret/i.test(dataString);
    const noCredentialsLeaked = !adminKeyExposed && !parishionerKeyExposed && !passwordExposed;

    const ok = loadsOk && noCredentialsLeaked;
    recordResult(
      'Isolation',
      'Parishioner Directory: Credentials Not Exposed',
      ok,
      `Loaded from ${dirEndpoint} (${dirRes.status}). Admin key leaked: ${adminKeyExposed}, User key leaked: ${parishionerKeyExposed}, Secret leaked: ${passwordExposed}`
    );
  } catch (err) {
    recordResult('Isolation', 'Parishioner Directory: Credentials Not Exposed', false, err.message);
  }

  // Cleanup Pool
  if (pgPool) {
    await pgPool.end().catch(() => {});
  }

  // -------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------
  console.log('\n' + '='.repeat(80));
  console.log('                          DIAGNOSTIC SUMMARY TABLE');
  console.log('='.repeat(80));

  const pad = (str, len) => {
    const s = (str || '').toString();
    if (s.length > len) return s.slice(0, len - 3) + '...';
    return s.padEnd(len);
  };

  const colWidths = { status: 8, cat: 14, test: 45, details: 70 };
  const border = '+' + '-'.repeat(colWidths.status + 2) + '+' + '-'.repeat(colWidths.cat + 2) + '+' + '-'.repeat(colWidths.test + 2) + '+' + '-'.repeat(colWidths.details + 2) + '+';

  console.log(border);
  console.log(
    `| ${pad('STATUS', colWidths.status)} | ${pad('CATEGORY', colWidths.cat)} | ${pad('TEST NAME', colWidths.test)} | ${pad('DETAILS', colWidths.details)} |`
  );
  console.log(border);

  let passedCount = 0;
  for (const r of results) {
    if (r.status === 'PASS') passedCount++;
    const icon = r.status === 'PASS' ? ' PASS ' : ' FAIL ';
    console.log(
      `| ${pad(icon, colWidths.status)} | ${pad(r.category, colWidths.cat)} | ${pad(r.test, colWidths.test)} | ${pad(r.details, colWidths.details)} |`
    );
  }
  console.log(border);

  console.log('='.repeat(80));
  console.log(`TOTAL TESTS:  ${results.length}`);
  console.log(`PASSED:       ${passedCount}`);
  console.log(`FAILED:       ${results.length - passedCount}`);
  console.log(`OVERALL:      ${passedCount === results.length ? 'ALL SYSTEMS OPERATIONAL (PASS)' : 'DIAGNOSTICS COMPLETED WITH ISSUES'}`);
  console.log('='.repeat(80) + '\n');
}

runDiagnostics().catch((err) => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
