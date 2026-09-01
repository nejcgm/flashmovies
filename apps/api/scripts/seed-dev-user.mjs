import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const DEV_USERS = [
  {
    email: process.env.SEED_USER_EMAIL ?? 'test@flashmovies.local',
    password: process.env.SEED_USER_PASSWORD ?? 'password123',
    displayName: process.env.SEED_USER_DISPLAY_NAME ?? 'Test User',
    role: 'user',
  },
  {
    email: process.env.SEED_PRO_USER_EMAIL ?? 'pro@flashmovies.local',
    password: process.env.SEED_PRO_USER_PASSWORD ?? 'password123',
    displayName: process.env.SEED_PRO_USER_DISPLAY_NAME ?? 'Pro Test User',
    role: 'pro',
  },
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in apps/api/.env or pass via --env-file=.env`);
  }
  return value;
}

async function getLookupId(client, category, code) {
  const result = await client.query(
    `SELECT id FROM lookup_values WHERE category = $1 AND code = $2`,
    [category, code],
  );
  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error(`lookup_values row not found: ${category}/${code}. Run DB migrations first.`);
  }
  return id;
}

async function upsertDevUser(client, { email, password, displayName, role }) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const roleId = await getLookupId(client, 'user_role', role);
  const statusId = await getLookupId(client, 'user_status', 'active');

  const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [
    normalizedEmail,
  ]);

  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id;
    await client.query(
      `UPDATE users
       SET password_hash = $1, display_name = $2, role_id = $3, status_id = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [passwordHash, displayName, roleId, statusId, userId],
    );
    return { id: userId, email: normalizedEmail, role, action: 'updated' };
  }

  const inserted = await client.query(
    `INSERT INTO users (email, password_hash, display_name, role_id, status_id, email_verified)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING id`,
    [normalizedEmail, passwordHash, displayName, roleId, statusId],
  );

  return {
    id: inserted.rows[0].id,
    email: normalizedEmail,
    role,
    action: 'created',
  };
}

async function main() {
  const pool = new Pool({
    host: requiredEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    database: requiredEnv('DB_NAME'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
  });

  const client = await pool.connect();

  try {
    console.log('Seeding local dev users...\n');

    for (const user of DEV_USERS) {
      const result = await upsertDevUser(client, user);
      console.log(
        `[${result.action}] ${result.email} (id=${result.id}, role=${result.role})`,
      );
    }

    console.log('\nLogin credentials:');
    for (const user of DEV_USERS) {
      console.log(`  ${user.email} / ${user.password}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
