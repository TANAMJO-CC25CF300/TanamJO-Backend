const { pool } = require('./src/config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB connection error:', err);
  } else {
    console.log('✅ DB connected at:', res.rows[0]);
  }
  pool.end();
});
