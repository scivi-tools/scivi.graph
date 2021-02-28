#!/usr/bin/env python3
# -*- coding: utf-8 -*-


arr1 = [ \
    "БРАННАЯ ЛЕКСИКА", \
    "ОБСЦЕННАЯ ЛЕКСИКА", \
    "СНИЖЕННАЯ ЛЕКСИКА", \
    "ЭВФЕМИЗМЫ БРАНИ", \
    "ЖАНРЫ", \
    "ЖАНРЫ СТИМУЛЬНЫЕ", \
    "ЖАНРЫ РЕАКТИВНЫЕ", \
    "ВОЗДЕЙСТВИЕ", \
    "ПОБУЖДЕНИЕ", \
    "ПОРИЦАНИЕ", \
    "ПРЕДОСТЕРЕЖЕНИЕ", \
    "ПРИВЕТСТВИЕ", \
    "ПРИГЛАШЕНИЕ", \
    "ПРИКАЗ", \
    "ПРОСЬБА", \
    "ПРОЩАНИЕ", \
    "РАЗРЕШЕНИЕ", \
    "СОВЕТ", \
    "СОГЛАСИЕ", \
    "Инт/Экст", \
    "Интроверсия +", \
    "Экстраверсия +", \
    "Вр/Дб", \
    "Враждебность +", \
    "Доброжелательность +", \
    "Добросовестность +", \
    "Недобросовестность +", \
    "Недс/Дбс", \
    "Нейротизм +", \
    "ЭмСт/Нрт", \
    "Эмоц. стабильность +", \
    "Консерватизм +", \
    "Кс/Откр", \
    "Открытость +", \
    "Самооценка", \
    "Самооценка +", \
    "Самооценка -", \
]

arr2 = [ \
    "ABUSIVE VOCABULARY", \
    "OBSCENE WORDS", \
    "OFFENSIVE WORDS", \
    "EUPHEMISMS FOR OFFENSIVE WORDS", \
    "GENRES", \
    "STIMULUS GENRES", \
    "REACTIVE GENRES", \
    "PERSUASION", \
    "INDUCEMENT", \
    "CENSURE", \
    "CAUTION", \
    "GREETING", \
    "INVITATION", \
    "ORDER", \
    "REQUEST", \
    "GOODBYE", \
    "PERMISSION", \
    "ADVICE", \
    "AGREEMENT", \
    "Middle Extraversion", \
    "Low Extraversion", \
    "High Extraversion", \
    "Middle Agreeableness", \
    "Low Agreeableness", \
    "High Agreeableness", \
    "High Conscientiousness", \
    "Low Conscientiousness", \
    "Middle Conscientiousness", \
    "High Neuroticism", \
    "Middle Neuroticism", \
    "Low Neuroticism", \
    "Low Openness", \
    "Middle Openness", \
    "High Openness", \
    "Self-Esteem", \
    "Self-Esteem +", \
    "Self-Esteem -", \
]

dictionary = dict(zip(arr1, arr2))

with open("graph.js", "r") as inF:
    with open("graph_en.js", "w") as outF:
        for line in inF:
            for w in arr1:
                line = line.replace(w, dictionary[w])
            outF.write(line)

