import pandas as pd
from itertools import combinations
from collections import Counter, OrderedDict
import json

data = pd.read_csv('./A10B.csv', sep=',')

desc = pd.read_csv('./ATC5codeDescription.csv', sep=',')

data = data[data.days <= 1800]

def level_1(data):
    return [(atc, round(val / data.shape[0] * 100, 2)) for atc, val in Counter(data.ATC5).most_common(10)]

def level_2(data, time_interval, level_1):

    top_100 = []
    val_100 = []
    
    for atc, v in level_1:
        level_2 = []
            
        for window in range(time_interval, 1800, time_interval):
            
            min_mask = data['days'] > window - time_interval
            max_mask = data['days'] <= window 
            
            interval = data[min_mask & max_mask]
            
            ids = list(OrderedDict.fromkeys(interval['id'].values))
            
            for id in ids:
                mask_id = interval['id'] == id
                d = interval[mask_id]
                if atc in d.ATC5.values:
                    com = [comb for comb in combinations(d.ATC5.values, 2) if comb[0] == atc and comb[0] != comb[1] and (comb[1], comb[0]) not in top_100]
                    level_2.extend(com)
        
        top_100.extend([comb for comb, val in Counter(level_2).most_common(10)])
        val_100.extend([round(val / data.shape[0] * 100, 2) for comb, val in Counter(level_2).most_common(10)])
    return list(zip(top_100, val_100))

time = 120
lev_1 = level_1(data)
top_100 = level_2(data, time, lev_1)

for time in [30, 60, 90, 120]:
    lev_1 = level_1(data)
    top_100 = level_2(data, time, lev_1)
    file_name = "A10B" + "_" + str(time) + ".json"
    print(file_name)
    with open(file_name, "w") as file:
        j = {"name":"A10B", "info":["Glucose lowering drugs, excl. insulins", data.shape[0]],"children":[{"name":l1, "info":[desc.ATC5Description.iloc[desc[desc.ATC5 == l1].index[0]],val_1], "children":[{"name":atc[1], "info":[desc.ATC5Description.iloc[desc[desc.ATC5 == atc[1]].index[0]],val]} for atc, val in top_100 if atc[0] == l1]} for l1, val_1 in lev_1]}
        file.write(json.dumps(j))
        