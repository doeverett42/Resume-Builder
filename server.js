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

//tblSettings routes
app.get('/api/settings/:key', async (req,res) => {
    try {
        const strQuery = "SELECT SettingValue FROM tblSettings WHERE SettingKey = ?"
        const objRow = await dbResumes.get(strQuery, [req.params.key])
        if(objRow < 1)
            res.status(404).json({outcome:"error",message:"API key not found."})
        else 
            res.status(200).json(objRow)
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})
    }
})

app.post('/api/settings', async (req,res) => {
    const {strKey,strValue} = req.body 
    try {
        strQuery = "INSERT INTO tblSettings (SettingKey,SettingValue) VALUES (?,?)"
        await dbResumes.run(strQuery,[strKey,strValue])
        if(objResult.changes > 0)
            res.status(201).json({outcome:"success", message:`Setting with id ${strKey} and value ${strValue} was successfully added to tblSettings`})
        else 
            res.status(400).json({outcome:"error",message:"Setting was not created."})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})

    }
})

app.put('/api/settings', async (req,res) => {
    const {strKey, strValue} = req.body 
    try {
        strQuery = "UPDATE tblSettings SET SettingValue = ? WHERE SettingKey = ?"
        await dbResumes.run(strQuery,[strValue,strKey])
        if(objResult.changes > 0)
            res.status(201).json({outcome:"success", message:`Setting with id ${strKey} was successfully updated`})
        else
            res.status(400).json({outcome:"error",message:"Setting was not updated."})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})

    }
})

app.delete('/api/settings', async (req,res) => {
    const strKey = req.body 
    try {
        strQuery = "DELETE FROM tblSettings WHERE SettingKey = ?"
        await dbResumes.run(strQuery,[strKey])
        if(objResult.changes > 0) 
            res.status(201).json({outcome:"success", message:`Setting with id ${strKey} was deleted from tblSettings`})
        else 
            res.status(400).json({outcome:"error",message:"Setting was not deleted."})
    } catch (objError) {
        res.status(500).json({outcome:"error",message:objError.message})
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
    const {strResumeTitle, arrJobIds, arrSkillIds, arrEduIds, arrCertIds} = req.body

    try {
        await dbResumes.run("BEGIN TRANSACTION")

        //create main resume record
        const strResumeQuery = "INSERT INTO tblResumes (ResumeTitle) VALUES (?)"
        const objResumeResult = await dbResumes.run(strResumeQuery,[strResumeTitle])
        
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
            });

        } else {
            await dbResumes.run("ROLLBACK");
            res.status(400).json({outcome:"error", message:"Initial resume record could not be created."})
        }

    } catch (objError) {
        //rollback ensures that if one loop fails then no partial data is saved
        await dbResumes.run("ROLLBACK");
        res.status(500).json({outcome:"error", message:objError.message})
    }
})

//Finally call initilization function to connect to database
initDb()