"use strict";
var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var bcrypt = require("bcrypt");

// added for cookies
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const jwtKey = "my_secret_key";
const jwtExpirySeconds = 3000;

// added
const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connection Complete!");
});

app.set("port", process.env.PORT || 3000);

app.use("/", express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.redirect("landing.html");
});
app.get("/backend", function (req, res) {
  res.redirect("login.html");
});
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/getusercat/", function (req, res) {
  var fname = req.query.facultyname;
  var femail = req.query.facultyemail;
  console.log(fname, femail);

  var sqlsel = "SELECT * FROM Category";
  // var inserts = ['%' + fname + '%', '%' + femail + '%'];
  var sql = mysql.format(sqlsel);
  console.log(sql);

  con.execute(sql, function (err, data) {
    if (err) throw err;
    console.log("1 set recorded");
    console.log(data);
    // res.redirect("/user/insertfaculty.html");
    // res.end();
    res.send(JSON.stringify(data));
  });
});

app.get("/getuserrole/", function (req, res) {
  var fname = req.query.facultyname;
  var femail = req.query.facultyemail;
  console.log(fname, femail);

  var sqlsel = "SELECT * FROM Role";
  // var inserts = ['%' + fname + '%', '%' + femail + '%'];
  var sql = mysql.format(sqlsel);
  console.log(sql);

  con.execute(sql, function (err, data) {
    if (err) throw err;
    console.log("1 set recorded");
    console.log(data);
    // res.redirect("/user/insertfaculty.html");
    // res.end();
    res.send(JSON.stringify(data));
  });
});

app.post("/insertuser", function (req, res) {
  var employeenameEA = req.body.employeename;
  var employeelastnameEA = req.body.employeelastname;
  var employeeaddressEA = req.body.employeeaddress;
  var employeecityEA = req.body.employeecity;
  var employeestateEA = req.body.employeestate;
  var employeezipEA = req.body.employeezip;
  var employeeemailEA = req.body.employeeemail;
  var employeepwEA = req.body.employeepw;
  var userCatEA = req.body.userCat;
  var userRoleEA = req.body.userRole;

  var saltRounds = 10;
  var theHashedPWEA = "";

  bcrypt.hash(employeepwEA, saltRounds, function (err, hashedPassword) {
    if (err) {
      console.log("Error hashing password: ", err);
      return res.status(500).send("Error processing the request.");
    } else {
      theHashedPWEA = hashedPassword;
      var sqlinsEA =
        "INSERT INTO User (UserFirstName, UserLastName, UserAddress, UserCity, UserState, UserZip, UserEmail, UserPassword, CatagoryID, RoleID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      var insertsEA = [
        employeenameEA,
        employeelastnameEA,
        employeeaddressEA,
        employeecityEA,
        employeestateEA,
        employeezipEA,
        employeeemailEA,
        theHashedPWEA,
        userCatEA,
        userRoleEA,
      ];
      var sqlEA = mysql.format(sqlinsEA, insertsEA);
      con.execute(sqlEA, function (err, result) {
        if (err) {
          console.error("Error executing query: ", err);
          return res.status(500).send("Error processing the request.");
        }
        console.log("1 set recorded");
        res.redirect("insertuser.html");
      });
    }
  });
});

app.get("/searchusers", function (req, res) {
  const name = req.query.name;
  const lastname = req.query.lastname;
  const address = req.query.address;
  const city = req.query.city;
  const state = req.query.state;
  const zip = req.query.zip;
  const email = req.query.email;
  const userCat = req.query.userCat;
  const userRole = req.query.userRole;

  // Construct the SQL query
  let sql = `
    SELECT 
      u.UserID,
      u.UserFirstName,
      u.UserLastName,
      u.UserAddress,
      u.UserCity,
      u.UserState,
      u.UserZip,
      u.UserEmail,
      u.RoleID,
      u.CatagoryID,
      c.CatagoryName AS Category,
      r.RoleName AS Role
    FROM User u
    LEFT JOIN Category c ON u.CatagoryID = c.CatagoryID
    LEFT JOIN Role r ON u.RoleID = r.RoleID
    WHERE 
  `;
  let conditions = [];

  // Add conditions for each filter, if provided
  if (name) conditions.push(`u.UserFirstName LIKE '%${name}%'`);
  if (lastname) conditions.push(`u.UserLastName LIKE '%${lastname}%'`);
  if (address) conditions.push(`u.UserAddress LIKE '%${address}%'`);
  if (city) conditions.push(`u.UserCity LIKE '%${city}%'`);
  if (state) conditions.push(`u.UserState LIKE '%${state}%'`);
  if (zip) conditions.push(`u.UserZip LIKE '%${zip}%'`);
  if (email) conditions.push(`u.UserEmail LIKE '%${email}%'`);
  if (userCat) conditions.push(`u.CatagoryID = ${userCat}`);
  if (userRole) conditions.push(`u.RoleID = ${userRole}`);

  // Join all conditions using AND
  sql += conditions.join(" AND ");

  // Handle the case where there are no conditions
  if (conditions.length === 0) {
    sql = sql.replace("WHERE", "");
  }

  console.log(sql); // for debugging

  // Execute the SQL query
  con.query(sql, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(results);
    console.log(results);
  });
});

app.get("/searchusersv2", function (req, res) {
  // Construct the SQL query to select all players
  let sql = "SELECT * FROM User";

  // Execute the SQL query
  con.query(sql, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(results);
    console.log(results);
  });
});

app.post("/updateuser", function (req, res) {
  // Extracting data sent from the frontend
  var userId = req.body.userId; // Unique identifier for the user to be updated
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var roleId = req.body.roleId;
  var categoryId = req.body.categoryId;

  // SQL query
  var sqlUpdate =
    "UPDATE User SET UserFirstName = ?, UserLastName = ?, UserAddress = ?, UserCity = ?, UserState = ?, UserZip = ?, UserEmail = ?, CatagoryID = ?, RoleID = ? WHERE UserID = ?";

  var updates = [
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    email,
    categoryId,
    roleId,
    userId,
  ];

  var sql = mysql.format(sqlUpdate, updates);

  con.execute(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).send("Error processing the request.");
    }
    console.log("User updated successfully");
    // Send a response back to the client
    res.json({ message: "User updated successfully", userId: userId });
  });
});

app.delete("/deleteuser/:userId", function (req, res) {
  var userId = req.params.userId;

  var sqlDelete = "DELETE FROM User WHERE UserID = ?";
  var values = [userId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("User deleted successfully");
    res.send({ success: true, message: "User deleted successfully" });
  });
});

app.post("/insertproduct", function (req, res) {
  var pNameEA = req.body.productName;
  var pDescEA = req.body.productDesc;
  var pPriceEA = req.body.productPrice;
  var pSizeEA = req.body.productSize;

  var sqlinsEA =
    "INSERT INTO Product (ProductName, ProductDesc, ProductPrice, ProductSize) VALUES (?, ?, ?, ?)";
  var insertsEA = [pNameEA, pDescEA, pPriceEA, pSizeEA];
  var sqlEA = mysql.format(sqlinsEA, insertsEA);

  con.query(sqlEA, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).send("Error processing the request.");
    }
    console.log("1 product inserted");
    res.send({ success: true, productId: result.insertId }); // Respond with success and the ID of the inserted product
  });
});

app.post("/updateproduct", function (req, res) {
  // Extract the product information from the request body
  var pId = req.body.productId;
  var pName = req.body.productName;
  var pDesc = req.body.productDesc;
  var pPrice = req.body.productPrice;
  var pSize = req.body.productSize;

  // SQL statement to update the product
  var sqlUpdate = `
    UPDATE Product 
    SET ProductName = ?, ProductDesc = ?, ProductPrice = ?, ProductSize = ? 
    WHERE ProductID = ?`;

  // Array of values to use in the SQL statement
  var updates = [pName, pDesc, pPrice, pSize, pId];
  var sql = mysql.format(sqlUpdate, updates);

  // Execute the update query
  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Product updated successfully");
    res.send({
      success: true,
      message: "Product updated successfully",
      productId: pId,
    });
  });
});

app.delete("/deleteproduct/:productId", function (req, res) {
  var productId = req.params.productId;

  var sqlDelete = "DELETE FROM Product WHERE ProductID = ?";
  var values = [productId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Product deleted successfully");
    res.send({ success: true, message: "Product deleted successfully" });
  });
});

app.get("/searchproducts", function (req, res) {
  // Assume that the query parameters could be used for searching/filtering
  const name = req.query.name;
  const desc = req.query.desc;
  const price = req.query.price;
  const size = req.query.size;

  // Construct the SQL query
  let sql =
    "SELECT ProductID, ProductName, ProductDesc, ProductPrice, ProductSize FROM Product";
  let conditions = [];
  let params = [];

  // Add conditions for each filter, if provided
  if (name) {
    conditions.push("ProductName LIKE ?");
    params.push(`%${name}%`);
  }
  if (desc) {
    conditions.push("ProductDesc LIKE ?");
    params.push(`%${desc}%`);
  }
  if (price) {
    conditions.push("ProductPrice = ?");
    params.push(price);
  }
  if (size) {
    conditions.push("ProductSize LIKE ?");
    params.push(`%${size}%`);
  }

  // Join all conditions using AND, or select all if no conditions
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  console.log(sql); // For debugging

  // Execute the SQL query with parameter substitution to prevent SQL injection
  con.query(sql, params, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }
    // Send the results back to the client
    res.json(results);
  });
});

app.post("/insertinventory", function (req, res) {
  var invProductIdEA = req.body.productID;
  var invQuantityEA = req.body.inventoryQuantity;

  // SQL Query to insert inventory data
  var sqlinsEA =
    "INSERT INTO Inventory (ProductID, InventoryQuantity) VALUES (?, ?)";
  var insertsEA = [invProductIdEA, invQuantityEA];
  var sqlEA = mysql.format(sqlinsEA, insertsEA);

  // Execute SQL query
  con.query(sqlEA, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).send("Error processing the request.");
    }
    console.log("1 inventory record inserted");
    res.send({ success: true, inventoryId: result.insertId });
  });
});

app.post("/updateinventory", function (req, res) {
  var inventoryId = req.body.inventoryId;
  var quantity = req.body.quantity;

  if (!inventoryId || quantity === undefined) {
    return res
      .status(400)
      .send({ message: "Inventory ID and Quantity are required." });
  }

  var sqlUpdate =
    "UPDATE Inventory SET InventoryQuantity = ? WHERE InventoryID = ?";
  var updates = [quantity, inventoryId];

  con.execute(sqlUpdate, updates, function (err, result) {
    if (err) {
      console.error("Error executing inventory update query: ", err);
      return res.status(500).send({ message: "Error updating inventory." });
    }
    console.log("Inventory updated successfully");
    res.json({
      message: "Inventory updated successfully",
      inventoryId: inventoryId,
    });
  });
});

app.delete("/deleteinventoryitem/:inventoryId", function (req, res) {
  var inventoryId = req.params.inventoryId;

  var sqlDelete = "DELETE FROM Inventory WHERE InventoryID = ?";
  var values = [inventoryId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Inventory item deleted successfully");
    res.send({ success: true, message: "Inventory item deleted successfully" });
  });
});

app.get("/searchinventory", function (req, res) {
  // Assume that the query parameters could be used for searching/filtering
  const productId = req.query.productId;
  const inventoryQuantity = req.query.inventoryQuantity;

  // Construct the SQL query
  let sql = `
    SELECT inv.InventoryID, inv.ProductID, prod.ProductName, inv.InventoryQuantity
    FROM Inventory inv
    INNER JOIN Product prod ON inv.ProductID = prod.ProductID
  `;
  let conditions = [];
  let params = [];

  // Add conditions for each filter, if provided
  if (productId) {
    conditions.push("prod.ProductID = ?");
    params.push(productId);
  }
  if (inventoryQuantity) {
    conditions.push("inv.InventoryQuantity = ?");
    params.push(inventoryQuantity);
  }

  // Join all conditions using AND, or select all if no conditions
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  console.log(sql); // For debugging

  // Execute the SQL query with parameter substitution to prevent SQL injection
  con.query(sql, params, function (err, results) {
    if (err) {
      console.error("Error executing the inventory search query", err);
      return res.status(500).send("Error executing the inventory search query");
    }
    // Send the results back to the client
    res.json(results);
  });
});

app.post("/insertplayer", function (req, res) {
  var playerFirstNameEA = req.body.playerFirstName;
  var playerLastNameEA = req.body.playerLastName;
  var playerEmailEA = req.body.playerEmail;
  var playerPasswordEA = req.body.playerPassword;
  var playerAddressEA = req.body.playerAddress;
  var playerCityEA = req.body.playerCity;
  var playerStateEA = req.body.playerState;
  var playerZipEA = req.body.playerZip;
  var rewardsIdEA = req.body.rewardsId;

  var saltRounds = 10;

  // Hash the player's password
  bcrypt.hash(playerPasswordEA, saltRounds, function (err, hashedPassword) {
    if (err) {
      console.log("Error hashing password: ", err);
      return res.status(500).send("Error processing the request.");
    } else {
      var theHashedPWEA = hashedPassword;
      var sqlins =
        "INSERT INTO Player (PlayerFirstName, PlayerLastName, PlayerEmail, PlayerPassword, PlayerAddress, PlayerCity, PlayerState, PlayerZip, RewardsID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      var inserts = [
        playerFirstNameEA,
        playerLastNameEA,
        playerEmailEA,
        theHashedPWEA,
        playerAddressEA,
        playerCityEA,
        playerStateEA,
        playerZipEA,
        rewardsIdEA,
      ];
      var sql = mysql.format(sqlins, inserts);

      // Execute the SQL query
      con.execute(sql, function (err, result) {
        if (err) {
          console.error("Error executing query: ", err);
          return res.status(500).send("Error processing the request.");
        }
        console.log("1 record inserted");
        // Redirect or send a response here
        res.send({
          success: true,
          message: "Player inserted successfully.",
        });
      });
    }
  });
});

app.get("/getplayers", function (req, res) {
  // Construct the SQL query to select all players
  let sql = "SELECT PlayerID, PlayerFirstName, PlayerLastName FROM Player";

  // Execute the SQL query
  con.query(sql, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(results);
    console.log(results);
  });
});

app.get("/searchplayersv2", function (req, res) {
  // Construct the SQL query to select all players
  let sql = "SELECT * FROM Player";

  // Execute the SQL query
  con.query(sql, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(results);
    console.log(results);
  });
});

app.get("/searchplayers", function (req, res) {
  const firstNameEA = req.query.firstName;
  const lastNameEA = req.query.lastName;
  const emailEA = req.query.email;
  const addressEA = req.query.address;
  const cityEA = req.query.city;
  const stateEA = req.query.state;
  const zipEA = req.query.zip;
  const rewardsLevelEA = req.query.rewardsLevel;

  let sqlEA = `
    SELECT 
      p.PlayerID,
      p.PlayerFirstName,
      p.PlayerLastName,
      p.PlayerEmail,
      p.PlayerAddress,
      p.PlayerCity,
      p.PlayerState,
      p.PlayerZip,
      p.RewardsID,
      r.RewardsName AS RewardLevel
    FROM Player p
    LEFT JOIN Rewards r ON p.RewardsID = r.RewardsID
    WHERE 
  `;
  let conditionsEA = [];

  if (firstNameEA) conditionsEA.push(`p.PlayerFirstName LIKE '%${firstNameEA}%'`);
  if (lastNameEA) conditionsEA.push(`p.PlayerLastName LIKE '%${lastNameEA}%'`);
  if (emailEA) conditionsEA.push(`p.PlayerEmail LIKE '%${emailEA}%'`);
  if (addressEA) conditionsEA.push(`p.PlayerAddress LIKE '%${addressEA}%'`);
  if (cityEA) conditionsEA.push(`p.PlayerCity LIKE '%${cityEA}%'`);
  if (stateEA) conditionsEA.push(`p.PlayerState LIKE '%${stateEA}%'`);
  if (zipEA) conditionsEA.push(`p.PlayerZip LIKE '%${zipEA}%'`);
  if (rewardsLevelEA) conditionsEA.push(`p.RewardsID = ${rewardsLevelEA}`);

  sqlEA += conditionsEA.join(" AND ");

  if (conditionsEA.length === 0) {
    sqlEA = sqlEA.replace("WHERE", "");
  }

  console.log(sqlEA); // for debugging

  con.query(sqlEA, function (err, resultsEA) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    res.json(resultsEA);
    console.log(resultsEA);
  });
});

app.post("/updateplayer", function (req, res) {
  var playerId = req.body.playerId;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var rewardsId = req.body.rewardsId;

  var sqlUpdate = `
    UPDATE Player
    SET PlayerFirstName = ?,
        PlayerLastName = ?,
        PlayerEmail = ?,
        PlayerAddress = ?,
        PlayerCity = ?,
        PlayerState = ?,
        PlayerZip = ?,
        RewardsID = ?
    WHERE PlayerID = ?`;

  var updates = [
    firstName,
    lastName,
    email,
    address,
    city,
    state,
    zip,
    rewardsId,
    playerId,
  ];

  var sql = mysql.format(sqlUpdate, updates);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Player updated successfully");
    res.send({ success: true, message: "Player updated successfully" });
  });
});

app.delete("/deleteplayer/:playerId", function (req, res) {
  var playerId = req.params.playerId;

  var sqlDelete = "DELETE FROM Player WHERE PlayerID = ?";
  var values = [playerId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Player deleted successfully");
    res.send({ success: true, message: "Player deleted successfully" });
  });
});

app.post("/insertorder", function (req, res) {
  // Extract order details from the request body
  var userIdEA = req.body.userId;
  var productIdEA = req.body.productId;
  var quantityEA = req.body.quantity;
  var priceEA = req.body.price;
  var dateEA = req.body.date;
  var timeEA = req.body.time;
  var orderStatusEA = req.body.orderStatus;

  // Create SQL to insert the order
  var sqlinsEA = `INSERT INTO Orders (UserID, ProductID, OrderQuantity, OrderTotalPrice, OrdersDate, OrdersTime, OrderStatus) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  var valuesEA = [
    userIdEA,
    productIdEA,
    quantityEA,
    priceEA * quantityEA,
    dateEA,
    timeEA,
    orderStatusEA,
  ];
  var sqlEA = mysql.format(sqlinsEA, valuesEA);

  // Execute the SQL query
  con.execute(sqlEA, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).send("Error processing the request.");
    }
    console.log("1 record inserted");
    // Redirect or send a response here
    res.send({ success: true, message: "Order inserted successfully." });
  });
});

app.get("/searchorders", function (req, res) {
  const userIdEA = req.query.userId;
  const productIdEA = req.query.productId;
  const orderDateEA = req.query.date;
  const orderPriceEA = req.query.price;

  // Construct the SQL query
  let sqlEA = `
    SELECT 
      o.OrdersID,
      o.OrdersDate,
      o.OrderTotalPrice,
      o.OrdersTime,
      o.OrderStatus,
      p.PlayerFirstName,
      p.PlayerLastName,
      pr.ProductName
    FROM Orders o
    JOIN Player p ON o.UserID = p.PlayerID
    JOIN Product pr ON o.ProductID = pr.ProductID
    WHERE o.OrderStatus = 0
  `;
  let conditionsEA = [];

  // Add conditions for each filter, if provided
  if (userIdEA) conditionsEA.push(`o.UserID = ${userIdEA}`);
  if (productIdEA) conditionsEA.push(`o.ProductID = ${productIdEA}`);
  if (orderDateEA) conditionsEA.push(`o.OrdersDate = '${orderDateEA}'`);
  if (orderPriceEA) conditionsEA.push(`o.OrderTotalPrice = ${orderPriceEA}`);

  // Join all conditions using AND
  if (conditionsEA.length > 0) {
    sqlEA += " AND " + conditionsEA.join(" AND ");
  }

  console.log(sqlEA); // for debugging

  // Execute the SQL query
  con.query(sqlEA, function (err, resultsEA) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(resultsEA);
    console.log(resultsEA);
  });
});

app.post("/updateorder", function (req, res) {
  // Extract the order information from the request body
  var orderId = req.body.orderId;
  var ordersDate = req.body.orderDate;
  var ordersTime = req.body.orderTime;
  var orderTotalPrice = req.body.pricePaid;
  var orderStatus = req.body.orderStatus;

  // SQL statement to update the order
  var sqlUpdate = `
    UPDATE Orders
    SET OrdersDate = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrdersDate END,
        OrdersTime = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrdersTime END,
        OrderTotalPrice = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrderTotalPrice END,
        OrderStatus = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrderStatus END
    WHERE OrdersID = ?`;

  // Array of values to use in the SQL statement
  var updates = [
    ordersDate,
    ordersDate,
    ordersDate,
    ordersTime,
    ordersTime,
    ordersTime,
    orderTotalPrice,
    orderTotalPrice,
    orderTotalPrice,
    orderStatus,
    orderStatus,
    orderStatus,
    orderId,
  ];

  var sql = mysql.format(sqlUpdate, updates);

  // Execute the update query
  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Order updated successfully");
    res.send({
      success: true,
      message: "Order updated successfully",
      orderId: orderId,
    });
  });
});

app.delete("/deleteorder/:orderId", function (req, res) {
  var orderId = req.params.orderId;

  var sqlDelete = "DELETE FROM Orders WHERE OrdersID = ?";
  var values = [orderId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Order deleted successfully");
    res.send({ success: true, message: "Order deleted successfully" });
  });
});

app.get("/searchpurchases", function (req, res) {
  const userIdEA = req.query.userId;
  const productIdEA = req.query.productId;
  const orderDateEA = req.query.date;
  const orderPriceEA = req.query.price;

  // Construct the SQL query
  let sqlEA = `
    SELECT 
      o.OrdersID,
      o.OrdersDate,
      o.OrdersTime,
      o.OrderTotalPrice,
      o.OrderStatus,
      p.PlayerFirstName,
      p.PlayerLastName,
      p.PlayerAddress,
      p.PlayerCity,
      p.PlayerState,
      p.PlayerZip,
      pr.ProductName
    FROM Orders o
    JOIN Player p ON o.UserID = p.PlayerID
    JOIN Product pr ON o.ProductID = pr.ProductID
    WHERE o.OrderStatus = 1
  `;
  let conditionsEA = [];

  // Add conditions for each filter, if provided
  if (userIdEA) conditionsEA.push(`o.UserID = ${userIdEA}`);
  if (productIdEA) conditionsEA.push(`o.ProductID = ${productIdEA}`);
  if (orderDateEA) conditionsEA.push(`o.OrdersDate = '${orderDateEA}'`);
  if (orderPriceEA) conditionsEA.push(`o.OrderTotalPrice = ${orderPriceEA}`);

  // Join all conditions using AND
  if (conditionsEA.length > 0) {
    sqlEA += " AND " + conditionsEA.join(" AND ");
  }

  console.log(sqlEA); // for debugging

  // Execute the SQL query
  con.query(sqlEA, function (err, resultsEA) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(resultsEA);
    console.log(resultsEA);
  });
});

app.post("/updatepurchase", function (req, res) {
  // Extract the purchase information from the request body
  var purchaseId = req.body.purchaseId;
  var orderTotalPrice = req.body.pricePaid;
  var orderStatus = req.body.orderStatus;

  // SQL statement to update the purchase
  var sqlUpdate = `
    UPDATE Orders
    SET OrderTotalPrice = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrderTotalPrice END,
        OrderStatus = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE OrderStatus END
    WHERE OrdersID = ?`;

  // Array of values to use in the SQL statement
  var updates = [
    orderTotalPrice,
    orderTotalPrice,
    orderTotalPrice,
    orderStatus,
    orderStatus,
    orderStatus,
    purchaseId,
  ];

  var sql = mysql.format(sqlUpdate, updates);

  // Execute the update query
  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Purchase updated successfully");
    res.send({
      success: true,
      message: "Purchase updated successfully",
      purchaseId: purchaseId,
    });
  });
});

app.delete("/deletepurchase/:purchaseId", function (req, res) {
  var purchaseId = req.params.purchaseId;

  var sqlDelete = "DELETE FROM Orders WHERE OrdersID = ?";
  var values = [purchaseId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Purchase deleted successfully");
    res.send({ success: true, message: "Purchase deleted successfully" });
  });
});

app.post("/insertreservation", function (req, res) {
  // Extract reservation details from the request body
  var playerIdEA = req.body.playerId;
  var reservationsDateEA = req.body.reservationsDate;
  var reservationsTimeEA = req.body.reservationsTime;
  var reservationsCountEA = req.body.reservationsCount;
  var reservationsStatusEA = "0"; // Default status is '0'

  // SQL query to insert the reservation data
  var sqlinsEA =
    "INSERT INTO Reservations (PlayerID, ReservationsDate, ReservationsTime, ReservationsCount, ReservationsStatus) VALUES (?, ?, ?, ?, ?)";
  var insertsEA = [
    playerIdEA,
    reservationsDateEA,
    reservationsTimeEA,
    reservationsCountEA,
    reservationsStatusEA,
  ];
  var sqlEA = mysql.format(sqlinsEA, insertsEA);

  // Execute the SQL query
  con.execute(sqlEA, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).send("Error processing the reservation request.");
    }
    console.log("1 reservation inserted");
    console.log(sqlEA);
    res.send({
      success: true,
      message: "Reservation inserted successfully.",
      reservationId: result.insertId,
    });
  });
});

app.get("/searchreservations", function (req, res) {
  const playerIdEA = req.query.playerId;
  const reservationsDateEA = req.query.reservationsDate;
  const reservationsTimeEA = req.query.reservationsTime;
  const reservationsCountEA = req.query.reservationsCount;

  // Construct the SQL query
  let sqlEA = `
    SELECT 
      r.ReservationsID,
      r.ReservationsDate,
      r.ReservationsTime,
      r.ReservationsCount,
      r.PlayerID,
      p.PlayerFirstName,
      p.PlayerLastName
    FROM Reservations r
    JOIN Player p ON r.PlayerID = p.PlayerID
    WHERE 
  `;
  let conditionsEA = [];

  // Add conditions for each filter, if provided
  if (playerIdEA) conditionsEA.push(`r.PlayerID = ${playerIdEA}`);
  if (reservationsDateEA)
    conditionsEA.push(`r.ReservationsDate = '${reservationsDateEA}'`);
  if (reservationsTimeEA)
    conditionsEA.push(`r.ReservationsTime = '${reservationsTimeEA}'`);
  if (reservationsCountEA)
    conditionsEA.push(`r.ReservationsCount = ${reservationsCountEA}`);

  // Join all conditions using AND
  sqlEA += conditionsEA.join(" AND ");

  // Handle the case where there are no conditions
  if (conditionsEA.length === 0) {
    sqlEA = sqlEA.replace("WHERE", "");
  }

  console.log(sqlEA); // for debugging

  // Execute the SQL query
  con.query(sqlEA, function (err, resultsEA) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(resultsEA);
    console.log(resultsEA);
  });
});

app.post("/updatereservation", function (req, res) {
  var reservationId = req.body.reservationId;
  var reservationDate = req.body.reservationDate;
  var reservationTime = req.body.reservationTime;
  var reservationCount = req.body.reservationCount;
  var playerId = req.body.playerId; // Get the player ID from the request body

  var sqlUpdate = `
    UPDATE Reservations
    SET
      ReservationsDate = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE ReservationsDate END,
      ReservationsTime = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE ReservationsTime END,
      ReservationsCount = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE ReservationsCount END,
      PlayerID = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE PlayerID END
    WHERE ReservationsID = ?
  `;

  var updates = [
    reservationDate, reservationDate, reservationDate,
    reservationTime, reservationTime, reservationTime,
    reservationCount, reservationCount, reservationCount,
    playerId, playerId, playerId, // Include the player ID in the updates array
    reservationId,
  ];

  var sql = mysql.format(sqlUpdate, updates);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Reservation updated successfully");
    res.send({ success: true, message: "Reservation updated successfully" });
  });
});

app.delete("/deletereservation/:reservationId", function (req, res) {
  var reservationId = req.params.reservationId;

  var sqlDelete = "DELETE FROM Reservations WHERE ReservationsID = ?";
  var values = [reservationId];
  var sql = mysql.format(sqlDelete, values);

  con.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      return res
        .status(500)
        .send({ success: false, message: "Error processing the request." });
    }
    console.log("Reservation deleted successfully");
    res.send({ success: true, message: "Reservation deleted successfully" });
  });
});

app.post("/loginemp/", function (req, res) {
  var eemail = req.body.employeeemail;
  var epw = req.body.employeepw;
  var sqlsel = "select * from User where UserEmail = ?";
  var inserts = [eemail];
  var sql = mysql.format(sqlsel, inserts);
  console.log("sql: " + sql);
  con.query(sql, function (err, data) {
    if (data.length > 0) {
      console.log("user name correct:");
      console.log(data[0].UserPassword);
      var empkey=data[0].CatagoryID;
      bcrypt.compare(
        epw,
        data[0].UserPassword,
        function (err, passwordCorrect) {
          if (err) {
            throw err;
          } else if (!passwordCorrect) {
            console.log("Password incorrect");
          } else {
            console.log("password correct");
            const token = jwt.sign({ empkey }, jwtKey, {
              algorithm: "HS256",
              expiresIn: jwtExpirySeconds,
            });
            res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

            res.send({ redirect: "insertuser.html" });
          }
        }
      );
    } else {
      console.log("incorrect username or password...");
    }
  });
});

app.get("/getloggedin/", function (req, res) {
  var viewpage = 0;
  var datahold = [];
  const validtoken = req.cookies.token;
  console.log("token new:", validtoken);
  var payload;

  if (!validtoken) {
    viewpage = 0;
    console.log("NVT");
  } else {
    try {
      payload = jwt.verify(validtoken, jwtKey);
      console.log("payload new:", payload.empkey);
      viewpage = payload.empkey;

      var sqlsel = "select * from User where CatagoryID = ?";
      var inserts = [viewpage];

      var sql = mysql.format(sqlsel, inserts);

      con.query(sql, function (err, data) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(sql);
        console.log("Show 1" + data);

        datahold = data;

        res.send(JSON.stringify(data));
      });
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        viewpage = 0;
        console.log("NVT2");
      }
      viewpage = 0;
      console.log("NVT3");
    }
  }
});

app.get("/getloggedout/", function (req, res) {
  res.cookie("token", 2, { maxAge: 0 });
  res.send({ redirect: "/backend/index.html" });
});

app.get("/getrewards", function (req, res) {
  // Construct the SQL query to select all players
  let sql = "SELECT * FROM Rewards";

  // Execute the SQL query
  con.query(sql, function (err, results) {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).send("Error executing the query");
    }

    // Send the results back to the client
    res.json(results);
    console.log(results);
  });
});

app.post("/loginplayer/", function (req, res) {
  var playeremail = req.body.playeremail;
  var playerpw = req.body.playerpw;

  var sqlsel = "SELECT * FROM Player WHERE PlayerEmail = ?";
  var inserts = [playeremail];
  var sql = mysql.format(sqlsel, inserts);
  console.log("sql: " + sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (data.length > 0) {
      console.log("player email correct:");
      console.log(data[0].PlayerPassword);

      bcrypt.compare(
        playerpw,
        data[0].PlayerPassword,
        function (err, passwordCorrect) {
          if (err) {
            console.error("Error comparing passwords:", err);
            res.status(500).json({ error: "Internal server error" });
          } else if (!passwordCorrect) {
            console.log("Password incorrect");
            res.status(401).json({ error: "Incorrect password" });
          } else {
            console.log("Password correct");
            res.json({ playerId: data[0].PlayerID });
          }
        }
      );
    } else {
      console.log("Incorrect email or password...");
      res.status(401).json({ error: "Incorrect email or password" });
    }
  });
});

app.listen(app.get("port"), function () {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});
