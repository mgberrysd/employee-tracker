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

 const inqPrompt = () => {inquirer
  .prompt([
    {
      type: 'list',
      name: 'top',
      message: 'What would you like to do?',
      choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
    },
  ])
  .then((data) => {
    if (data.top === 'View all departments') {
        const sql = `SELECT * FROM department`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            console.error({ error: err.message });
             return;
          }
          inqPrompt();
          console.log(rows)
        });
    }

    if (data.top === 'View all roles') {
        const sql = `SELECT * FROM role`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            console.error({ error: err.message });
             return;
          }
          inqPrompt();
          console.log(rows)
        });
    }

    if (data.top === 'View all employees') {
        const sql = `SELECT * FROM employee`;
  
        db.query(sql, (err, rows) => {
          if (err) {
            console.error({ error: err.message });
             return;
          }
          inqPrompt();
          console.log(rows)
        });
    }

    if (data.top === 'Add a department') {
        inquirer
            .prompt([
                {
                    type: 'input', 
                    name: 'addDepartment',
                    message: 'What is the name of the department you wish to add?',
                }
            ])
            .then((data) => {
                const sql = `INSERT INTO department (name)
                VALUES (?)`;
                
                const params = [data.addDepartment];
                db.query(sql, params, (err, rows) => {
                  if (err) {
                    console.error({ error: err.message });
                     return;
                  }
                  inqPrompt();
                  console.log(rows)
                });
            });
    }

    if (data.top === 'Add a role') {
        inquirer
            .prompt([
                {
                    type: 'input', 
                    name: 'addRoleTitle',
                    message: 'What is the title of the role you wish to add?',
                },
                {
                    type: 'input', 
                    name: 'addRoleSalary',
                    message: 'What is the salary of the role you wish to add?',
                },
                {
                    type: 'input', 
                    name: 'addRoleDepID',
                    message: 'What is the department ID of the role you wish to add?',
                },
            ])
            .then((data) => {
                const sql = `INSERT INTO role (title, salary, department_id)
                VALUES (?, ?, ?)`;
                
                const params = [data.addRoleTitle, data.addRoleSalary, data.addRoleDepID];
                db.query(sql, params, (err, rows) => {
                  if (err) {
                    console.error({ error: err.message });
                     return;
                  }
                  inqPrompt();
                  console.log(rows)
                });
            });
    }

    if (data.top === 'Add an employee') {
        inquirer
            .prompt([
                {
                    type: 'input', 
                    name: 'addFirstName',
                    message: 'What is the first name of the employee you wish to add?',
                },
                {
                    type: 'input', 
                    name: 'addLastName',
                    message: 'What is the last name of the employee you wish to add?',
                },
                {
                    type: 'input', 
                    name: 'addRoleID',
                    message: 'What is the role ID of the employee you wish to add?',
                },
                {
                    type: 'input', 
                    name: 'addManagerID',
                    message: 'What is the manager employee ID of the employee you wish to add? (enter null if no manager)',
                },
            ])
            .then((data) => {
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;
                
                const params = [data.addFirstName, data.addLastName, data.addRoleID, JSON.parse(data.addManagerID)];
                db.query(sql, params, (err, rows) => {
                  if (err) {
                    console.error({ error: err.message });
                     return;
                  }
                  inqPrompt();
                  console.log(rows)
                });
            });
    }

    if (data.top === 'Update an employee role') {

    }

  })};

inqPrompt();
// Create a movie
// app.post('/api/new-movie', ({ body }, res) => {
//   const sql = `INSERT INTO movies (movie_name)
//     VALUES (?)`;
//   const params = [body.movie_name];
  
//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({
//       message: 'success',
//       data: body
//     });
//   });
// });

// // Read all movies
// app.get('/api/movies', (req, res) => {
//   const sql = `SELECT id, movie_name AS title FROM movies`;
  
//   db.query(sql, (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//        return;
//     }
//     res.json({
//       message: 'success',
//       data: rows
//     });
//   });
// });

// // Delete a movie
// app.delete('/api/movie/:id', (req, res) => {
//   const sql = `DELETE FROM movies WHERE id = ?`;
//   const params = [req.params.id];
  
//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.statusMessage(400).json({ error: res.message });
//     } else if (!result.affectedRows) {
//       res.json({
//       message: 'Movie not found'
//       });
//     } else {
//       res.json({
//         message: 'deleted',
//         changes: result.affectedRows,
//         id: req.params.id
//       });
//     }
//   });
// });

// // Read list of all reviews and associated movie name using LEFT JOIN
// app.get('/api/movie-reviews', (req, res) => {
//   const sql = `SELECT movies.movie_name AS movie, reviews.review FROM reviews LEFT JOIN movies ON reviews.movie_id = movies.id ORDER BY movies.movie_name;`;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({
//       message: 'success',
//       data: rows
//     });
//   });
// });

// // BONUS: Update review name
// app.put('/api/review/:id', (req, res) => {
//   const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
//   const params = [req.body.review, req.params.id];

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//     } else if (!result.affectedRows) {
//       res.json({
//         message: 'Movie not found'
//       });
//     } else {
//       res.json({
//         message: 'success',
//         data: req.body,
//         changes: result.affectedRows
//       });
//     }
//   });
// });