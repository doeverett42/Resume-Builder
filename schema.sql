-- schema.sql
-- table to store user's ai api key
CREATE TABLE tblSettings (
    SettingKey TEXT NOT NULL, 
    SettingValue TEXT NOT NULL, 
    PRIMARY KEY(SettingKey)
);

CREATE TABLE tblJobs (
    JobID INTEGER, 
    Company TEXT NOT NULL, 
    Role TEXT NOT NULL, 
    StartDate TEXT NOT NULL,
    EndDate TEXT NOT NULL,
    Details TEXt NOT NULL, 
    PRIMARY KEY("JobID" AUTOINCREMENT)
);

CREATE TABLE tblSkills (
    SkillID INTEGER, 
    SkillName TEXT NOT NULL, 
    Category TEXT NOT NULL, 
    PRIMARY KEY("SkillID" AUTOINCREMENT)
);

CREATE TABLE tblCertificates (
    CertID INTEGER, 
    Title TEXT NOT NULL, 
    Issuer TEXT NOT NULL, 
    IssueDate TEXT NOT NULL,
    ExpirationDate TEXT NOT NULL, 
    PRIMARY KEY("CertID" AUTOINCREMENT) 
);

CREATE TABLE tblEducation (
    EducationID INTEGER, 
    Title TEXT NOT NULL, 
    StartDate TEXT NOT NULL, 
    EndDate TEXT NOT NULL, 
    Honors TEXT, 
    PRIMARY KEY("EducationID" AUTOINCREMENT)
);

-- table for saving created resumes & subsequent ones for linking one to many things to a resume
CREATE TABLE tblResumes (
    ResumeID INTEGER, 
    ResumeTitle TEXT NOT NULL, 
    ResumeObjective TEXT NOT NULL,
    ResumeName TEXT NOT NULL,
    ResumePhone TEXT NOT NULL, 
    ResumeEmail TEXT NOT NULL,
    ResumeAddress TEXT NOT NULL,
    PRIMARY KEY("ResumeID" AUTOINCREMENT)
);

CREATE TABLE tblResumeJobs (
    ResumeID INTEGER, 
    JobID INTEGER, 
    PRIMARY KEY(ResumeID, JobID), 
    FOREIGN KEY(ResumeID) REFERENCES tblResumes(ResumeID), 
    FOREIGN KEY(JobID) REFERENCES tblJobs(JobID) 
);

CREATE TABLE tblResumeSkills (
    ResumeID INTEGER, 
    SkillID INTEGER, 
    PRIMARY KEY(ResumeID, SkillID), 
    FOREIGN KEY(ResumeID) REFERENCES tblResumes(ResumeID), 
    FOREIGN KEY(SkillID) REFERENCES tblSkills(SkillID)
);

CREATE TABLE tblResumeCertificates (
    ResumeID INTEGER, 
    CertID INTEGER, 
    PRIMARY KEY(ResumeID, CertID), 
    FOREIGN KEY(ResumeID) REFERENCES tblResumes(ResumeID), 
    FOREIGN KEY(CertID) REFERENCES tblCertificates(CertID)
);

CREATE TABLE tblResumeEducation (
    ResumeID INTEGER, 
    EducationID INTEGER, 
    PRIMARY KEY(ResumeID, EducationID), 
    FOREIGN KEY(ResumeID) REFERENCES tblResumes(ResumeID), 
    FOREIGN KEY(EducationID) REFERENCES tblEducation(EducationID)
);