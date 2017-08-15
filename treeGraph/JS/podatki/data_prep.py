import pandas as pd
from itertools import combinations
from collections import Counter, OrderedDict
import json

data = pd.read_csv('./A10A.csv', sep=',')


def level_1(data, time_interval):

    level_1 = []

    for window in range(time_interval, max(data.days), time_interval):

        min_mask = data['days'] > window - time_interval
        max_mask = data['days'] <= window

        interval = data[min_mask & max_mask]

        ids = list(OrderedDict.fromkeys(interval['id'].values))

        for id in ids:
            mask_id = interval['id'] == id
            d = interval[mask_id]
            level_1.extend(list(set(d.ATC5.values)))

    return [atc for atc, val in Counter(level_1).most_common(10)]


def level_2(data, time_interval, level_1):

    top_100 = []

    for atc in level_1:
        level_2 = []

        for window in range(time_interval, max(data.days), time_interval):

            min_mask = data['days'] > window - time_interval
            max_mask = data['days'] <= window

            interval = data[min_mask & max_mask]

            ids = list(OrderedDict.fromkeys(interval['id'].values))

            for id in ids:
                mask_id = interval['id'] == id
                d = interval[mask_id]
                if level_1[0] in d.ATC5.values:
                    com = [comb for comb in combinations(list(OrderedDict.fromkeys(d.ATC5.values)), 2) if comb[0] == atc and (comb[1], comb[0]) not in top_100]
                    level_2.extend(com)

        top_100.extend([comb for comb, val in Counter(level_2).most_common(10)])

    return top_100


for time in [30, 60, 90, 120]:
    lev_1 = level_1(data, time)
    top_100 = level_2(data, time, lev_1)
    file_name = "A10A" + "_" + str(time) + ".json"
    print(file_name)
    with open(file_name, "w") as file:
        j = {"name": "A10A", "children": [{"name": l1, "children": [{"name": atc} for val, atc in top_100 if val == l1]} for l1 in lev_1]}
        file.write(json.dumps(j))
