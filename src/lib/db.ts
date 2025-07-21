import mysql from 'mysql2/promise';

// This function creates and manages the database connection pool.
// It uses environment variables for configuration, which are provided by docker-compose.yml.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// A simple query function to execute SQL queries.
export async function query<T extends mysql.RowDataPacket[] | mysql.ResultSetHeader>(
  sql: string,
  params?: any[]
): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}
