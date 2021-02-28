#!/usr/bin/env python3
# -*- coding: utf-8 -*-


arr1 = [ \
    "Развлечение", \
    "Спорт", \
    "Торговля", \
    "Шоубизнес", \
    "Другие локусы", \
    "Красная площадь", \
    "Кремль", \
    "Исторические и культурные вехи", \
    "Исторические государственные деятели", \
    "Предмет желаний", \
    "Личные связи, опыт", \
    "Мигранты", \
    "Много людей", \
    "Современные государственные деятели", \
    "Знаменитости", \
    "Внешняя стереотипизация", \
    "Ирония", \
    "Негатив", \
    "Позитив", \
    "Противопоставленность стране", \
    "Власть", \
    "Политический центр", \
    "Масштабность", \
    "Столица", \
    "Центр", \
    "Благосостояние", \
    "Возможности", \
    "Деньги", \
    "Высокие цены", \
    "Ресурсы"
]

arr2 = [ \
    "Entertainment", \
    "Sport", \
    "Trade", \
    "Showbusiness", \
    "Misc. Locations", \
    "Red Square", \
    "The Kremlin", \
    "Historical and cultural milestones", \
    "Historical leaders, rulers, outstanding politicians", \
    "Object of desire", \
    "Personal connections, experience", \
    "Migrants", \
    "Dense population", \
    "Contemporary leaders, rulers, outstanding politicians", \
    "Celebrities", \
    "External  stereotypification", \
    "Irony", \
    "Negative attitude", \
    "Positive attitude", \
    "Counterposition to the country as a whole", \
    "Power", \
    "Political centre", \
    "Large scale", \
    "Capital", \
    "Centre", \
    "Prosperity", \
    "Prospects and opportunities", \
    "Money", \
    "High prices", \
    "Resourсes"
]

dictionary = dict(zip(arr1, arr2))

with open("data.js", "r") as inF:
    with open("data_en.js", "w") as outF:
        for line in inF:
            for w in arr1:
                line = line.replace(w, dictionary[w])
            outF.write(line)

