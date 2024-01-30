const inquirer = require('inquirer')
const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'password12345',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

inquirer
  .prompt([

    {
      type: 'list',
      name: 'top',
      message: 'What would you like to do?',
      choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
    },
  ])
  .then((data) => {
    if (data === 'View all departments') {
        const sql = `SELECT * FROM department`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            res.json({ error: err.message });
             return;
          }
          res.json({
            message: 'success',
            data: rows
          });
        });
    }

    if (data === 'View all roles') {
        const sql = `SELECT * FROM role`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            res.json({ error: err.message });
             return;
          }
          res.json({
            message: 'success',
            data: rows
          });
        });
    }

    if (data === 'View all employees') {
        const sql = `SELECT * FROM employee`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            res.json({ error: err.message });
             return;
          }
          res.json({
            message: 'success',
            data: rows
          });
        });
    }

    
  });


// Create a movie
app.post('/api/new-movie', ({ body }, res) => {
  const sql = `INSERT INTO movies (movie_name)
    VALUES (?)`;
  const params = [body.movie_name];
  
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: body
    });
  });
});

// Read all movies
app.get('/api/movies', (req, res) => {
  const sql = `SELECT id, movie_name AS title FROM movies`;
  
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
       return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Delete a movie
app.delete('/api/movie/:id', (req, res) => {
  const sql = `DELETE FROM movies WHERE id = ?`;
  const params = [req.params.id];
  
  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
      message: 'Movie not found'
      });
    } else {
      res.json({
        message: 'deleted',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});

// Read list of all reviews and associated movie name using LEFT JOIN
app.get('/api/movie-reviews', (req, res) => {
  const sql = `SELECT movies.movie_name AS movie, reviews.review FROM reviews LEFT JOIN movies ON reviews.movie_id = movies.id ORDER BY movies.movie_name;`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// BONUS: Update review name
app.put('/api/review/:id', (req, res) => {
  const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
  const params = [req.body.review, req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.affectedRows) {
      res.json({
        message: 'Movie not found'
      });
    } else {
      res.json({
        message: 'success',
        data: req.body,
        changes: result.affectedRows
      });
    }
  });
});