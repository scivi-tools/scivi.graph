var g_data =
{
  stateLines: [
    ['Категории-Субкатегории', 'Категории'],
    ['Пермь', 'Бийск', 'Оренбург', ],
  ],
  classifier: {
    children: [
        {
          name: 'ДЕЯТЕЛЬНОСТЬ',
          klass: 0
        },
        {
          name: 'ДОСТОПРИМЕЧАТЕЛЬНОСТИ',
          klass: 1
        },
        {
          name: 'ИСТОРИЯ И КУЛЬТУРА МОСКВЫ',
          klass: 2
        },
        {
          name: 'ЛИЧНАЯ ИСТОРИЯ Ии.',
          klass: 3
        },
        {
          name: 'ЛЮДИ',
          klass: 4
        },
        {
          name: 'ОЦЕНОЧНОСТЬ',
          klass: 5
        },
        {
          name: 'ПОЛИТИКА',
          klass: 6
        },
        {
          name: 'ЦЕНТРАЛЬНОСТЬ',
          klass: 7
        },
        {
          name: 'ЭКОНОМИКА',
          klass: 8
        },
      ]
  },
  states: {
    '0|0': {
nodes: [
          {
              "id": 1,
              "label": "Деньги",
              "class": 8,
          },
          {
              "id": 2,
              "label": "Негатив",
              "class": 5,
          },
          {
              "id": 3,
              "label": "Власть",
              "class": 6,
          },
          {
              "id": 4,
              "label": "Столица",
              "class": 7,
          },
          {
              "id": 5,
              "label": "Противопоставленность стране",
              "class": 5,
          },
          {
              "id": 6,
              "label": "Современные государственные деятели",
              "class": 4,
          },
          {
              "id": 7,
              "label": "Кремль",
              "class": 1,
          },
          {
              "id": 8,
              "label": "Политический центр",
              "class": 6,
          },
          {
              "id": 9,
              "label": "Центр",
              "class": 7,
          },
          {
              "id": 10,
              "label": "Другие локусы",
              "class": 1,
          },
          {
              "id": 11,
              "label": "Внешняя стереотипизация",
              "class": 5,
          },
          {
              "id": 12,
              "label": "Знаменитости",
              "class": 4,
          },
          {
              "id": 13,
              "label": "Много людей",
              "class": 4,
          },
          {
              "id": 14,
              "label": "Шоубизнес",
              "class": 0,
          },
          {
              "id": 15,
              "label": "Красная площадь",
              "class": 1,
          },
          {
              "id": 16,
              "label": "Позитив",
              "class": 5,
          },
          {
              "id": 17,
              "label": "Исторические и культурные вехи",
              "class": 2,
          },
          {
              "id": 18,
              "label": "Масштабность",
              "class": 7,
          },
          {
              "id": 19,
              "label": "Личные связи, опыт",
              "class": 3,
          },
          {
              "id": 20,
              "label": "Ирония",
              "class": 5,
          },
          {
              "id": 21,
              "label": "Спорт",
              "class": 0,
          },
          {
              "id": 22,
              "label": "Высокие цены",
              "class": 8,
          },
],
edges: [
          {
              "source": 1,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 6,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 6,
              "target": 2,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 2,
              "target": 7,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 7,
              "target": 2,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 2,
              "target": 15,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 15,
              "target": 2,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 2,
              "target": 3,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 3,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 4,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 4,
              "target": 2,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 2,
              "target": 19,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 19,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 13,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 13,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 16,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 16,
              "target": 2,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 10,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 10,
              "target": 2,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 2,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 18,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 18,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 6,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 6,
              "target": 4,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 4,
              "target": 7,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 7,
              "target": 4,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 4,
              "target": 15,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 15,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 8,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 8,
              "target": 4,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 4,
              "target": 19,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 19,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 9,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 9,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 13,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 13,
              "target": 4,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 4,
              "target": 16,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 16,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 10,
              "weight": 0.800000011921,
              "tooltip": "0.800000011921"
          },
          {
              "source": 10,
              "target": 4,
              "weight": 0.800000011921,
              "tooltip": "0.800000011921"
          },
          {
              "source": 4,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 14,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 14,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 18,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 18,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 21,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 21,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 6,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 7,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 8,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 8,
              "target": 6,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 6,
              "target": 9,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 9,
              "target": 6,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 6,
              "target": 10,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 10,
              "target": 6,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 6,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 6,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 7,
              "target": 12,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 12,
              "target": 7,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 7,
              "target": 8,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 8,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 13,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 13,
              "target": 7,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 7,
              "target": 10,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 10,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 7,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 7,
              "target": 14,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 14,
              "target": 7,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 8,
              "target": 9,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 9,
              "target": 8,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 8,
              "target": 13,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 13,
              "target": 8,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 8,
              "target": 10,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 10,
              "target": 8,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 8,
              "target": 22,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 22,
              "target": 8,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 9,
              "target": 10,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 10,
              "target": 9,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 10,
              "target": 15,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 15,
              "target": 10,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 10,
              "target": 12,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 12,
              "target": 10,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 16,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 16,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 10,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 10,
              "target": 14,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 14,
              "target": 10,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 10,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 10,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 18,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 18,
              "target": 10,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 15,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 15,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 12,
              "target": 14,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 14,
              "target": 12,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 13,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 13,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 13,
              "target": 22,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 22,
              "target": 13,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 15,
              "target": 16,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 16,
              "target": 15,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 15,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 15,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 15,
              "target": 18,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 18,
              "target": 15,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 16,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 16,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 16,
              "target": 18,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 18,
              "target": 16,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 17,
              "target": 18,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 18,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
]
    },
    '1|0': {
nodes: [
          {
              "id": 1,
              "label": "ЦЕНТРАЛЬНОСТЬ",
          },
          {
              "id": 2,
              "label": "ПОЛИТИКА",
          },
          {
              "id": 3,
              "label": "ОЦЕНОЧНОСТЬ",
          },
          {
              "id": 4,
              "label": "ДОСТОПРИМЕЧАТЕЛЬНОСТИ",
          },
          {
              "id": 5,
              "label": "ЛИЧНАЯ ИСТОРИЯ Ии.",
          },
          {
              "id": 6,
              "label": "ЭКОНОМИКА",
          },
          {
              "id": 7,
              "label": "ИСТОРИЯ И КУЛЬТУРА МОСКВЫ",
          },
          {
              "id": 8,
              "label": "ДЕЯТЕЛЬНОСТЬ",
          },
          {
              "id": 9,
              "label": "ЛЮДИ",
          },
],
edges: [
          {
              "source": 1,
              "target": 7,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 7,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 0.529411792755,
              "tooltip": "0.529411792755"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 0.529411792755,
              "tooltip": "0.529411792755"
          },
          {
              "source": 1,
              "target": 9,
              "weight": 0.454545468092,
              "tooltip": "0.454545468092"
          },
          {
              "source": 9,
              "target": 1,
              "weight": 0.454545468092,
              "tooltip": "0.454545468092"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 0.533333361149,
              "tooltip": "0.533333361149"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 0.533333361149,
              "tooltip": "0.533333361149"
          },
          {
              "source": 1,
              "target": 8,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 8,
              "target": 1,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 2,
              "target": 6,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 6,
              "target": 2,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 2,
              "target": 3,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 3,
              "target": 2,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 2,
              "target": 9,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 9,
              "target": 2,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 2,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 7,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 7,
              "target": 3,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 3,
              "target": 5,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 5,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 6,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 6,
              "target": 3,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 3,
              "target": 9,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 9,
              "target": 3,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 3,
              "target": 4,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 4,
              "target": 3,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 4,
              "target": 7,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 7,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 9,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 9,
              "target": 4,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 4,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 4,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
]
    },
    '0|1': {
nodes: [
          {
              "id": 1,
              "label": "Деньги",
              "class": 8,
          },
          {
              "id": 2,
              "label": "Кремль",
              "class": 1,
          },
          {
              "id": 3,
              "label": "Знаменитости",
              "class": 4,
          },
          {
              "id": 4,
              "label": "Власть",
              "class": 6,
          },
          {
              "id": 5,
              "label": "Центр",
              "class": 7,
          },
          {
              "id": 6,
              "label": "Благосостояние",
              "class": 8,
          },
          {
              "id": 7,
              "label": "Позитив",
              "class": 5,
          },
          {
              "id": 8,
              "label": "Шоубизнес",
              "class": 0,
          },
          {
              "id": 9,
              "label": "Высокие цены",
              "class": 8,
          },
          {
              "id": 10,
              "label": "Противопоставленность стране",
              "class": 5,
          },
          {
              "id": 11,
              "label": "Возможности",
              "class": 8,
          },
          {
              "id": 12,
              "label": "Современные государственные деятели",
              "class": 4,
          },
          {
              "id": 13,
              "label": "Столица",
              "class": 7,
          },
          {
              "id": 14,
              "label": "Политический центр",
              "class": 6,
          },
          {
              "id": 15,
              "label": "Красная площадь",
              "class": 1,
          },
          {
              "id": 16,
              "label": "Другие локусы",
              "class": 1,
          },
          {
              "id": 17,
              "label": "Негатив",
              "class": 5,
          },
          {
              "id": 18,
              "label": "Много людей",
              "class": 4,
          },
          {
              "id": 19,
              "label": "Внешняя стереотипизация",
              "class": 5,
          },
          {
              "id": 20,
              "label": "Ирония",
              "class": 5,
          },
          {
              "id": 21,
              "label": "Предмет желаний",
              "class": 3,
          },
          {
              "id": 22,
              "label": "Масштабность",
              "class": 7,
          },
          {
              "id": 23,
              "label": "Личные связи, опыт",
              "class": 3,
          },
],
edges: [
          {
              "source": 1,
              "target": 2,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 5,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 1,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 7,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 7,
              "target": 1,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 1,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 9,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 9,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 10,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 10,
              "target": 1,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 1,
              "target": 11,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 11,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 15,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 15,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 13,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 13,
              "target": 2,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 2,
              "target": 5,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 5,
              "target": 2,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 2,
              "target": 16,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 16,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 9,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 9,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 10,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 10,
              "target": 2,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 3,
              "target": 12,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 12,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 6,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 6,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 8,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 8,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 5,
              "target": 13,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 13,
              "target": 5,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 5,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 9,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 9,
              "target": 5,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 5,
              "target": 10,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 10,
              "target": 5,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 6,
              "target": 8,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 8,
              "target": 6,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 7,
              "target": 13,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 13,
              "target": 7,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 7,
              "target": 23,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 23,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 7,
              "target": 16,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 16,
              "target": 7,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 7,
              "target": 10,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 10,
              "target": 7,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 7,
              "target": 11,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 11,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 13,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 13,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 10,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 9,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 17,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 17,
              "target": 10,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 10,
              "target": 13,
              "weight": 0.571428596973,
              "tooltip": "0.571428596973"
          },
          {
              "source": 13,
              "target": 10,
              "weight": 0.571428596973,
              "tooltip": "0.571428596973"
          },
          {
              "source": 10,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 10,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 16,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 16,
              "target": 10,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 10,
              "target": 22,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 22,
              "target": 10,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 10,
              "target": 11,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 11,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 11,
              "target": 21,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 21,
              "target": 11,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 11,
              "target": 22,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 22,
              "target": 11,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 12,
              "target": 13,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 13,
              "target": 12,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 12,
              "target": 14,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 14,
              "target": 12,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 13,
              "target": 15,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 15,
              "target": 13,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 13,
              "target": 17,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 17,
              "target": 13,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 13,
              "target": 14,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 14,
              "target": 13,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 13,
              "target": 20,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 20,
              "target": 13,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 13,
              "target": 16,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 16,
              "target": 13,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 15,
              "target": 16,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 16,
              "target": 15,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 17,
              "target": 18,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 18,
              "target": 17,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 17,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 17,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 18,
              "target": 19,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 19,
              "target": 18,
              "weight": 0.5,
              "tooltip": "0.5"
          },
]
    },
    '1|1': {
nodes: [
          {
              "id": 1,
              "label": "ЦЕНТРАЛЬНОСТЬ",
          },
          {
              "id": 2,
              "label": "ПОЛИТИКА",
          },
          {
              "id": 3,
              "label": "ОЦЕНОЧНОСТЬ",
          },
          {
              "id": 4,
              "label": "ЛЮДИ",
          },
          {
              "id": 5,
              "label": "ДОСТОПРИМЕЧАТЕЛЬНОСТИ",
          },
          {
              "id": 6,
              "label": "ДЕЯТЕЛЬНОСТЬ",
          },
          {
              "id": 7,
              "label": "ЛИЧНАЯ ИСТОРИЯ Ии.",
          },
          {
              "id": 8,
              "label": "ЭКОНОМИКА",
          },
],
edges: [
          {
              "source": 1,
              "target": 8,
              "weight": 0.181818187237,
              "tooltip": "0.181818187237"
          },
          {
              "source": 8,
              "target": 1,
              "weight": 0.181818187237,
              "tooltip": "0.181818187237"
          },
          {
              "source": 1,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 0.478260874748,
              "tooltip": "0.478260874748"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 0.478260874748,
              "tooltip": "0.478260874748"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 1,
              "target": 5,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 1,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 8,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 8,
              "target": 2,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 2,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 3,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 3,
              "target": 8,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 8,
              "target": 3,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 3,
              "target": 4,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 4,
              "target": 3,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 3,
              "target": 5,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 5,
              "target": 3,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 4,
              "target": 8,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 8,
              "target": 4,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 4,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 4,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 5,
              "target": 8,
              "weight": 0.0909090936184,
              "tooltip": "0.0909090936184"
          },
          {
              "source": 8,
              "target": 5,
              "weight": 0.0909090936184,
              "tooltip": "0.0909090936184"
          },
          {
              "source": 6,
              "target": 8,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 8,
              "target": 6,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 8,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 8,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
]
    },
    '0|2': {
nodes: [
          {
              "id": 1,
              "label": "Столица",
              "class": 7,
          },
          {
              "id": 2,
              "label": "Другие локусы",
              "class": 1,
          },
          {
              "id": 3,
              "label": "Позитив",
              "class": 5,
          },
          {
              "id": 4,
              "label": "Негатив",
              "class": 5,
          },
          {
              "id": 5,
              "label": "Кремль",
              "class": 1,
          },
          {
              "id": 6,
              "label": "Красная площадь",
              "class": 1,
          },
          {
              "id": 7,
              "label": "Центр",
              "class": 7,
          },
          {
              "id": 8,
              "label": "Современные государственные деятели",
              "class": 4,
          },
          {
              "id": 9,
              "label": "Много людей",
              "class": 4,
          },
          {
              "id": 10,
              "label": "Масштабность",
              "class": 7,
          },
          {
              "id": 11,
              "label": "Политический центр",
              "class": 6,
          },
          {
              "id": 12,
              "label": "Внешняя стереотипизация",
              "class": 5,
          },
          {
              "id": 13,
              "label": "Исторические и культурные вехи",
              "class": 2,
          },
          {
              "id": 14,
              "label": "Личные связи, опыт",
              "class": 3,
          },
          {
              "id": 15,
              "label": "Благосостояние",
              "class": 8,
          },
          {
              "id": 16,
              "label": "Деньги",
              "class": 8,
          },
          {
              "id": 17,
              "label": "Шоубизнес",
              "class": 0,
          },
          {
              "id": 18,
              "label": "Власть",
              "class": 6,
          },
          {
              "id": 19,
              "label": "Торговля",
              "class": 0,
          },
          {
              "id": 20,
              "label": "Возможности",
              "class": 8,
          },
          {
              "id": 21,
              "label": "Высокие цены",
              "class": 8,
          },
          {
              "id": 22,
              "label": "Ирония",
              "class": 5,
          },
          {
              "id": 23,
              "label": "Знаменитости",
              "class": 4,
          },
          {
              "id": 24,
              "label": "Мигранты",
              "class": 4,
          },
          {
              "id": 25,
              "label": "Противопоставленность стране",
              "class": 5,
          },
          {
              "id": 26,
              "label": "Предмет желаний",
              "class": 3,
          },
],
edges: [
          {
              "source": 16,
              "target": 4,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 4,
              "target": 16,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 16,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 18,
              "target": 16,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 16,
              "target": 1,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 1,
              "target": 16,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 16,
              "target": 11,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 11,
              "target": 16,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 16,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 16,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 16,
              "target": 19,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 19,
              "target": 16,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 16,
              "target": 10,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 10,
              "target": 16,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 4,
              "target": 8,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 8,
              "target": 4,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 4,
              "target": 23,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 23,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 4,
              "target": 11,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 11,
              "target": 4,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 4,
              "target": 7,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 7,
              "target": 4,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 4,
              "target": 15,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 15,
              "target": 4,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 4,
              "target": 22,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 22,
              "target": 4,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 4,
              "target": 9,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 9,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 3,
              "weight": 0.0714285746217,
              "tooltip": "0.0714285746217"
          },
          {
              "source": 3,
              "target": 4,
              "weight": 0.0714285746217,
              "tooltip": "0.0714285746217"
          },
          {
              "source": 4,
              "target": 2,
              "weight": 0.357142865658,
              "tooltip": "0.357142865658"
          },
          {
              "source": 2,
              "target": 4,
              "weight": 0.357142865658,
              "tooltip": "0.357142865658"
          },
          {
              "source": 4,
              "target": 12,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 12,
              "target": 4,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 4,
              "target": 17,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 17,
              "target": 4,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 4,
              "target": 24,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 24,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 4,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 4,
              "target": 25,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 25,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 10,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 10,
              "target": 4,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 18,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 18,
              "target": 5,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 5,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 18,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 18,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 18,
              "target": 11,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 11,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 18,
              "target": 7,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 7,
              "target": 18,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 18,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 18,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 18,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 8,
              "weight": 0.699999988079,
              "tooltip": "0.699999988079"
          },
          {
              "source": 8,
              "target": 1,
              "weight": 0.699999988079,
              "tooltip": "0.699999988079"
          },
          {
              "source": 1,
              "target": 5,
              "weight": 0.642857134342,
              "tooltip": "0.642857134342"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 0.642857134342,
              "tooltip": "0.642857134342"
          },
          {
              "source": 1,
              "target": 6,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 6,
              "target": 1,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 1,
              "target": 23,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 23,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 11,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 11,
              "target": 1,
              "weight": 0.75,
              "tooltip": "0.75"
          },
          {
              "source": 1,
              "target": 26,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 26,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 14,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 14,
              "target": 1,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 1,
              "target": 7,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 7,
              "target": 1,
              "weight": 0.600000023842,
              "tooltip": "0.600000023842"
          },
          {
              "source": 1,
              "target": 15,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 15,
              "target": 1,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 1,
              "target": 22,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 22,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 9,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 9,
              "target": 1,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 0.8125,
              "tooltip": "0.8125"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 0.8125,
              "tooltip": "0.8125"
          },
          {
              "source": 1,
              "target": 2,
              "weight": 0.470588237047,
              "tooltip": "0.470588237047"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 0.470588237047,
              "tooltip": "0.470588237047"
          },
          {
              "source": 1,
              "target": 12,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 12,
              "target": 1,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 1,
              "target": 17,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 17,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 1,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 1,
              "target": 13,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 13,
              "target": 1,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 1,
              "target": 21,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 21,
              "target": 1,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 1,
              "target": 25,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 25,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 1,
              "target": 10,
              "weight": 0.777777791023,
              "tooltip": "0.777777791023"
          },
          {
              "source": 10,
              "target": 1,
              "weight": 0.777777791023,
              "tooltip": "0.777777791023"
          },
          {
              "source": 1,
              "target": 20,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 20,
              "target": 1,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 11,
              "target": 8,
              "weight": 0.625,
              "tooltip": "0.625"
          },
          {
              "source": 8,
              "target": 11,
              "weight": 0.625,
              "tooltip": "0.625"
          },
          {
              "source": 11,
              "target": 5,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 5,
              "target": 11,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 11,
              "target": 6,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 6,
              "target": 11,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 11,
              "target": 7,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 7,
              "target": 11,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 11,
              "target": 9,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 9,
              "target": 11,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 11,
              "target": 3,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 3,
              "target": 11,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 11,
              "target": 2,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 2,
              "target": 11,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 11,
              "target": 12,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 12,
              "target": 11,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 11,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 11,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 11,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 11,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 11,
              "target": 10,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 10,
              "target": 11,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 11,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 11,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 7,
              "target": 8,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 8,
              "target": 7,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 7,
              "target": 5,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 5,
              "target": 7,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 7,
              "target": 6,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 6,
              "target": 7,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 7,
              "target": 15,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 15,
              "target": 7,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 7,
              "target": 22,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 22,
              "target": 7,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 7,
              "target": 9,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 9,
              "target": 7,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 7,
              "target": 2,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 2,
              "target": 7,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 7,
              "target": 19,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 19,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 7,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 7,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 7,
              "target": 10,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 10,
              "target": 7,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 7,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 19,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 19,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 19,
              "target": 2,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 2,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 12,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 12,
              "target": 19,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 19,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 19,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 8,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 8,
              "target": 10,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 10,
              "target": 5,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 5,
              "target": 10,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 10,
              "target": 23,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 23,
              "target": 10,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 10,
              "target": 15,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 15,
              "target": 10,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 10,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 3,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 3,
              "target": 10,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 10,
              "target": 12,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 12,
              "target": 10,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 10,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 10,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 10,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 5,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 5,
              "target": 8,
              "weight": 0.40000000596,
              "tooltip": "0.40000000596"
          },
          {
              "source": 8,
              "target": 6,
              "weight": 0.300000011921,
              "tooltip": "0.300000011921"
          },
          {
              "source": 6,
              "target": 8,
              "weight": 0.300000011921,
              "tooltip": "0.300000011921"
          },
          {
              "source": 8,
              "target": 23,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 23,
              "target": 8,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 8,
              "target": 3,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 3,
              "target": 8,
              "weight": 0.20000000298,
              "tooltip": "0.20000000298"
          },
          {
              "source": 8,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 8,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 8,
              "target": 12,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 12,
              "target": 8,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 8,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 8,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 8,
              "target": 20,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 20,
              "target": 8,
              "weight": 0.666666686535,
              "tooltip": "0.666666686535"
          },
          {
              "source": 5,
              "target": 6,
              "weight": 0.583333313465,
              "tooltip": "0.583333313465"
          },
          {
              "source": 6,
              "target": 5,
              "weight": 0.583333313465,
              "tooltip": "0.583333313465"
          },
          {
              "source": 5,
              "target": 14,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 14,
              "target": 5,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 5,
              "target": 9,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 9,
              "target": 5,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 5,
              "target": 3,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 3,
              "target": 5,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 5,
              "target": 2,
              "weight": 0.357142865658,
              "tooltip": "0.357142865658"
          },
          {
              "source": 2,
              "target": 5,
              "weight": 0.357142865658,
              "tooltip": "0.357142865658"
          },
          {
              "source": 5,
              "target": 12,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 12,
              "target": 5,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 5,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 5,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 6,
              "target": 14,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 14,
              "target": 6,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 6,
              "target": 3,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 3,
              "target": 6,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 6,
              "target": 2,
              "weight": 0.416666656733,
              "tooltip": "0.416666656733"
          },
          {
              "source": 2,
              "target": 6,
              "weight": 0.416666656733,
              "tooltip": "0.416666656733"
          },
          {
              "source": 6,
              "target": 12,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 12,
              "target": 6,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 6,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 6,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 6,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 23,
              "target": 15,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 15,
              "target": 23,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 26,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 26,
              "target": 3,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 3,
              "target": 9,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 9,
              "target": 3,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 3,
              "target": 2,
              "weight": 0.1875,
              "tooltip": "0.1875"
          },
          {
              "source": 2,
              "target": 3,
              "weight": 0.1875,
              "tooltip": "0.1875"
          },
          {
              "source": 3,
              "target": 12,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 12,
              "target": 3,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 3,
              "target": 13,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 13,
              "target": 3,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 3,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 3,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 14,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 14,
              "target": 2,
              "weight": 0.428571432829,
              "tooltip": "0.428571432829"
          },
          {
              "source": 2,
              "target": 15,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 15,
              "target": 2,
              "weight": 0.166666671634,
              "tooltip": "0.166666671634"
          },
          {
              "source": 2,
              "target": 22,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 22,
              "target": 2,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 9,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 9,
              "target": 2,
              "weight": 0.10000000149,
              "tooltip": "0.10000000149"
          },
          {
              "source": 2,
              "target": 12,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 12,
              "target": 2,
              "weight": 0.714285731316,
              "tooltip": "0.714285731316"
          },
          {
              "source": 2,
              "target": 17,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 17,
              "target": 2,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 2,
              "target": 24,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 24,
              "target": 2,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 13,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 13,
              "target": 2,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 2,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 2,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 2,
              "target": 25,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 25,
              "target": 2,
              "weight": 1.0,
              "tooltip": "1.0"
          },
          {
              "source": 2,
              "target": 20,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 20,
              "target": 2,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 12,
              "target": 14,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 14,
              "target": 12,
              "weight": 0.142857149243,
              "tooltip": "0.142857149243"
          },
          {
              "source": 12,
              "target": 9,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 9,
              "target": 12,
              "weight": 0.285714298487,
              "tooltip": "0.285714298487"
          },
          {
              "source": 12,
              "target": 24,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 24,
              "target": 12,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 12,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 12,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 14,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 14,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 15,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 15,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 22,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 22,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 24,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 24,
              "target": 9,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 9,
              "target": 21,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 21,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 15,
              "target": 22,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 22,
              "target": 15,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 15,
              "target": 17,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 17,
              "target": 15,
              "weight": 0.25,
              "tooltip": "0.25"
          },
]
    },
    '1|2': {
nodes: [
          {
              "id": 1,
              "label": "ЦЕНТРАЛЬНОСТЬ",
          },
          {
              "id": 2,
              "label": "ПОЛИТИКА",
          },
          {
              "id": 3,
              "label": "ОЦЕНОЧНОСТЬ",
          },
          {
              "id": 4,
              "label": "ДЕЯТЕЛЬНОСТЬ",
          },
          {
              "id": 5,
              "label": "ИСТОРИЯ И КУЛЬТУРА МОСКВЫ",
          },
          {
              "id": 6,
              "label": "ЭКОНОМИКА",
          },
          {
              "id": 7,
              "label": "ДОСТОПРИМЕЧАТЕЛЬНОСТИ",
          },
          {
              "id": 8,
              "label": "ЛИЧНАЯ ИСТОРИЯ Ии.",
          },
          {
              "id": 9,
              "label": "ЛЮДИ",
          },
],
edges: [
          {
              "source": 1,
              "target": 5,
              "weight": 0.625,
              "tooltip": "0.625"
          },
          {
              "source": 5,
              "target": 1,
              "weight": 0.625,
              "tooltip": "0.625"
          },
          {
              "source": 1,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 1,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 1,
              "target": 6,
              "weight": 0.777777791023,
              "tooltip": "0.777777791023"
          },
          {
              "source": 6,
              "target": 1,
              "weight": 0.777777791023,
              "tooltip": "0.777777791023"
          },
          {
              "source": 1,
              "target": 2,
              "weight": 0.727272748947,
              "tooltip": "0.727272748947"
          },
          {
              "source": 2,
              "target": 1,
              "weight": 0.727272748947,
              "tooltip": "0.727272748947"
          },
          {
              "source": 1,
              "target": 3,
              "weight": 0.523809552193,
              "tooltip": "0.523809552193"
          },
          {
              "source": 3,
              "target": 1,
              "weight": 0.523809552193,
              "tooltip": "0.523809552193"
          },
          {
              "source": 1,
              "target": 9,
              "weight": 0.583333313465,
              "tooltip": "0.583333313465"
          },
          {
              "source": 9,
              "target": 1,
              "weight": 0.583333313465,
              "tooltip": "0.583333313465"
          },
          {
              "source": 1,
              "target": 7,
              "weight": 0.418604642153,
              "tooltip": "0.418604642153"
          },
          {
              "source": 7,
              "target": 1,
              "weight": 0.418604642153,
              "tooltip": "0.418604642153"
          },
          {
              "source": 1,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 4,
              "target": 1,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 2,
              "target": 5,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 5,
              "target": 2,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 2,
              "target": 6,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 6,
              "target": 2,
              "weight": 0.272727280855,
              "tooltip": "0.272727280855"
          },
          {
              "source": 2,
              "target": 3,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 3,
              "target": 2,
              "weight": 0.363636374474,
              "tooltip": "0.363636374474"
          },
          {
              "source": 2,
              "target": 9,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 9,
              "target": 2,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 2,
              "target": 7,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 7,
              "target": 2,
              "weight": 0.54545456171,
              "tooltip": "0.54545456171"
          },
          {
              "source": 2,
              "target": 4,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 4,
              "target": 2,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 3,
              "target": 5,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 5,
              "target": 3,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 3,
              "target": 8,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 8,
              "target": 3,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 3,
              "target": 6,
              "weight": 0.388888895512,
              "tooltip": "0.388888895512"
          },
          {
              "source": 6,
              "target": 3,
              "weight": 0.388888895512,
              "tooltip": "0.388888895512"
          },
          {
              "source": 3,
              "target": 9,
              "weight": 0.458333343267,
              "tooltip": "0.458333343267"
          },
          {
              "source": 9,
              "target": 3,
              "weight": 0.458333343267,
              "tooltip": "0.458333343267"
          },
          {
              "source": 3,
              "target": 7,
              "weight": 0.261904776096,
              "tooltip": "0.261904776096"
          },
          {
              "source": 7,
              "target": 3,
              "weight": 0.261904776096,
              "tooltip": "0.261904776096"
          },
          {
              "source": 3,
              "target": 4,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 4,
              "target": 3,
              "weight": 0.375,
              "tooltip": "0.375"
          },
          {
              "source": 4,
              "target": 8,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 8,
              "target": 4,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 4,
              "target": 6,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 6,
              "target": 4,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 4,
              "target": 9,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 9,
              "target": 4,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 4,
              "target": 7,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 7,
              "target": 4,
              "weight": 0.5,
              "tooltip": "0.5"
          },
          {
              "source": 5,
              "target": 9,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 9,
              "target": 5,
              "weight": 0.25,
              "tooltip": "0.25"
          },
          {
              "source": 5,
              "target": 7,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 7,
              "target": 5,
              "weight": 0.125,
              "tooltip": "0.125"
          },
          {
              "source": 6,
              "target": 8,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 8,
              "target": 6,
              "weight": 0.111111111939,
              "tooltip": "0.111111111939"
          },
          {
              "source": 6,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 6,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 6,
              "target": 7,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 7,
              "target": 6,
              "weight": 0.222222223878,
              "tooltip": "0.222222223878"
          },
          {
              "source": 7,
              "target": 8,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 8,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 7,
              "target": 9,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
          {
              "source": 9,
              "target": 7,
              "weight": 0.333333343267,
              "tooltip": "0.333333343267"
          },
]
    },
  }};
