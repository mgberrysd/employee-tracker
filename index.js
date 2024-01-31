// This hw turned out to be way more work than I was expecting as using the db to populate inquirer then get the associated id for that text meant there were a lot of db queries
// In hindsight I would have put each code block into a function and modularized it if I had the time, was way to far along to easily change it

// Requires inquirer for the command line prompts and mysql for the integration with sql
const inquirer = require('inquirer');
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

// Inquirer is wrapped in a function that is called on load
// Function is used to allow for recursion after selecting an option
const inqPrompt = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'top',
                message: 'What would you like to do?',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']
            },
        ])
        .then((data) => {

            // Used if to check selections, enters code blocks that runs a specific sql query

            // View all departments returns a select query
            if (data.top === 'View all departments') {
                const sql = `SELECT * FROM department`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    // Used console.table to return a formatted table
                    // Returns an extra index column
                    // Alternatives require additional npm packages or extra JS, really wasn't worth the time otherwise
                    console.table(rows);
                    inqPrompt();
                });
            }

            // View all roles returns a combined table for roles and departments
            if (data.top === 'View all roles') {
                const sql = `SELECT role.title, role.id AS role_id, department.name AS department, role.salary FROM role JOIN department ON department.id = role.department_id`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    console.table(rows);
                    inqPrompt();
                });
            }

            // View all employees returns a combined table with elements from all 3 tables
            // Self join on employee table for manager, join on employee and role for role title, and join on role and department for department name
            if (data.top === 'View all employees') {
                const sql = `SELECT A.id AS employee_id, A.first_name, A.last_name, role.title, department.name AS department, role.salary, A.manager_id AS manager, CONCAT(B.first_name, " ", B.last_name) AS manager
        FROM (((employee A 
        LEFT JOIN employee B ON A.manager_id = B.id)
        JOIN role ON A.role_id = role.id)
        JOIN department ON department.id = role.department_id)`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    console.table(rows);
                    inqPrompt();
                });
            }

            // Add a department is a simple text input into the deparment table
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
                        const sql = `INSERT INTO department (name) VALUES (?)`;
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

            // Add a role is more complex
            // Queries the department table to provide options for which department to add the role to
            // After selection another query is done on the dpertments is done to get the department id of the selection
            // If inquirer has a way to retain the value of a name/value pair when passing an object as an option I couldn't find it
            // The insert query was nested in the select query due to the async nature of .query
            if (data.top === 'Add a role') {
                const departments = [];
                const sql = `SELECT * FROM department`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        departments.push(rows[i]);
                    }
                });
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
                            type: 'list',
                            name: 'addRoleDepID',
                            message: 'Which department do you want to add this role to?',
                            choices: departments,
                        },
                    ])
                    .then((data) => {
                        const sql = `SELECT id FROM department WHERE department.name = ?`;
                        const params = [data.addRoleDepID];
                        db.query(sql, params, (err, rows) => {
                            if (err) {
                                console.error({ error: err.message });
                                return;
                            }
                            const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                            const params = [data.addRoleTitle, data.addRoleSalary, rows[0].id];
                            db.query(sql, params, (err, rows) => {
                                if (err) {
                                    console.error({ error: err.message });
                                    return;
                                }
                                console.log(`Added new role ${data.addRoleTitle} with a salary of ${data.addRoleSalary} to ${data.addRoleDepID}`);
                                inqPrompt();
                            });
                        });
                    });
            }

            // Add an employee is even more complex
            // Queries for both roles and potential managers as options
            // Again the last insert is nested inside the select so that the ids are populated first
            if (data.top === 'Add an employee') {
                const roles = [];
                const sqlRoles = `SELECT title FROM role`;
                db.query(sqlRoles, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        roles.push(rows[i].title);
                    }
                });
                const managers = [];
                const sqlManagers = `SELECT CONCAT_WS(" ", employee.first_name, employee.last_name) AS manager FROM employee`;
                db.query(sqlManagers, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        managers.push(rows[i].manager);
                    }
                    managers.push('None')
                });
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
                            type: 'list',
                            name: 'addRoleID',
                            message: 'What is the role of the employee?',
                            choices: roles,
                        },
                        {
                            type: 'list',
                            name: 'addManagerID',
                            message: 'Who is the manager of the employee you wish to add? (enter None if no manager)',
                            choices: managers,
                        },
                    ])
                    .then((data) => {
                        const sqladdRoleID = `SELECT id FROM role where role.title = '${data.addRoleID}'`;
                        db.query(sqladdRoleID, (err, rows) => {
                            if (err) {
                                console.error({ error: err.message });
                                return;
                            }
                            const roleID = rows[0].id;

                            let managerID;

                            if (data.addManagerID === 'None') {
                                managerID = null;
                                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                                const params = [data.addFirstName, data.addLastName, roleID, managerID];
                                db.query(sql, params, (err, rows) => {
                                    if (err) {
                                        console.error({ error: err.message });
                                        return;
                                    }
                                    console.log(`Added new employee ${data.addFirstName} ${data.addLastName}`);
                                    inqPrompt();
                                });
                            }
                            else {
                                const sqladdManagerID = `SELECT id FROM employee WHERE CONCAT_WS(" ", employee.first_name, employee.last_name) = '${data.addManagerID}'`;
                                db.query(sqladdManagerID, (err, rows) => {
                                    if (err) {
                                        console.error({ error: err.message });
                                        return;
                                    }
                                    managerID = rows[0].id;
                                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                                    const params = [data.addFirstName, data.addLastName, roleID, managerID];
                                    db.query(sql, params, (err, rows) => {
                                        if (err) {
                                            console.error({ error: err.message });
                                            return;
                                        }
                                        console.log(`Added new employee ${data.addFirstName} ${data.addLastName}`);
                                        inqPrompt();
                                    });
                                })
                            };
                        });
                    });
            }

            // Update employee role is similar to add an employee in that options are from the dbs
            // had to nest the entire inquirer prompt inside the second db query
            // .query is async and would display the questions with no inputs otherwise
            if (data.top === 'Update an employee role') {
                const roles = [];
                const sqlRoles = `SELECT title FROM role`;
                db.query(sqlRoles, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        roles.push(rows[i].title);
                    }
                });

                const employees = [];
                const sqlEmployees = `SELECT CONCAT_WS(" ", employee.first_name, employee.last_name) AS name FROM employee`;
                db.query(sqlEmployees, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        employees.push(rows[i]);
                    }

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'selectID',
                                message: `Which employee's role do you wish to update?`,
                                choices: employees,
                            },
                            {
                                type: 'list',
                                name: 'updateRoleID',
                                message: 'What is the new role of this employee?',
                                choices: roles,
                            },
                        ])
                        .then((data) => {
                            const sqladdEmployeeID = `SELECT id FROM employee WHERE CONCAT_WS(" ", employee.first_name, employee.last_name) = '${data.selectID}'`;
                            db.query(sqladdEmployeeID, (err, rows) => {
                                if (err) {
                                    console.error({ error: err.message });
                                    return;
                                }
                                const employeeID = rows[0].id;

                                const sqladdRoleID = `SELECT id FROM role WHERE role.title = '${data.updateRoleID}'`;
                                db.query(sqladdRoleID, (err, rows) => {
                                    if (err) {
                                        console.error({ error: err.message });
                                        return;
                                    }
                                    const roleID = rows[0].id;

                                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                                    const params = [roleID, employeeID];
                                    db.query(sql, params, (err, rows) => {
                                        if (err) {
                                            console.error({ error: err.message });
                                            return;
                                        }
                                        console.log(`Updated employee ${data.selectID}'s role to ${data.updateRoleID}`);
                                        inqPrompt();
                                    });
                                });
                            });
                        });
                });
            }
            // Exits the cli if quit is selected
            if (data.top === 'Quit') {
                process.exit()
            }
        })
};

inqPrompt();