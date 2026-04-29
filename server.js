const express = require("express")
const sqlite3 = require("sqlite3")
//sqlite wrapper used as advised by Google Gemini AI in order to adapt the native callback-based sqlite3 into a promise-based interface
// for cleaner code using modern async/await syntax and not having to nest functions to fetch data such that ES6 standards are met
const { open } = require("sqlite")

const app = express() 
const HTTP_PORT = 3000

app.use(express.json()) 
app.use(express.static('public')) //directs user to public/index.html when visiting http://localhost:3000/ and this server.js is running
app.use('/lib', express.static('lib')) //allows html web page to look inside subdirectory 'lib' in order to use local dependencies 

let dbResumes; 

const initDb = async () => {
    try {
        dbResumes = await open({
            filename: './resumes.db', 
            driver: sqlite3.Database 
        })
        console.log("Database connected successfully.") 

        app.listen(HTTP_PORT, () => {
            console.log('Listening on ', HTTP_PORT)
        })
    } catch (objError) {    
        console.log("Error connecting to database: ", objError.message) 
    }
}


//Finally call initilization function to connect to database
initDb()