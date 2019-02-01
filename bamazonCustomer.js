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

function beginPrompt() {
  db.query("SELECT * FROM products", function (err, result) {
    inquirer.prompt([
      {
      name: "item",
      type: "list",
      choices: function() {
        let choiceArray = [];
        for (let i = 0; i < result.length; i++) {
          choiceArray.push(result[i].product_name.toString());
        }
        return choiceArray;
      },
      message: "What would you like to buy"
      },
      {
        name: "stock",
        type: "input",
        message: "How many would you like to buy?"
      }
    
    ]).then(function (answer) {
      const answerStock = parseInt(answer.stock);
      checkStock(answer.item, answerStock);
    })
  })
  
}

// Check if there is enough stock
function checkStock(name, stockBought){
  db.query("SELECT * FROM products WHERE?",{product_name : name} ,function (err, result) {
    let remainingStock = result[0].stock_quantity - stockBought;
    let totalCost = (result[0].price * stockBought).toFixed(2);
    if(err) throw err;
    if(result[0].stock_quantity >= stockBought){
      console.log(`You Just Bought ${stockBought} ${result[0].product_name}`);
      console.log(`Your total: ${totalCost}`);
      updateStock(name, remainingStock);
    }
    else{
      console.log("Not Enough Stock");
    }
    runAgain();
  })
}

function updateStock(name, remainingStock){
  db.query("UPDATE products SET? WHERE ?",
  [
    {
      stock_quantity : remainingStock
    },
    {
      product_name: name
    }
  ])
}

function runAgain(){
  inquirer.prompt([
    {
    name: "again",
    type: "list",
    choices: ["Yes", "No"],
    message: "What would you like to buy something else?"
    }
  ]).then(function ({again}) {
    if(again === "Yes"){
      start()
    }
    else{
      endApp();
    }
  })
}
// End Connection
function endApp(){
  db.end();
}