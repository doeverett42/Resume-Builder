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

//JOBS CRUD 
document.querySelector('#btnSaveJob').addEventListener('click', async () => {
    const company = document.getElementById('txtComp').value.trim() 
    const role = document.getElementById('txtRole').value.trim() 
})