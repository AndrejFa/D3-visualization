# Repository of D3.js visualization

This repository have 3 D3.js visualization that were implemented under project: *MODEL FOR EARLY DETECTION OF DIABETES TYPE 2* [MODEST]("http://www.ri.fzv.um.si/modest2/index.html") in Faculty of health science at University of Maribor, Slovenia. Project was conducted in collaboration 
with Nova Vizija d.d.. Each visualization was stand alone project. 

## Database

Database present patients medical history from 2011 to 2015 year. It has information about medical instutions, doctors, medical procedure costs and drug prescriptions for each patients for each visit in medical instution on five year interval. We were focused on patient with diabetes. Visualization are implemented on 100000 records sample.  

## Usage
Download repository to a selected folder and `unzip` or with `git` version control commands (`git clone <URL>`). Navigate to unzip or cloned folder with `cd` and establish simple server:
```
python3 -m http.server 
```
Select desired graph folder and open an **.html** file.

## Acnowledgement
-Matjaž Grosek for tips and help with implementation.