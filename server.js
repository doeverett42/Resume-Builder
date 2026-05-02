const { GoogleGenerativeAI } = require("@google/generative-ai")
const express = require("express")
const sqlite3 = require("sqlite3")
//sqlite wrapper used as advised by Google Gemini AI in order to adapt the native callback-based sqlite3 into a promise-based interface
// for cleaner code using modern async/await syntax and not having to nest functions to fetch data such that ES6 standards are met
const { open } = require("sqlite")
//loads .env into process.env 
const dotenv = require('dotenv').config()

const app = express() 
const HTTP_PORT = process.env.HTTP_PORT
// Initialize the Google GenAI client with the API key from our .env file
let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
// identify the model we want to use for story generation
const model = "gemini-3-flash-preview"

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

//Route to optimize job details with Gemini AI
app.post('/api/optimize', async (req,res) => {
    try {
        const {role,details} = req.body 
        const prompt = `Imagine you're an experienced recruiter. Rewrite the following job details for a ${role} to sound highly professional, action-oriented, and tailored for a resume. Keept it concise: ${details}`
        const model = genAI.getGenerativeModel({model: model})  
        const result = await model.generateContent(prompt)
        const response = await result.response 
        const text = response.text()  

        res.status(200).json({outcome:"success", optimizedText: text})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})
    }
})

//tblSettings routes
app.get('/api/settings/:key', async (req,res) => {
    try {
        const strQuery = "SELECT SettingValue FROM tblSettings WHERE SettingKey = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.key])
        if(!objRow)
            res.status(404).json({outcome:"error",message:"API key not found."})
        else 
            res.status(200).json(objRow)
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})
    }
})

//not only add settings to databse but if setting is api key then update ai model
app.post('/api/settings', async (req,res) => {
    const {strKey,strValue} = req.body 
    try {
        const strQuery = "INSERT INTO tblSettings (SettingKey,SettingValue) VALUES (?,?)"
        const objResult = await dbResumes.run(strQuery,[strKey,strValue])
        if(objResult.changes > 0) {
            if(strKey == "GeminiAPIKey")
                genAI = new GoogleGenerativeAI(strValue)
            res.status(201).json({outcome:"success", message:`Setting with id ${strKey} and value ${strValue} was successfully added to tblSettings`})
        }
        else 
            res.status(400).json({outcome:"error",message:"Setting was not created."})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})

    }
})

app.delete('/api/settings/:key', async (req,res) => {
    try {
        const strQuery = "DELETE FROM tblSettings WHERE SettingKey = ?"
        const objResult = await dbResumes.run(strQuery,[req.params.key])
        if(objResult.changes > 0) 
            res.status(200).json({outcome:"success", message:`Setting with id ${req.params.key} was deleted from tblSettings`})
        else 
            res.status(400).json({outcome:"error",message:"Setting was not deleted."})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})
    }
})

//GETs for all resume information
app.get('/api/master/jobs', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblJobs"
        const arrRows = await dbResumes.all(strQuery)
        res.status(200).json({ outcome: "success", data: arrRows })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/skills', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblSkills"
        const arrRows = await dbResumes.all(strQuery)
        res.status(200).json({ outcome: "success", data: arrRows })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/certificates', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblCertificates"
        const arrRows = await dbResumes.all(strQuery)
        res.status(200).json({ outcome: "success", data: arrRows })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/education', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblEducation"
        const arrRows = await dbResumes.all(strQuery)
        res.status(200).json({ outcome: "success", data: arrRows })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/jobs/:id', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblJobs WHERE JobID = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.id])
        if (objRow) 
            res.status(200).json({ outcome: "success", data: objRow })
        else 
            res.status(404).json({ outcome: "error", message: "Job not found." })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/skills/:id', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblSkills WHERE SkillID = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.id])
        if (objRow) 
            res.status(200).json({ outcome: "success", data: objRow })
        else 
            res.status(404).json({ outcome: "error", message: "Skill not found." })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/certificates/:id', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblCertificates WHERE CertID = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.id])
        if (objRow) 
            res.status(200).json({ outcome: "success", data: objRow })
        else 
            res.status(404).json({ outcome: "error", message: "Certificate not found." })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/master/education/:id', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblEducation WHERE EducationID = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.id])
        if (objRow) 
            res.status(200).json({ outcome: "success", data: objRow })
        else 
            res.status(404).json({ outcome: "error", message: "Education entry not found." })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

app.get('/api/resumes', async (req, res) => {
    try {
        const strQuery = "SELECT * FROM tblResumes"
        const arrRows = await dbResumes.all(strQuery)
        res.status(200).json({ outcome: "success", data: arrRows })
    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})

/***********
 * GET to fetch a specific resume and all its associated values in linked tables 
 */
app.get('/api/resumes/full/:id', async (req, res) => {
    const intResumeID = req.params.id

    try {
        //get the main resume title/ID
        const strResumeQuery = "SELECT * FROM tblResumes WHERE ResumeID = ?"
        const objResume = await dbResumes.get(strResumeQuery, [intResumeID])

        if (!objResume) 
            return res.status(404).json({ outcome: "error", message: "Resume not found." })

        //fetch Jobs  
        const strJobsQuery = `SELECT tblJobs.* FROM tblJobs LEFT JOIN tblResumeJobs ON tblJobs.JobID = tblResumeJobs.JobID WHERE tblResumeJobs.ResumeID = ?`
        const arrJobs = await dbResumes.all(strJobsQuery, [intResumeID])

        //fetch Skills
        const strSkillsQuery = `SELECT tblSkills.* FROM tblSkills LEFT JOIN tblResumeSkills ON tblSkills.SkillID = tblResumeSkills.SkillID WHERE tblResumeSkills.ResumeID = ?`
        const arrSkills = await dbResumes.all(strSkillsQuery, [intResumeID])

        //fetch Education
        const strEduQuery = `SELECT tblEducation.* FROM tblEducation LEFT JOIN tblResumeEducation ON tblEducation.EducationID = tblResumeEducation.EducationID WHERE tblResumeEducation.ResumeID = ?`
        const arrEducation = await dbResumes.all(strEduQuery, [intResumeID])

        //fetch Certificates
        const strCertQuery = `SELECT tblCertificates.* FROM tblCertificates LEFT JOIN tblResumeCertificates ON tblCertificates.CertID = tblResumeCertificates.CertID WHERE tblResumeCertificates.ResumeID = ?`
        const arrCertificates = await dbResumes.all(strCertQuery, [intResumeID])

        //group everything together
        const objFullResume = {
            intResumeID: objResume.ResumeID,
            strResumeTitle: objResume.ResumeTitle,
            arrJobs: arrJobs,
            arrSkills: arrSkills,
            arrEducation: arrEducation,
            arrCertificates: arrCertificates
        }

        res.status(200).json({ outcome: "success", data: objFullResume })

    } catch (objError) {
        res.status(500).json({ outcome: "error", message: objError.message })
    }
})


//POSTs for all resume information
app.post('/api/master/jobs', async (req, res) => {
    try {
        const {strCompany, strRole, strDetails} = req.body
        const strQuery = "INSERT INTO tblJobs (Company, Role, Details) VALUES (?, ?, ?)"
        const objResult = await dbResumes.run(strQuery, [strCompany, strRole, strDetails])
        if(objResult.changes > 0)
            res.status(201).json({outcome: "success", message:`Job with id ${objResult.lastID} created.`, intNewID:objResult.lastID})
        else 
            res.status(400).json({outcome:"error", message:"Job was not created."})
    } catch (objError) {
        res.status(500).json({ outcome: "error", message:objError.message})
    }
})

app.post('/api/master/skills', async (req, res) => {
    try {
        const {strSkillName, strCategory} = req.body
        const strQuery = "INSERT INTO tblSkills (SkillName, Category) VALUES (?, ?)"
        const objResult = await dbResumes.run(strQuery, [strSkillName, strCategory])
        
        if (objResult.changes > 0)
            res.status(201).json({outcome:"success", message:`Skill with id ${objResult.lastID} created.`, intNewID: objResult.lastID})
        else 
            res.status(400).json({outcome:"error", message:"Skill was not created."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.post('/api/master/certificates', async (req, res) => {
    try {
        const {strTitle, strIssuer, strIssueDate, strExpirationDate} = req.body
        const strQuery = "INSERT INTO tblCertificates (Title, Issuer, IssueDate, ExpirationDate) VALUES (?, ?, ?, ?)"
        const objResult = await dbResumes.run(strQuery, [strTitle, strIssuer, strIssueDate, strExpirationDate])
        
        if (objResult.changes > 0)
            res.status(201).json({outcome:"success", message:`Certificate with id ${objResult.lastID} created.`, intNewID: objResult.lastID})
        else 
            res.status(400).json({outcome:"error", message:"Certificate was not created."})
    } catch (objError) {
        res.status(500).json({outcome: "error", message:objError.message})
    }
})

app.post('/api/master/education', async (req, res) => {
    try {
        const {strTitle, strStartDate, strEndDate, strHonors} = req.body
        const strQuery = "INSERT INTO tblEducation (Title, StartDate, EndDate, Honors) VALUES (?, ?, ?, ?)"
        const objResult = await dbResumes.run(strQuery, [strTitle, strStartDate, strEndDate, strHonors])
        
        if (objResult.changes > 0)
            res.status(201).json({outcome:"success", message:`Education entry with id ${objResult.lastID} created.`, intNewID: objResult.lastID})
        else 
            res.status(400).json({outcome:"error", message:"Education entry was not created."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

//PUTS for all resume information
app.put('/api/master/jobs', async (req, res) => {
    try {
        const {strJobID, strCompany, strRole, strDetails} = req.body
        const strQuery = "UPDATE tblJobs SET Company = ?, Role = ?, Details = ? WHERE JobID = ?"
        const objResult = await dbResumes.run(strQuery, [strCompany,strRole,strDetails, strJobID])
        
        if (objResult.changes > 0)
            res.status(200).json({outcome:"success", message:`Job ${strJobID} updated.`})
        else 
            res.status(404).json({outcome:"error", message:"Job not found, and no changes made."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.put('/api/master/skills', async (req, res) => {
    try {
        const {strSkillID, strSkillName, strCategory} = req.body
        const strQuery = "UPDATE tblSkills SET SkillName = ?, Category = ? WHERE SkillID = ?"
        const objResult = await dbResumes.run(strQuery, [strSkillName, strCategory, strSkillID])
        
        if (objResult.changes > 0)
            res.status(200).json({outcome:"success", message:`Skill ${strSkillID} updated.`})
        else 
            res.status(404).json({outcome:"error", message:"Skill not found."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.put('/api/master/certificates', async (req, res) => {
    try {
        const {strCertID, strTitle, strIssuer, strIssueDate, strExpirationDate} = req.body
        const strQuery = "UPDATE tblCertificates SET Title = ?, Issuer = ?, IssueDate = ?, ExpirationDate = ? WHERE CertID = ?"
        const objResult = await dbResumes.run(strQuery, [strTitle, strIssuer, strIssueDate, strExpirationDate, strCertID])
        
        if (objResult.changes > 0)
            res.status(200).json({outcome:"success", message:`Certificate ${strCertID} updated.`})
        else 
            res.status(404).json({outcome: "error", message:"Certificate not found."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.put('/api/master/education/:id', async (req, res) => {
    try {
        const {strEducationID, strTitle, strStartDate, strEndDate, strHonors} = req.body
        const strQuery = "UPDATE tblEducation SET Title = ?, StartDate = ?, EndDate = ?, Honors = ? WHERE EducationID = ?"
        const objResult = await dbResumes.run(strQuery, [strTitle, strStartDate, strEndDate, strHonors, strEducationID])
        
        if (objResult.changes > 0)
            res.status(200).json({outcome:"success", message:`Education entry ${strEducationID} updated.`})
        else 
            res.status(404).json({outcome:"error", message:"Education entry not found."})
    } catch (objError) {
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

//DELETEs for all resume information along with corresponding junction tables for saved resume drafts
//use transactions to cascade deletions from main resume info tables as well possible linked resume drafts 
app.delete('/api/master/jobs/:id', async (req, res) => {
    try {
        await dbResumes.run("BEGIN TRANSACTION")

        //remove links in junction table first
        await dbResumes.run("DELETE FROM tblResumeJobs WHERE JobID = ?",[req.params.id])

        //remove actual master record
        const strQuery = "DELETE FROM tblJobs WHERE JobID = ?"
        const objResult = await dbResumes.run(strQuery,[req.params.id])

        if (objResult.changes > 0) {
            await dbResumes.run("COMMIT")
            res.status(200).json({outcome:"success", message:`Job ${req.params.id} and its links deleted.`})
        } else {
            await dbResumes.run("ROLLBACK")
            res.status(404).json({outcome:"error", message:"Job not found."})
        }
    } catch (objError) {
        await dbResumes.run("ROLLBACK")
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.delete('/api/master/skills/:id', async (req, res) => {
    try {
        await dbResumes.run("BEGIN TRANSACTION")

        await dbResumes.run("DELETE FROM tblResumeSkills WHERE SkillID = ?",[req.params.id])

        const strQuery = "DELETE FROM tblSkills WHERE SkillID = ?"
        const objResult = await dbResumes.run(strQuery,[req.params.id])

        if (objResult.changes > 0) {
            await dbResumes.run("COMMIT")
            res.status(200).json({outcome:"success", message:`Skill ${req.params.id} and its links deleted.`})
        } else {
            await dbResumes.run("ROLLBACK")
            res.status(404).json({outcome:"error", message:"Skill not found."})
        }
    } catch (objError) {
        await dbResumes.run("ROLLBACK")
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.delete('/api/master/certificates/:id', async (req, res) => {
    try {
        await dbResumes.run("BEGIN TRANSACTION")

        await dbResumes.run("DELETE FROM tblResumeCertificates WHERE CertID = ?",[req.params.id])

        const strQuery = "DELETE FROM tblCertificates WHERE CertID = ?"
        const objResult = await dbResumes.run(strQuery,[req.params.id])

        if (objResult.changes > 0) {
            await dbResumes.run("COMMIT")
            res.status(200).json({outcome:"success", message:`Certificate ${req.params.id} and its links deleted.`})
        } else {
            await dbResumes.run("ROLLBACK")
            res.status(404).json({outcome:"error", message:"Certificate not found."})
        }
    } catch (objError) {
        await dbResumes.run("ROLLBACK")
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

app.delete('/api/master/education/:id', async (req, res) => {
    try {
        await dbResumes.run("BEGIN TRANSACTION")

        await dbResumes.run("DELETE FROM tblResumeEducation WHERE EducationID = ?", [req.params.id])

        const strQuery = "DELETE FROM tblEducation WHERE EducationID = ?"
        const objResult = await dbResumes.run(strQuery, [req.params.id])

        if (objResult.changes > 0) {
            await dbResumes.run("COMMIT")
            res.status(200).json({outcome:"success", message:`Education entry ${req.params.id} and its links deleted.`})
        } else {
            await dbResumes.run("ROLLBACK");
            res.status(404).json({outcome:"error", message:"Education entry not found."})
        }
    } catch (objError) {
        await dbResumes.run("ROLLBACK")
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

//POST to save a resume; dynamically capturing all possible ids that may be passed in to link one resume to many possible entries in information tables
//https://www.w3schools.com/js/js_loop_forof.asp   had to use for..of because forEach executed all database runs at once rather than waiting
//https://www.geeksforgeeks.org/sqlite/sqlite-transaction/ uses TRANSACTION to rollback in case of potential insert errors and to keep everyting in one post
app.post('/api/resumes/full', async (req, res) => {
    const {strResumeTitle, strResumeObjective, strResumeName, strResumePhone, strResumeEmail, strResumeAddress, arrJobIds, arrSkillIds, arrEduIds, arrCertIds} = req.body

    try {
        await dbResumes.run("BEGIN TRANSACTION")

        //create main resume record
        const strResumeQuery = "INSERT INTO tblResumes (ResumeTitle, ResumeObjective, ResumeName, ResumePhone, ResumeEmail, ResumeAddress) VALUES (?,?,?,?,?,?)"
        const objResumeResult = await dbResumes.run(strResumeQuery,[strResumeTitle,strResumeObjective,strResumeName,strResumePhone,strResumeEmail,strResumeAddress])
        
        //make sure resume row was created before proceeding
        if (objResumeResult.changes > 0) {
            const intResumeID = objResumeResult.lastID

            //loop and post to tblResumeJobs
            if (arrJobIds && arrJobIds.length > 0) {
                for (const intJobID of arrJobIds) {
                    await dbResumes.run("INSERT INTO tblResumeJobs (ResumeID, JobID) VALUES (?, ?)", [intResumeID,intJobID])
                }
            }

            //loop and post to tblResumeSkills
            if (arrSkillIds && arrSkillIds.length > 0) {
                for (const intSkillID of arrSkillIds) {
                    await dbResumes.run("INSERT INTO tblResumeSkills (ResumeID, SkillID) VALUES (?, ?)", [intResumeID,intSkillID])
                }
            }

            //loop and post to tblResumeEducation
            if (arrEduIds && arrEduIds.length > 0) {
                for (const intEduID of arrEduIds) {
                    await dbResumes.run("INSERT INTO tblResumeEducation (ResumeID, EducationID) VALUES (?, ?)", [intResumeID,intEduID])
                }
            }

            //loop and post to tblResumeCertificates
            if (arrCertIds && arrCertIds.length > 0) {
                for (const intCertID of arrCertIds) {
                    await dbResumes.run("INSERT INTO tblResumeCertificates (ResumeID, CertID) VALUES (?, ?)", [intResumeID,intCertID])
                }
            }

            await dbResumes.run("COMMIT")
            res.status(201).json({ 
                outcome: "success", 
                message: `Resume '${strResumeTitle}' and all related links created.`, 
                intNewID: intResumeID 
            })

        } else {
            await dbResumes.run("ROLLBACK")
            res.status(400).json({outcome:"error", message:"Initial resume record could not be created."})
        }

    } catch (objError) {
        //rollback ensures that if one loop fails then no partial data is saved
        await dbResumes.run("ROLLBACK")
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

//DELETE a full resume and all its associated junction table links
//use transactions to ensure data integrity
app.delete('/api/resumes/full/:id', async (req, res) => {
    const intResumeID = req.params.id

    try {
        await dbResumes.run("BEGIN TRANSACTION")

        //delete all links associated with this resume in the junction tables
        await dbResumes.run("DELETE FROM tblResumeJobs WHERE ResumeID = ?", [intResumeID])
        await dbResumes.run("DELETE FROM tblResumeSkills WHERE ResumeID = ?", [intResumeID])
        await dbResumes.run("DELETE FROM tblResumeEducation WHERE ResumeID = ?", [intResumeID])
        await dbResumes.run("DELETE FROM tblResumeCertificates WHERE ResumeID = ?", [intResumeID])

        //delete the main resume record
        const strQuery = "DELETE FROM tblResumes WHERE ResumeID = ?"
        const objResult = await dbResumes.run(strQuery,[intResumeID])

        //check if the resume actually existed
        if (objResult.changes > 0) {
            await dbResumes.run("COMMIT")
            res.status(200).json({ 
                outcome: "success", 
                message: `Resume ${intResumeID} and all its associated links have been deleted.` 
            })
        } else {
            //if no rows changed, the ResumeID didn't exist
            await dbResumes.run("ROLLBACK")
            res.status(404).json({ 
                outcome: "error", 
                message: "Resume not found. No data was deleted." 
            })
        }

    } catch (objError) {
        //rollback any partial deletions if a database error occurs
        await dbResumes.run("ROLLBACK")
        res.status(500).json({ 
            outcome: "error", 
            message: objError.message 
        })
    }
})

//Finally call initilization function to connect to database
initDb()