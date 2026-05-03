//Load all data on startup
loadJobs()
loadSkills()
loadEducation()
loadCertifications() 

/**
 *      NAVIGATION FUNCTIONALITY
 */

//helper function to hide all UI sections before showing the selection
function hideAllSections() {
    document.querySelector('#divHome').classList.add('hidden')
    document.querySelector('#divSettings').classList.add('hidden')
    document.querySelector('#divMaster').classList.add('hidden')
    document.querySelector('#divBuild').classList.add('hidden')
    document.querySelector('#divView').classList.add('hidden')
}

//handler for the Home navigation button
document.querySelector('#btnNavHome').addEventListener('click', () => {
    hideAllSections()
    document.querySelector('#divHome').classList.remove('hidden')
})

//handler for the Settings navigation button
document.querySelector('#btnNavSettings').addEventListener('click', () => {
    hideAllSections()
    document.querySelector('#divSettings').classList.remove('hidden')
})

//handler for the Records navigation button
document.querySelector('#btnNavRecords').addEventListener('click', () => {
    hideAllSections()
    document.querySelector('#divMaster').classList.remove('hidden')
})

//handler for the Build navigation button
document.querySelector('#btnNavBuild').addEventListener('click', () => {
    hideAllSections()
    document.querySelector('#divBuild').classList.remove('hidden')
})

//handler for the View navigation button
document.querySelector('#btnNavView').addEventListener('click', () => {
    hideAllSections()
    document.querySelector('#divView').classList.remove('hidden')
})

//handler for the "Get Started" button on the Home screen
document.querySelector('#btnHomeStart').addEventListener('click', () => {
    hideAllSections()
    //takes user directly to the Data Repository to begin entry
    document.querySelector('#divMaster').classList.remove('hidden')
})

//credit popup for external libraries
document.getElementById('btnCredits').addEventListener('click', () => {
    Swal.fire({
        title: 'Project Acknowledgments',
        icon: 'info',
        html: `
            <div class="text-start">
                <p>This page was built with the following:</p>
                <p style="font-size:small;">Bootstrap 5</p>
                <p style="font-size:small;">Bootstrap Icons</p>
                <p style="font-size:small;">SweetAlert2</p>
                <p style="font-size:small;">Express.js</p>
                <p style="font-size:small;">SQLite & SQLite3</p>
                <p style="font-size:small;">Dotenv</p>
                <p style="font-size:small;">Google Generative AI</p>
            </div>
        `
    })
})

/**
 *      Quill.js Initialization for Job Details and Resume Objective 
 */
const quillDetails = new Quill('#txtDetails', {
    theme: 'snow',
    placeholder: 'Describe your job responsibilities...', 
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
})

const quillObjective = new Quill('#txtResObjective', {
    theme: 'snow',
    placeholder: 'Describe yourself and goal...', 
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
})

/**
 *      INPUT FUNCTIONALITY 
 */
//helper function to display popup for empty inputs & return false if fields missing and true otherwise 
function validateInput(fields) {
    let missing = [] 
    fields.forEach(field => {
        if(!field.value || field.value.trim() === '') 
            missing.push(field.name)
    })

    if(missing.length > 0) {
        Swal.fire({
            title: 'Missing Information',
            text: `Please fill out the following fields: ${missing.join(', ')}`,
            icon: 'warning'
        })
        return false 
    }
    return true 
}

//settings API key configuration 
document.querySelector('#btnSaveKey').addEventListener('click', async () => {
    const apiKey = document.getElementById('txtApiKey').value 
    if(!validateInput([{name: 'GeminiAPIKey', value: apiKey}]))
        return 

    try {
        //check to see if a key already exists in the database and delete if so 
        const responseCheckKey = await fetch('api/settings/GeminiAPIKey', {method: 'GET'})
        const dataCheckKey = await responseCheckKey.json() 

        if(dataCheckKey && dataCheckKey.SettingValue) {
            const responseDelete = await fetch('api/settings/GeminiAPIKey', {method: 'DELETE'})
            const dataDelete = await responseDelete.json() 

            if(dataDelete.outcome != 'success')
                throw new Error('Failed to clear old API key: ', dataDelete.message) 
        }

        //save new api key
        const response = await fetch('api/settings', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strKey:'GeminiAPIKey', strValue: apiKey})
        })

        const data = await response.json() 
        
        if(data.outcome == 'success') {
            Swal.fire({title:'Success',text:'API Key saved. AI is ready to use!',icon:'success'})
            document.getElementById('txtApiKey').value = ''
        } else 
            Swal.fire({title:'Error',text:data.message,icon:'error'})
    } catch (objError) {
        console.error('Settings error: ', objError)
    }
})

//function to load the jobs in the Records and Build page 
async function loadJobs() {
    const response = await fetch('/api/master/jobs')
    const result = await response.json() 
    const arrJobs = result.data

    let htmlSettings = ''
    let htmlBuild = ''

    arrJobs.forEach(job => {
        //Build manage view
        htmlSettings += `
            <div class="border-bottom mb-2 pb-2">
                <strong>${job.Role}</strong>
                <div class="d-flex justify-content-center flex-wrap mt-1">
                    <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divJob${job.JobID}" aria-expanded="false" aria-controls="#divJob${job.JobID}">View Job</button>
                    <div class="collapse col-12 mb-2" id="divJob${job.JobID}">
                        <div class="card">
                            <div class="card-body">
                                <p>Company: ${job.Company}</p>
                                <p>Role: ${job.Role}</p>
                                <span>Details:
                                    <div class="ql-snow">
                                        <div class="ql-editor" style="padding: 0;">
                                            ${job.Details}
                                        </div>
                                    </div>
                                </span>
                            </div> 
                        </div>
                    </div> 
                    <button class="btn btn-sm btn-outline-danger" id="btnDeleteJob${job.JobID}">Delete</button>
                </div>
            </div>`
        
        //Build checkbox view for resume builder
        htmlBuild += `
            <div class="col">
                <div class="card h-100 shadow-sm p-2">
                    <div class="form-check">
                        <input class="form-check-input chk-job" type="checkbox" value="${job.JobID}" id="chkJob${job.JobID}">
                        <label class="form-check-label" for="chkJob${job.JobID}">
                            <strong>${job.Role}</strong><br>
                            <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divJob${job.JobID}" aria-expanded="false" aria-controls="#divJob${job.JobID}">View Job</button>
                            <div class="collapse" id="divJob${job.JobID}">
                                <div class="card">
                                    <div class="card-body">
                                        <p>Company: ${job.Company}</p>
                                        <p>Role: ${job.Role}</p>
                                        <p>Details: ${job.Details}</p>
                                    </div> 
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>`
    })

    document.getElementById('divManageJobs').innerHTML = htmlSettings || '<p class="text-muted small">No jobs saved.</p>'
    document.getElementById('divJobGrid').innerHTML = htmlBuild || '<p class="text-muted small">No jobs saved.</p>'
}

//function to load the skills in the Records an Build page 
async function loadSkills() {
    const response = await fetch('/api/master/skills')
    const result = await response.json() 
    const arrSkills = result.data

    let htmlSettings = ''
    let htmlBuild = ''

    arrSkills.forEach(skill => {
        //Build manage view
        htmlSettings += `
            <div class="border-bottom mb-2 pb-2">
                <strong>${skill.SkillName}</strong>
                <div class="d-flex justify-content-center flex-wrap mt-1">
                    <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divSkill${skill.SkillID}" aria-expanded="false" aria-controls="#divSkill${skill.SkillID}">View Skill</button>
                    <div class="collapse col-12 mb-2" id="divSkill${skill.SkillID}">
                        <div class="card">
                            <div class="card-body">
                                <p>Category: ${skill.Category}</p>
                            </div> 
                        </div>
                    </div> 
                    <button class="btn btn-sm btn-outline-danger" id="btnDeleteSkill${skill.SkillID}">Delete</button>
                </div>
            </div>`
        
        //Build checkbox view for resume builder
        htmlBuild += `
            <div class="col">
                <div class="card h-100 shadow-sm p-2">
                    <div class="form-check">
                        <input class="form-check-input chk-job" type="checkbox" value="${skill.SkillID}" id="chkSkill${skill.SkillID}">
                        <label class="form-check-label" for="chkSkill${skill.SkillID}">
                            <strong>${skill.SkillName}</strong><br>
                            <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divSkill${skill.SkillID}" aria-expanded="false" aria-controls="#divSkill${skill.SkillID}">View Skill</button>
                            <div class="collapse col-12 mb-2" id="divSkill${skill.SkillID}">
                                <div class="card">
                                    <div class="card-body">
                                        <p>Category: ${skill.Category}</p>
                                    </div> 
                                </div>
                            </div> 
                        </label>
                    </div>
                </div>
            </div>`
    })

    document.getElementById('divManageSkills').innerHTML = htmlSettings || '<p class="text-muted small">No skills saved.</p>'
    document.getElementById('divSkillGrid').innerHTML = htmlBuild || '<p class="text-muted small">No skills saved.</p>'
}

//function to load the education in the Records and Build page 
async function loadEducation() {
    const response = await fetch('/api/master/education')
    const result = await response.json() 
    const arrEducation = result.data

    let htmlSettings = ''
    let htmlBuild = ''

    arrEducation.forEach(edu => {
        //Build manage view
        htmlSettings += `
            <div class="border-bottom mb-2 pb-2">
                <strong>${edu.Title}</strong>
                <div class="d-flex justify-content-center flex-wrap mt-1">
                    <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divEdu${edu.EducationID}" aria-expanded="false" aria-controls="#divEdu${edu.EducationID}">View Education</button>
                    <div class="collapse col-12 mb-2" id="divEdu${edu.EducationID}">
                        <div class="card">
                            <div class="card-body">
                                <p>Title: ${edu.Title}</p>
                                <p>Start Date: ${edu.StartDate}</p>
                                <p>End Date: ${edu.EndDate}</p>
                                <p>Honors: ${edu.Honors}</p>
                            </div> 
                        </div>
                    </div> 
                    <button class="btn btn-sm btn-outline-danger" id="btnDeleteEdu${edu.EducationID}">Delete</button>
                </div>
            </div>`
        
        //Build checkbox view for resume builder
        htmlBuild += `
            <div class="col">
                <div class="card h-100 shadow-sm p-2">
                    <div class="form-check">
                        <input class="form-check-input chk-job" type="checkbox" value="${edu.EducationID}" id="chkEdu${edu.EducationID}">
                        <label class="form-check-label" for="chkEdu${edu.EducationID}">
                            <strong>${edu.Title}</strong><br>
                            <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divEdu${edu.EducationID}" aria-expanded="false" aria-controls="#divEdu${edu.EducationID}">View Education</button>
                            <div class="collapse col-12 mb-2" id="divEdu${edu.EducationID}">
                                <div class="card">
                                    <div class="card-body">
                                        <p>Title: ${edu.Title}</p>
                                        <p>Start Date: ${edu.StartDate}</p>
                                        <p>End Date: ${edu.EndDate}</p>
                                        <p>Honors: ${edu.Honors}</p>
                                    </div> 
                                </div>
                            </div> 
                        </label>
                    </div>
                </div>
            </div>`
    })

    document.getElementById('divManageEdu').innerHTML = htmlSettings || '<p class="text-muted small">No education saved.</p>'
    document.getElementById('divEduGrid').innerHTML = htmlBuild || '<p class="text-muted small">No education saved.</p>'
}

//function to load the education in the Records and Build page 
async function loadCertifications() {
    const response = await fetch('/api/master/certificates')
    const result = await response.json() 
    const arrCerts = result.data

    let htmlSettings = ''
    let htmlBuild = ''

    arrCerts.forEach(cert => {
        //Build manage view
        htmlSettings += `
            <div class="border-bottom mb-2 pb-2">
                <strong>${cert.Title}</strong>
                <div class="d-flex justify-content-center flex-wrap mt-1">
                    <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divCert${cert.CertID}" aria-expanded="false" aria-controls="#divCert${cert.CertID}">View Certificate</button>
                    <div class="collapse col-12 mb-2" id="divCert${cert.CertID}">
                        <div class="card">
                            <div class="card-body">
                                <p>Title: ${cert.Title}</p>
                                <p>Issuer: ${cert.Issuer}</p>
                                <p>Issue Date: ${cert.IssueDate}</p>
                                <p>Expiration Date: ${cert.ExpirationDate}</p>
                            </div> 
                        </div>
                    </div> 
                    <button class="btn btn-sm btn-outline-danger" id="btnDeleteCert${cert.CertID}">Delete</button>
                </div>
            </div>`
        
        //Build checkbox view for resume builder
        htmlBuild += `
            <div class="col">
                <div class="card h-100 shadow-sm p-2">
                    <div class="form-check">
                        <input class="form-check-input chk-job" type="checkbox" value="${cert.CertID}" id="chkCert${cert.CertID}">
                        <label class="form-check-label" for="chkCert${cert.CertID}">
                            <strong>${cert.Title}</strong><br>
                            <button class="btn btn-outline-info btn-sm col-12 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#divCert${cert.CertID}" aria-expanded="false" aria-controls="#divCert${cert.CertID}">View Certificate</button>
                            <div class="collapse col-12 mb-2" id="divCert${cert.CertID}">
                                <div class="card">
                                    <div class="card-body">
                                        <p>Title: ${cert.Title}</p>
                                        <p>Issuer: ${cert.Issuer}</p>
                                        <p>Issue Date: ${cert.IssueDate}</p>
                                        <p>Expiration Date: ${cert.ExpirationDate}</p>
                                    </div> 
                                </div>
                            </div> 
                        </label>
                    </div>
                </div>
            </div>`
    })

    document.getElementById('divManageCerts').innerHTML = htmlSettings || '<p class="text-muted small">No certifications saved.</p>'
    document.getElementById('divCertGrid').innerHTML = htmlBuild || '<p class="text-muted small">No certifications saved.</p>'
}

//Jobs Create
document.querySelector('#btnSaveJob').addEventListener('click', async () => {
    const strCompany = document.getElementById('txtComp').value.trim()
    const strRole = document.getElementById('txtRole').value.trim()
    const strDetails = quillDetails.root.innerHTML
    const strRawText = quillDetails.getText().trim()

    if(!validateInput([{name:'Company Name',value:strCompany},{name:'Job Title',value:strRole},{name:'Details',value:strRawText}]))
        return 

    try {
        const response = await fetch('/api/master/jobs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strCompany:strCompany, strRole:strRole, strDetails:strDetails})
        })
        const data = await response.json() 
        if(data.outcome == 'success') {
            document.getElementById('txtComp').value = ''
            document.getElementById('txtRole').value = ''
            quillDetails.setContents([])
            loadJobs() 
        }
    } catch (objError) {
        console.error('Jobs error: ', objError)
    }
})

//Skills Create
document.querySelector('#btnSaveSkill').addEventListener('click', async () => {
    const strName = document.getElementById('txtSkillName').value.trim()
    const strCategory = document.getElementById('txtSkillCat').value.trim()

    if(!validateInput([{name:'Skill Name',value:strName},{name:'Skill Category',value:strCategory}]))
        return 

    try {
        const response = await fetch('/api/master/skills', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strSkillName:strName, strCategory:strCategory})
        })
        const data = await response.json() 
        if(data.outcome == 'success') {
            document.getElementById('txtSkillName').value = ''
            document.getElementById('txtSkillCat').value = ''
            loadSkills() 
        }
    } catch (objError) {
        console.error('Skills error: ', objError)
    }
})

//Education Create
document.querySelector('#btnSaveEdu').addEventListener('click', async () => {
    const strTitle = document.getElementById('txtEduTitle').value.trim()
    const strStart = document.getElementById('txtEduStart').value.trim()
    const strEnd = document.getElementById('txtEduEnd').value.trim()
    const strHonors = document.getElementById('txtEduHonors').value.trim()

    if(!validateInput([{name:'Education Title',value:strTitle},{name:'Start Date',value:strStart},{name:'End Date',value:strEnd},{name:'Honors',value:strHonors}]))
        return 

    try {
        const response = await fetch('/api/master/education', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strTitle:strTitle,strStartDate:strStart,strEndDate:strEnd,strHonors:strHonors})
        })
        const data = await response.json() 
        if(data.outcome == 'success') {
            document.getElementById('txtEduTitle').value = ''
            document.getElementById('txtEduStart').value = ''
            document.getElementById('txtEduEnd').value = ''
            document.getElementById('txtEduHonors').value = ''
            loadEducation() 
        }
    } catch (objError) {
        console.error('Education error: ', objError)
    }
})

//Certification Create
document.querySelector('#btnSaveCert').addEventListener('click', async () => {
    const strTitle = document.getElementById('txtCertTitle').value.trim()
    const strIssuer = document.getElementById('txtCertIssuer').value.trim()
    const strIssueDate = document.getElementById('txtCertIssueDate').value.trim()
    const strExpDate = document.getElementById('txtCertExpDate').value.trim()
    

    if(!validateInput([{name:'Certification Title',value:strTitle},{name:'Issuer',value:strIssuer},{name:'Issue Date',value:strIssueDate},{name:'Expiration Date',value:strExpDate}]))
        return 

    try {
        const response = await fetch('/api/master/certificates', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strTitle:strTitle,strIssuer:strIssuer,strIssueDate:strIssueDate,strExpirationDate:strExpDate})
        })
        const data = await response.json() 
        if(data.outcome == 'success') {
            document.getElementById('txtCertTitle').value = ''
            document.getElementById('txtCertIssuer').value = ''
            document.getElementById('txtCertIssueDate').value = ''
            document.getElementById('txtCertExpDate').value = ''
            loadCertifications() 
        }
    } catch (objError) {
        console.error('Education error: ', objError)
    }
})

//Master Resume Info Deleter
document.querySelector('#divMaster').addEventListener('click', async (objEvent) => {
    const strElementID = objEvent.target.id 
    let strType = ''
    let intID = ''

    if(strElementID.includes('btnDelete')) {
        if(strElementID.includes('btnDeleteJob')) {
            strType = 'jobs'
            intID = strElementID.replace('btnDeleteJob', '')
        } else if(strElementID.includes('btnDeleteSkill')) {
            strType = 'skills'
            intID = strElementID.replace('btnDeleteSkill', '')
        } else if(strElementID.includes('btnDeleteCert')) {
            strType = 'certificates'
            intID = strElementID.replace('btnDeleteCert', '')
        } else if(strElementID.includes('btnDeleteEdu')) {
            strType = 'education'
            intID = strElementID.replace('btnDeleteEdu', '')
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will also remove this item from any saved resumes!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        })

        if(result.isConfirmed) {
            const response = await fetch(`api/master/${strType}/${intID}`, {method:'DELETE'})
            const data = await response.json() 
            if(data.outcome == 'success') {
                loadJobs() 
                loadSkills()
                loadEducation()
                loadCertifications()
            }            
        }
    }
})

/**
 *      AI Optimizers Functionality 
 */
//Job Details Optimizer 
document.querySelector('#btnJobReviewAI').addEventListener('click', async (objEvent) => {
    const btnOptimize = objEvent.target
    const divAiOutput = document.getElementById('divJobAiOutput')
    const strRole = document.getElementById('txtRole').value.trim()
    const strDetails = quillDetails.getText().trim()

    if(!validateInput([{name:'Job Title',value:strRole},{name:'Details',value:strDetails}]))
        return

    //invalidate optmize button while ai is generating output 
    btnOptimize.disabled = true 
    btnOptimize.innerHTML = '<span class="spinner-border text-info spinner-border-sm"></span>'
    divAiOutput.classList.remove('hidden')
    divAiOutput.innerHTML = 'Optimizing...'

    const strPrompt = `Imagine you're an experienced recruiter. Rewrite the following job details for a ${strRole} to sound highly professional, action-oriented, and tailored for a resume. Keept it concise: ${strDetails}`

    try {
        const response = await fetch('/api/optimize', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strPrompt:strPrompt})
        })
        const data = await response.json() 

        if(data.outcome == 'success') {
            quillDetails.root.innerHTML = data.optimizedText
            divAiOutput.innerHTML = 'Optimization complete!'
            setTimeout(() => divAiOutput.classList.add('hidden'), 3000)
        } else 
            throw new Error(data.message)
    } catch (objError) {
        divAiOutput.innerHTML = `Error: ${objError.message}`
        divAiOutput.classList.replace('alert-info', 'alert-danger')
    } finally {
        btnOptimize.disabled = false
        btnOptimize.innerHTML = 'Optimize with AI'
    }
})

//Resume Objective Optimizer
document.querySelector('#btnObjReviewAI').addEventListener('click', async (objEvent) => {
    const btnOptimize = objEvent.target
    const divAiOutput = document.getElementById('divObjAiOutput')
    const strRole = document.getElementById('txtResTitle').value.trim()
    const strObjective = quillObjective.getText().trim()

    if(!validateInput([{name:'Job Target',value:strRole},{name:'Objective',value:strObjective}]))
        return

    //invalidate optmize button while ai is generating output 
    btnOptimize.disabled = true 
    btnOptimize.innerHTML = '<span class="spinner-border text-info spinner-border-sm"></span>'
    divAiOutput.classList.remove('hidden')
    divAiOutput.innerHTML = 'Optimizing...'

    const strPrompt = `You're an expert career coach. Rewrite the following resume objective for a ${strRole} candidate. Transform it into a concise, 2-3 sentence 'Professional Summary' and defined goal that leads with strongest skills and demonstrates immediate value to a potential employer. Use active verbs and remove first-person pronouns (no 'I' or 'me'). Keep it under 50 words: ${strObjective}`

    try {
        const response = await fetch('/api/optimize', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strPrompt:strPrompt})
        })
        const data = await response.json() 

        if(data.outcome == 'success') {
            quillObjective.root.innerHTML = data.optimizedText
            divAiOutput.innerHTML = 'Optimization complete!'
            setTimeout(() => divAiOutput.classList.add('hidden'), 3000)
        } else 
            throw new Error(data.message)
    } catch (objError) {
        divAiOutput.innerHTML = `Error: ${objError.message}`
        divAiOutput.classList.replace('alert-info', 'alert-danger')
    } finally {
        btnOptimize.disabled = false
        btnOptimize.innerHTML = 'Optimize with AI'
    }
})