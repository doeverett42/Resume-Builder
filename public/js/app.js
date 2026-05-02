//helper function to hide all UI sections before showing the selection
function hideAllSections() {
    document.querySelector('#divHome').classList.add('hidden')
    document.querySelector('#divSettings').classList.add('hidden')
    document.querySelector('#divMaster').classList.add('hidden')
    document.querySelector('#divBuild').classList.add('hidden')
    document.querySelector('#secView').classList.add('hidden')
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
    document.querySelector('#secView').classList.remove('hidden')
})

//handler for the "Get Started" button on the Home screen
document.querySelector('#btnHomeStart').addEventListener('click', () => {
    hideAllSections()
    //takes user directly to the Data Repository to begin entry
    document.querySelector('#divMaster').classList.remove('hidden')
})