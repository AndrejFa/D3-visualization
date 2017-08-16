# Introduction

Line chart present a fraction of diabetes patients in age groups for every drug group that was prescribed with drugs for diabetes. Patients are separated by gender and confidence interval was calculated for each data point and presented as area around the lines. Sample was splitted in yearly time interval and drugs prescriptions or ATC codes were converted to binary columns for each patient. 

![LineGraph](https://github.com/AndrejFa/D3-visualization/blob/master/img/lineGraph.png)

## Checkboxes

User can choose between 4 types of diabetes patients according to checkbox selection:
- **Double unchecked**, all diabetic patients are included regardless of type of drug for diabetes they were prescribed.
- **Checked one box**, patients prescribed: 
	- Insulins and analogues (ATC drug code, "A10A") or 
	- Blood glocose lowering drugs, excl. insulins ("A10B") were selected.
- **Double checked**, patients prescribed both type of drugs for diabetes are selected.
 
## Dropdown menu

Dropdown menus allow user to select desired drug groups or year. Drugs group are sorted by the number of time they were prescribed with drugs for diabetes, most frequent are the top one. 

## Tooltip

![LineGraphTooltip](https://github.com/AndrejFa/D3-visualization/blob/master/img/lineGraph_tooltip.png)

Tooltip shows on hower over data point and has some summary information:
- number of patients by gender in age group
- number of all patients by gender
- fraction of patient with confidence interval

