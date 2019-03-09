#!/usr/bin/env python3
import csv
import json
from pathlib import Path

NAME_KEY = 'Событие'
COUNT_KEY = 'Количество протегированных текстов'
LOCATION_KEY = 'Локация'
WORDS_KEY = 'Слова'
FILENAME = Path(__file__).parent.joinpath('data_raw.csv')
DEST_FILENAME = Path(__file__).parent.joinpath('data.json')

result = []
with open(FILENAME) as file:
    rows = csv.DictReader(file)
    # drop missed locations
    rows = filter(lambda x: x[LOCATION_KEY] != '' and x[COUNT_KEY] != 'int', rows)
    for row in rows:
        event = {'name': row[NAME_KEY], 'value': int(row[COUNT_KEY]), 'location': row[LOCATION_KEY], 'words': str(row[WORDS_KEY]).split(';')}
        result.append(event)

with open(DEST_FILENAME, 'x') as dest:
    json.dump(result, dest, ensure_ascii=False)
