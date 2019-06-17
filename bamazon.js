const inquirer = require ("inquirer");
const mysql = require ("mysql");
const Table = require("cli-table");
let isCustomer = true;

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "YOURPASSWORDHERE", 
    database: "bamazon"
});

function displayInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        // Creates table
        let table = new Table({
            head: ["ID", "Item", "Department", "Price", "Stock"],
            colWidths: [5, 45, 25, 10, 10]
        });

        // Populates table with inventory
        for (i=0; i<res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        };

        // Displays table
        console.log(table.toString());
        
        if (isCustomer === true) {
            customer.openCustomerInquirer();
        } else {
            manager.openManagerInquirer();
        };
    });
};

const customer = {
    openCustomerInquirer: function() {
        inquirer.prompt([
            {
                type: "list",
                message: "what would you like to do?",
                choices: ["PURCHASE", "COMPLAIN", "SWITCH TO MANAGER VIEW", "QUIT"],
                name: "choice"
            }
        ]).then(function(resp) {
            if(resp.choice === "PURCHASE") {
                customer.purchase();
            } else if (resp.choice === "COMPLAIN") {
                customer.customerService();
            } else if (resp.choice === "SWITCH TO MANAGER VIEW") {
                isCustomer = false;
                manager.openManagerInquirer();
            } else if (resp.choice === "QUIT") {
                connection.end();
            }
        });
    },

    purchase: function() {
        console.log("purchase");
        this.openCustomerInquirer();
    },

    customerService: function() {
        console.log("Thank you for calling customer service. Your call is very important to us.");
        setTimeout(function () {
            console.log('Your call will be answered in the order in which it was received.')
            }, 2000);
        setTimeout(function () {
        console.log('Who are we kidding, we just make bots wait you out and wear you down.')
            }, 4000);
        setTimeout(function () {
            console.log('Connection terminated. Call again sometime if you want to get more frustrated!')
            }, 6500);
        setTimeout(function () {
            connection.end();
            }, 7000);
    }
}

const manager = {
    openManagerInquirer: function() {
        inquirer.prompt([
            {
                type: "list",
                message: "what would you like to do?",
                choices: ["VIEW INVENTORY", "RESTOCK INVENTORY", "ADD NEW PRODUCT", "SWITCH TO CUSTOMER VIEW", "QUIT"],
                name: "choice"
            }
        ]).then(function(resp) {
            if(resp.choice === "VIEW INVENTORY") {
                displayInventory();
            } else if (resp.choice === "RESTOCK INVENTORY") {
                manager.restock();
            } else if (resp.choice === "ADD NEW PRODUCT") {
                manager.addNewProduct();
            } else if (resp.choice === "SWITCH TO CUSTOMER VIEW") {
                isCustomer = true;
                customer.openCustomerInquirer();
            } else if (resp.choice === "QUIT") {
                connection.end();
            }
        });
    },

    restock: function() {
        console.log("restock");
        this.openManagerInquirer();
    },

    addNewProduct: function() {
        console.log("adding new product");
        this.openManagerInquirer();
    }
}

connection.connect(function(err) {
    if (err) throw err;
    console.log("Successfully connected to local server. Displaying inventory:");
    displayInventory();
  });
