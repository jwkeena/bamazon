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

// The single function that belongs to both customer and manager
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
        console.log("\n");
        
        if (isCustomer === true) {
            customer.openCustomerInquirer();
        } else {
            manager.openManagerInquirer();
        };
    });
};

// Separating customer and manager functions into separate objects instead of separate files (since this makes demoing easier)
const customer = {
    openCustomerInquirer: function() {
        inquirer.prompt([
            {
                type: "list",
                message: "what would you like to do?",
                choices: ["VIEW INVENTORY", "PURCHASE", "COMPLAIN", "SWITCH TO MANAGER VIEW", "QUIT"],
                name: "choice"
            }
        ]).then(function(resp) {
            if (resp.choice === "VIEW INVENTORY") {
                displayInventory();
            } else if (resp.choice === "PURCHASE") {
                console.log("\n");
                customer.purchase();
            } else if (resp.choice === "COMPLAIN") {
                console.log("\n");
                customer.customerService();
            } else if (resp.choice === "SWITCH TO MANAGER VIEW") {
                console.log("\n");
                isCustomer = false;
                manager.openManagerInquirer();
            } else if (resp.choice === "QUIT") {
                connection.end();
            }
        });
    },

    purchase: function() {
        inquirer.prompt([
            {
                type: "input",
                message: "\nWhat is the ID of the product you want to buy?",
                name: "id"
            }
        ]).then(function(response) {
            idNumber = parseInt(response.id);
            connection.query("SELECT * FROM products", function (err, result) {
                if (err) throw err;
                
                for (i=0; i<result.length; i++) {
                    if (parseInt(result[i].item_id) === idNumber) {

                        currentStock = parseInt(result[i].stock_quantity);
                        price = parseFloat(result[i].price);

                        console.log("\n");
                        inquirer.prompt([
                            {
                                type: "input",
                                message: "How many of this product (" + result[i].product_name + ") would you like to buy?",
                                name: "quantity"
                            }
                        ]).then(function (response2) {
                            
                            if (currentStock < response2.quantity) {
                                console.log("\nInsufficient quantity! Returning to main menu.\n");
                                customer.openCustomerInquirer();
                            } else {
                                
                                console.log("\nSuccessfully purchased " + response2.quantity + " item(s) for " + (parseInt(response2.quantity)*price) + " dollars.");
                                
                                // Deduct from current inventory
                                connection.query("UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: (currentStock - parseInt(response2.quantity))
                                    },
                                    {
                                        item_id: idNumber
                                    }
                                ],
                                function (err, result2) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        console.log("\nInventory updated.\n"); 
                                        displayInventory();
                                        customer.openCustomerInquirer();
                                    };
                                });
                            };
                        });
                    };
                };
            });
        });
    },

    customerService: function() {
        console.log("Thank you for calling customer service. Your call is very important to us.");
        setTimeout(function () {
            console.log("\n");
            console.log('Your call will be answered in the order in which it was received.')
            }, 2000);
        setTimeout(function () {
            console.log("\n");
            console.log('Who are we kidding, we just make bots wait you out and wear you down.')
            }, 4000);
        setTimeout(function () {
            console.log("\n");
            console.log('Connection terminated. Call again sometime if you want to get more frustrated!')
            }, 7000);
        setTimeout(function () {
            connection.end();
            }, 9000);
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
                console.log("\n");
                manager.restock();
            } else if (resp.choice === "ADD NEW PRODUCT") {
                console.log("\n");
                manager.addNewProduct();
            } else if (resp.choice === "SWITCH TO CUSTOMER VIEW") {
                isCustomer = true;
                console.log("\n");
                customer.openCustomerInquirer();
            } else if (resp.choice === "QUIT") {
                connection.end();
            }
        });
    },

    restock: function() {
        inquirer.prompt([
            {
                type: "input",
                message: "\nWhat is the ID number of the item to be restocked?",
                name: "id"
            }
        ]).then(function (response) {
            id = parseInt(response.id)
            connection.query("SELECT * FROM products", function (err, result) {
                if (err) throw err;

                for (i=0; i<result.length; i++) {

                    if (parseInt(result[i].item_id) === id) {

                        currentStock = parseInt(result[i].stock_quantity);

                        console.log("\n");
                        inquirer.prompt([
                            {
                                type: "input",
                                message: "How many of this product (" + result[i].product_name + ") would you like to add to the inventory?",
                                name: "quantity"
                            }
                        ]).then(function (response2) {

                            restockNumber = parseInt(response2.quantity)

                            connection.query("UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: (currentStock + restockNumber)
                                },
                                {
                                    item_id: id
                                }
                            ], function (err, result2) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log("Inventory updated.\n");
                                    manager.openManagerInquirer();
                                };
                            });
                        });
                    };
                };
            });
        });
    },

    addNewProduct: function() {
        console.log("adding new product");
        manager.openManagerInquirer();
    }
}

connection.connect(function(err) {
    if (err) throw err;
    console.log("Successfully connected to Bamazon[TM] - The best worst ripoff of Amazon on GitHub!\n");
    customer.openCustomerInquirer();
  });
