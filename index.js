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
            if (data.top === 'View all departments') {
                const sql = `SELECT * FROM department`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error({ error: err.message });
                        return;
                    }
                    console.table(rows);
                    inqPrompt();
                });
            }

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

                    // const transformed = rows.reduce((acc, { employee_id, ...x }) => { acc[employee_id] = x; return acc }, {})

                    // console.table(transformed);{columns: ['employee_id', 'first_name', 'last_name', 'title', 'department', 'salary', 'manager']}, 
                    console.log(rows);
                    console.table(rows);
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
                            console.log(rows);
                            const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                            const params = [data.addRoleTitle, data.addRoleSalary, rows[0].id];
                            db.query(sql, params, (err, rows) => {
                                if (err) {
                                    console.error({ error: err.message });
                                    return;
                                }
                                console.log(`Added new role ${data.addRoleTitle} with a salary of ${data.addRoleSalary} to department ${data.addRoleDepID}`);
                                inqPrompt();
                            });
                        });
                    });
            }

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
                            }
                            else {
                                const sqladdManagerID = `SELECT id FROM employee WHERE CONCAT_WS(" ", employee.first_name, employee.last_name) = '${data.addManagerID}'`;
                                db.query(sqladdManagerID, (err, rows) => {
                                    if (err) {
                                        console.error({ error: err.message });
                                        return;
                                    }
                                    managerID = rows[0].id;
                                })
                            };


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

                        });


                    });
            }

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
                                    console.log(rows)
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

            if (data.top === 'Quit') {
                process.exit()
            }

        })
};

inqPrompt();