# Introduction

Tree graph presents top 10 drug pairs that were prescribed together. Due to long computational time we limit time interval to 120 days. Later time interval present drug prescription time for diabetes patients. Pairs a-b and b-a are equal, first that occur is considered.

![treeGraph](https://github.com/AndrejFa/D3-visualization/blob/master/img/tree.png)

## Radio buttons

User can choose between 2 types of diabetes patients according diabetes drug type: 
- Insulins and analogues (ATC drug code, "A10A") or 
- Blood glocose lowering drugs, excl. insulins ("A10B") were selected.

Patients received both drugs are inside patients received A10A because once patient receive insulins drugs it has most severe type of diabetes.

## Time interval slider

User can select 120 days interval inside 5 years. 