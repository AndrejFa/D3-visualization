# Introduction

Tree graph present top 10 drug pairs that were prescribed together. Pairs are calculated along all 5 years with time interval selected by the user. Data we prepared with selected time interval window sliding acros 5 years and counting occurence of drugs pairs. Top 10 pairs were selected at the end.

![treeGraph](https://github.com/AndrejFa/D3-visualization/blob/master/img/tree_v1.png)

## Radio buttons

User can choose between 2 types of diabetes patients according diabetes drug type: 
- Insulins and analogues (ATC drug code, "A10A") or 
- Blood glocose lowering drugs, excl. insulins ("A10B") were selected.

Patients received both drugs are inside patients received A10A because once patient receive insulins drugs it has most severe type of diabetes.

## Time interval slider

User can select 4 time interval window:
- 30 days
- 60 days
- 90 days
- 120 days

## Tooltip 

![treeGraphTooltip](https://github.com/AndrejFa/D3-visualization/blob/master/img/tree_v1_tooltip.png)

Tooltip present node ATC code description together with percentage of that drug in that node and in leaf nodes percentage of pairs in that node. 