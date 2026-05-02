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

