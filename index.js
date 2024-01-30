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
      choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']
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
          console.log(rows);
          inqPrompt();
        });
    }

    if (data.top === 'View all roles') {
        const sql = `SELECT role.title, role.id AS role_id, department.name AS department, role.salary FROM role
        JOIN department ON department.id = role.department_id`;
        db.query(sql, (err, rows) => {
          if (err) {
            console.error({ error: err.message });
             return;
          }
          console.log(rows);
          inqPrompt();
        });
    }

    if (data.top === 'View all employees') {
        const sql = `SELECT A.id AS employee_id, A.first_name, A.last_name, role.title, department.name AS department, role.salary, A.manager_id AS manager, CONCAT_WS(" ", B.first_name, B.last_name) AS manager
        FROM (((employee A 
        JOIN employee B ON A.manager_id = B.id)
        JOIN role ON A.role_id = role.id)
        JOIN department ON department.id = role.department_id)`;
        db.query(sql, (err, rows) => {
          if (err) {
            console.error({ error: err.message });
             return;
          }
          console.log(rows);
          inqPrompt();
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
                  console.log(`Added new department ${data.addDepartment}`);
                  inqPrompt();
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
                  console.log(`Added new role ${data.addRoleTitle} with a salary of ${data.addRoleSalary} to department ID ${data.addRoleDepID}`);
                  inqPrompt();
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
                  console.log(`Added new employee ${data.addFirstName} ${data.addLastName}`);
                  inqPrompt();
                });
            });
    }

    if (data.top === 'Update an employee role') {
        inquirer
        .prompt([
            {
                type: 'input', 
                name: 'selectID',
                message: 'What is the ID of the employee you wish to update?',
            },
            {
                type: 'input', 
                name: 'updateRoleID',
                message: 'What is the new role ID of the employee you wish to update?',
            },
        ])
        .then((data) => {
            const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
            const params = [data.updateRoleID, data.selectID];
            db.query(sql, params, (err, rows) => {
              if (err) {
                console.error({ error: err.message });
                 return;
              }
              console.log(`Updated employee ${data.selectID} to role ID ${data.updateRoleID}`);
              inqPrompt();
            });
        });
    }

    if (data.top === 'Quit') {
        process.exit()
    }

  })};

inqPrompt();