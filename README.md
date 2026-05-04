# Resume-Builder
A web application to run locally for storing resume related information and automate the process of formatting new resumes, saving them, and printing them. 

## Prerequisites

- Git   https://git-scm.com/downloads
- Node.js   https://nodejs.org/
- A Google Gemini AI Studio API key if you want to use the AI optimization features

## Steps 
1. Clone repo 
- git clone https://github.com/doeverett42/Resume-Builder.git
- cd Resume-Builder
2. Install Node dependences  
- npm install 
3. Create .env file 
- .env file should be in project root containing: 
HTTP_PORT=your_port
GEMINI_MODEL=gemini-3-flash-preview_or_your_base_model
GEMINI_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE
4. Create and initialize SQLite databse 
- The project expects a local file in root named resumes.db created from schema.sql
5. Start Application 
- npm start

## Lighthouse Score
- Desktop Accessibility: 95
- Mobile Accessibility: 95

## Usage for other students
- It is okay to share my project with other students to help with developing resumes 