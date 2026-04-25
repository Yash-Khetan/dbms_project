import 'dotenv/config';
import postgres from 'postgres';

async function createDatabase() {
  const client = postgres({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: 'postgres', // Connect to default db
  });

  try {
    const dbs = await client`SELECT datname FROM pg_database WHERE datname = ${process.env.DB_NAME!}`;
    if (dbs.length === 0) {
      console.log(`Creating database ${process.env.DB_NAME!}...`);
      await client.unsafe(`CREATE DATABASE ${process.env.DB_NAME!}`);
      console.log('Database created successfully.');
    } else {
      console.log('Database already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

createDatabase();
