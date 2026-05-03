loadJobs()

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
                                <p>Details: ${job.Details}</p>
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

//JOBS CRUD 
document.querySelector('#btnSaveJob').addEventListener('click', async () => {
    const company = document.getElementById('txtComp').value.trim()
    const role = document.getElementById('txtRole').value.trim()
    const details = quillDetails.root.innerHTML
    const rawText = quillDetails.getText().trim()
    const id = document.getElementById('txtJobID').value.trim()

    if(!validateInput([{name:'Company Name',value:company},{name:'Job Title',value:role},{name:'Details',value:rawText}]))
        return 

    try {
        const response = await fetch('/api/master/jobs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({strCompany:company, strRole:role, strDetails:details})
        })
        const data = await response.json() 
        if(data.outcome == 'success') {
            document.getElementById('txtComp').value = ''
            document.getElementById('txtRole').value = ''
            quillDetails.setContents([])
            document.getElementById('txtJobID').value = ''
            loadJobs() 
        }
    } catch (objError) {
        console.error('Jobs error: ', objError)
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
            }            
        }
    }
})
