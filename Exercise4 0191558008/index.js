const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 8080
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var mysql = require("mysql")
const { response } = require("express")
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RootRoot1!",
    database: "WebDev2Tp4"
})

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!")
})

function doSomething(number){
    number = 3
}



app.get("/", (request, response) => {
    var welcomestring = "Hello, this is the start page for the REST APIs homework!<br/>" +
        "Here are the most important commands: <br/>" +
        "'/READ/(name of city)'     to read the details of a city!<br/>" +
        "'/ADD'     to add another entry to the table 'city,'<br/>" +
        "'/UPDATE/(name of city)/(new population)'  to update the population of an entry in the 'city' table,<br/>" +
        "'/DELETE/(id of city)'  to delete an enty in the 'city' table!"
    response.send(welcomestring)
})

app.get("/READ/:name", (request, response) => {
    var name = request.params.name
    console.log("Found site with id: " + name)
    connection.query("SELECT * FROM city WHERE Name='" + name + "'", function (error, results, fields) {
        console.log("Looking for entry....")
        if (error) throw error
        response.send(results[0])
    })
})



app.get("/ADD", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.post("/ADD_RESULT", urlencodedParser, function (req, res) {
    var sqlquery = "SELECT MAX(ID) AS maxID FROM city"
    var new_id = 0;
    connection.query(sqlquery, (error, results) => {
        if (error) throw error
        new_id = results[0].maxID
        new_id += 1
        console.log(new_id)
        var response = {
            id: new_id,
            name: req.body.name,
            country_code: req.body.country_code,
            district: req.body.district,
            population: req.body.population
        }
        if (isNaN(response.population)) {
            res.end("Population is not a number!")
        } else {
            var add_query = "INSERT INTO city VALUES (" + response.id + ", '" + response.name + "', '" + response.country_code +
                "', '" + response.district + "', " + response.population + ")"
            connection.query(add_query, function (err, rows) {
                if (err) throw err
                console.log(rows)
                res.end(JSON.stringify(response))
            })
        }
    })
})

app.get("/DELETE/:id", (request, response) => {
    var id = request.params.id
    console.log("Found site with id: " + id)
    connection.query("DELETE FROM city WHERE ID=" + id, function (error, results, fields) {
        console.log("Looking for entry....")
        if (error) throw error
        if (results.affectedRows > 0) {
            response.send(true)
        } else {
            response.send(false)
        }
    })
})

app.get("/UPDATE/:name/:population", (request, response) => {
    var name = request.params.name
    var population = request.params.population
    if (isNaN(population)) {
        response.send("New population is not a number!")
    } else {
        var sqlquery = "UPDATE city SET Population = " + population + " WHERE Name = '" + name + "'"
        connection.query(sqlquery, function (error, results, fields) {
            if (error) throw error
            connection.query("SELECT * FROM city WHERE Name='" + name + "'", function (error, results, fields) {
                console.log("Looking for entry....")
                if (error) throw error
                response.send(results[0])
            })
        })
    }
})


app.listen(port, () => {
    console.log('App listening on port ' + port + ".")
})
