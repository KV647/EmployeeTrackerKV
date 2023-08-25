const inquirer = require('inquirer'); 
const express = require('express');
const mysql = require('mysql2');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employee_db'
  },
);

app.get("/", (req, res) => {
  db.promise().query("SELECT * FROM employee")
    .then(([rows]) => {
      console.log(rows);
      return res.json(rows);
    })
    .catch((error) => {
      console.log(error);
      return res.json(error);
    })
})

db.promise().connect()
  .then(() => {
    console.log(`Connected to the employee_db database.`)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err))

  db.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + db.threadId);
    afterConnection();
  });
  
  // function after connection is established and welcome image shows
  afterConnection = () => {
    console.log("***********************************");
    console.log("*                                 *");
    console.log("*          MANAGER PORTAL         *");
    console.log("*                                 *");
    console.log("***********************************");
    userPrompt();
  };

  function userPrompt() {
    const startQuestion = [{
      type: "list",
      name: "action",
      message: "what would you like to do?",
      loop: false,
      choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Delete Employee"]
    }]
    
    // view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role

    inquirer.prompt(startQuestion)
    // .then(response => {
          .then(answers => {
          const { action } = answers; 
    
          if (action === "View all departments") {
            showDepartments();
          }
          
          if (action === "View all roles") {
            showRoles();
          }
    
          if (action === "View all employees") {
            showEmployees();
          }
    
          if (action === "Add a department") {
            addDepartment();
          }
    
          if (action === "Add a role") {
            addRole();
          }
    
          if (action === "Add an employee") {
            addEmployee();
          }
    
          if (action === "Update an employee role") {
            updateEmployee();
          }

          if (action === "Delete Employee") {
            deleteEmployee();
          }
    })
    .catch(err => {
      console.error(err);
    });
  };

function showDepartments() {
      db.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        console.table(res);
        userPrompt();
    })
};
    

function showRoles() {
  db.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    userPrompt();
})
};

function showEmployees() {
  db.query("SELECT a.role_id, a.first_name, a.last_name, b.title, c.name, b.salary, a.manager_id FROM employee a JOIN role b on (a.role_id = b.id) JOIN department c on (b.department_id = c.id)", (err, res) => {
    if (err) throw err;
    console.table(res);
    userPrompt();
})
};

function addDepartment() {
  inquirer.prompt([{
      type: "input",
      name: "action",
      message: "What would you like to add?",
}])
.then(answers => {
  db.query("INSERT INTO department (name) VALUES (?)", answers.action, (err, res) => {
    if (err) throw err;
    console.table(res);
    userPrompt();
    })
  })
};

function addRole() {

const questions = [
  {
    type: "input",
    name: "title",
    message: "what is the title of the new role?"
  },
  {
    type: "input",
    name: "salary",
    message: "what is the salary of the new role?"
  },
  {
    type: "input",
    name: "department",
    message: "which department is this role in?"
  }
];

inquirer.prompt(questions)
.then(answers => {
db.query(`INSERT INTO role (title, salary, department_id) VALUES (${answers.title}, ${answers.salary}, ${answers.department})`, answers.action, (err, res) => {
  if (err) throw err;
  console.table(res);
  userPrompt();
    })
  })
};




function addEmployee() {

  const questions = [
    {
      type: "input",
      name: "first_name",
      message: "what is the first name of this employee?"
    },
    {
      type: "input",
      name: "last_name",
      message: "what is the last name of this employee?"
    },
    {
      type: "input",
      name: "role_id",
      message: "what is the role id of this employee"
    },
    {
      type: "input",
      name: "manager_id",
      message: "what is the id of the manager of this employee"
    }
  ];

inquirer.prompt(questions)
.then(answers => {
db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (${answers.first_name}, ${answers.last_name}, ${answers.role_id}, ${answers.manager_id})`, answers.action, (err, res) => {
  if (err) throw err;
  console.table(res);
  userPrompt();
    })
  })
};



updateEmployee = () => {
  db.query(`SELECT * FROM role;`, (err, res) => {
      if (err) throw err;
      let roles = res.map(role => ({name: role.title, value: role.id }));
      db.query(`SELECT * FROM employee;`, (err, res) => {
          if (err) throw err;
          let employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.role_id }));
          inquirer.prompt([
              {
                  name: 'employee',
                  type: 'list',
                  message: 'Which employee would you like to update the role for?',
                  choices: employees
              },
              {
                  name: 'newRole',
                  type: 'list',
                  message: 'What should the employee\'s new role be?',
                  choices: roles
              },
          ]).then((response) => {
              db.query(`UPDATE employee SET ? WHERE ?`, 
              [
                  {
                      role_id: response.newRole,
                  },
                  {
                      role_id: response.employee,
                  },
              ], 
              (err, res) => {
                  if (err) throw err;
                  console.log(`\n Successfully updated employee's role in the database! \n`);
                  userPrompt();
              })
          })
      })
  })
}



function deleteEmployee() {
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err; 

  const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to delete?",
        choices: employees
      }
    ])
      .then(empChoice => {
        const employee = empChoice.name;

        const sql = `DELETE FROM employee WHERE id = ?`;

        db.query(sql, employee, (err, result) => {
          if (err) throw err;
          console.log("Successfully Deleted!");
        
          showEmployees();
    });
  });
 });
};
