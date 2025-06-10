const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db.qnsqgsrxnwiktjnhjnld.supabase.co',
  database: 'postgres',
  password: '5OvQoyBS4PrOyXlo',
  port: 5432, // atau port lain sesuai konfigurasi Supabase kamu
});

module.exports = { pool };
