const mysql = require("mysql");
const inquirer = require("inquirer");
const columnify = require('columnify')
require("dotenv").config();

// Create Product Object
const Product = function (id, name, department, price, stock) {
  this.id = id;
  this.name = name;
  this.department = department;
  this.price = price;
  this.stock = stock;
}

const db = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: process.env.password,

  database: "bamazon"
});

// Connects to the database and starts app
db.connect(function (err) {
  if (err) throw err;

  start();
});

// Function to start app and display all items

function start() {
  const itemArray = [];
  db.query("SELECT * FROM products", function (err, result) {
    for (let i = 0; i < result.length; i++) {
      itemArray.push(new Product(
        result[i].item_id,
        result[i].product_name,
        result[i].department_name,
        result[i].price,
        result[i].stock_quantity));
    }
    // Create and Display Columns
    console.log("===================================================");
    var columns = columnify(itemArray, {
      columns: ['id', 'name', 'department', 'price', 'stock']
    })
    console.log(columns);
    console.log("===================================================");
    if (err) throw err;
    beginPrompt();
  })
}

function beginPrompt(){
  inquirer.prompt([
    {
    name: "command",
    type: "list",
    choices: ["View Items for Sale", "View Low Inventory", "Add Inventory", "Add Item", "Exit"],
    message: "What would you like to do"
    }
  ]).then(function (answer) {
    command = answer.command;
    if(command === "View Items for Sale"){
      start();
    }
    else if(command === "View Low Inventory"){
      viewLow();
    }
    else if(command === "Add Inventory"){
      addInventory();
    }
    else if(command === "Add Item"){
      addItem();
    }
    else if(command === "Exit"){
      endApp();
    }
  })
}
function viewLow(){
  db.query("SELECT * FROM products WHERE stock_quantity <5" ,function (err, result) {
    const itemArray = [];
    if(err) throw err;
    for (let i = 0; i < result.length; i++) {
      itemArray.push(new Product(
        result[i].item_id,
        result[i].product_name,
        result[i].department_name,
        result[i].price,
        result[i].stock_quantity));
    }
    // Create and Display Columns
    console.log("===================================================");
    var columns = columnify(itemArray, {
      columns: ['id', 'name', 'department', 'price', 'stock']
    })
    console.log(columns);
    console.log("===================================================");
    if (err) throw err;
    beginPrompt();
  })
}

function addInventory(){
  db.query("SELECT * FROM products", function (err, result) {
    inquirer.prompt([
      {
      name: "item",
      type: "list",
      choices: function() {
        let choiceArray = [];
        for (let i = 0; i < result.length; i++) {
          choiceArray.push(result[i].item_id.toString());
        }
        return choiceArray;
      },
      message: "What item stock would you like to update"
      },
      {
        name: "stock",
        type: "input",
        message: "How many are there currently?"
      }
    
    ]).then(function (answer) {
      const answerId = parseInt(answer.item);
      const answerStock = parseInt(answer.stock);
      updateStock(answerId, answerStock);
      beginPrompt();
    })
  })
}

function updateStock(id, stock){
  db.query("UPDATE products SET? WHERE ?",
  [
    {
      stock_quantity : stock
    },
    {
      item_id : id
    }
  ])
}

function addItem(){
  inquirer.prompt([
    {
      name : "itemName",
      type : "input",
      message : "What is the Item Name:"
    },
    {
      name : "departmentName",
      type : "input",
      message : "What Demartment is it in:"    
    },
    {
      name : "price",
      type : "input",
      message : "What is the Price:",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    },
    {
      name : "stock",
      type : "input",
      message : "How Much Stock do you have:",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    },
  ]).then(function(answer){
    console.log(answer);
    db.query(
      "INSERT INTO products SET ?",
      {
        product_name : answer.itemName,
        department_name : answer.departmentName,
        price : answer.price,
        stock_quantity : answer.stock
      },
      function(err, result) {
        if (err) throw err;
        console.log(result.affectedRows);
        console.log("Item Added");
        beginPrompt();
      })   
  })
}

function endApp(){
  db.end();
}