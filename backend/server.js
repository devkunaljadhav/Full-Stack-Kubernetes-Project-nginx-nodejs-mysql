const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.get('/api/employees', (req, res) => {

  connection.query(
    'SELECT * FROM employees',
    (err, results) => {

      if (err) {
        res.status(500).send(err);
      } else {
        res.json(results);
      }
    }
  );
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});