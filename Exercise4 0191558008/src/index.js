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


app.get("/", (request, response) => {
    var welcomestring = "Hello, this is the start page for the REST APIs homework!<br/>" +
        "Here are the most important commands: <br/>" +
        "'/READ/(name of city)'     to read the details of a city!<br/>" +
        "'/ADD'     to add another entry to the table 'city,'<br/>" +
        "'/UPDATE/(name of city)/(new population)'  to update the population of an entry in the 'city' table,<br/>" +
        "'/DELETE/(id of city)'  to delete an enty in the 'city' table!"
    response.send(welcomestring)
})


/**
 * @api {get} /READ/:name READ / get city information
 * @apiName ReadCity
 * @apiGroup CRUD
 *
 * @apiParam {String} name The unique name of a city.
 *
 * @apiSuccess {Number} ID ID of the city.
 * @apiSuccess {String} Name  Name of the city.
 * @apiSuccess {String} CountryCode  CountryCode of the user.
 * @apiSuccess {String} District  District of the city.
 * @apiSuccess {Number} Population  Population of the city.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *          "ID":	3068
            "Name":	"Berlin"
            "CountryCode":	"DEU"
            "District":	"Berliini"
            "Population":	3386667
 *     }
 *
 * @apiError /
 *
 * @apiErrorExample Error-Response:
 *      /
 */
app.get("/READ/:name", (request, response) => {
    var name = request.params.name
    console.log("Found site with id: " + name)
    connection.query("SELECT * FROM city WHERE Name='" + name + "'", function (error, results, fields) {
        console.log("Looking for entry....")
        if (error) throw error
        response.send(results[0])
    })
})


/**
 * @api {get} /ADD CREATE / add a new city entry
 * @apiName CreateCity
 * @apiGroup CRUD
 *
 * @apiParam {Number} ID ID of the city.
 * @apiParam {String} Name  Name of the city.
 * @apiParam {String} CountryCode  CountryCode of the user.
 * @apiParam {String} District  District of the city.
 * @apiParam {Number} Population  The updated population of the city.
 *
 * @apiSuccess {Number} ID ID of the added city.
 * @apiSuccess {String} Name  Name of the added city.
 * @apiSuccess {String} CountryCode  CountryCode of the added city.
 * @apiSuccess {String} District  District of the added city.
 * @apiSuccess {Number} Population  Population of the added city.
 *
 * @apiSuccessExample Success-Response:
 *      {"id":4081,"name":"NewCity","country_code":"NewCountryCode","district":"New District","population":"100"}
 *     
 *
 * @apiError WrongPopulationInput The input for population was not a number
 *
 * @apiErrorExample Error-Response:
 *      Population is not a number!
 */
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



/**
 * @api {get} /DELETE/:id DELETE / delete an entry in the city table
 * @apiName DeleteCity
 * @apiGroup CRUD
 *
 * @apiParam {Number} id The unique ID of a city.
 *
 * @apiSuccess {Boolean} Success outcome of operation
 *
 * @apiSuccessExample Success-Response:
 *     true
 *
 * @apiError OperationFailedError Something went wrong during the operation, probably due to incorrect ID
 *
 * @apiErrorExample Error-Response:
 *      false
 */
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


/**
 * @api {get} /UPDATE/:name/:population UPDATE / update population of a city
 * @apiName UpdateCity
 * @apiGroup CRUD
 *
 * @apiParam {String} name The unique name of a city.
 * @apiParam {Number} population The new, updated population of the given city
 *
 * @apiSuccess {Number} ID ID of the city.
 * @apiSuccess {String} Name  Name of the city.
 * @apiSuccess {String} CountryCode  CountryCode of the city.
 * @apiSuccess {String} District  District of the city.
 * @apiSuccess {Number} Population  The updated population of the city.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *          "ID":	4081
            "Name":	"MyCity"
            "CountryCode":	"MyCountryCode"
            "District":	"MyDistrict"
            "Population":	2000
 *     }
 *
 * @apiError /
 *
 * @apiErrorExample Error-Response:
 *      /
 */
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
