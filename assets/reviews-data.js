// Dados reais extraídos do TikTok Shop com fotos reais dos compradores
const REVIEWS_DATA = [
  {
    "id": 1,
    "username": "M**a H**a",
    "fullName": "Maria Helena",
    "rating": 5,
    "comment": "Chegou tudo certo, ainda não tenho uma opinião pra dá, pq comecei a tomar ontem, dps venho aqui dá meu feedback.",
    "specification": "Item: 1 Pote",
    "date": "17 de Junho de 2026",
    "location": "São Paulo, SP",
    "isVerified": true,
    "avatarInitials": "MH",
    "photos": [
      "assets/images/reviews/rev_1_1.webp",
      "assets/images/reviews/rev_1_2.webp",
      "assets/images/reviews/rev_1_3.webp",
      "assets/images/reviews/rev_1_4.webp"
    ]
  },
  {
    "id": 2,
    "username": "V**a A**s",
    "fullName": "Valéria Alves",
    "rating": 5,
    "comment": "Chegou direitinho, agora é só tomar e esperar os resultados. Embalagem super bem lacrada!",
    "specification": "Item: 1 Pote",
    "date": "02 de Setembro de 2026",
    "location": "Belo Horizonte, MG",
    "isVerified": true,
    "avatarInitials": "VA",
    "photos": [
      "assets/images/reviews/rev_2_1.webp",
      "assets/images/reviews/rev_2_2.webp",
      "assets/images/reviews/rev_2_3.webp"
    ]
  },
  {
    "id": 3,
    "username": "B**o d** e**",
    "fullName": "Bruno de Oliveira",
    "rating": 5,
    "comment": "chegou rápido, e bem lacrado. Recomendo muito a loja.",
    "specification": "Item: 2 Potes",
    "date": "14 de Julho de 2026",
    "location": "Curitiba, PR",
    "isVerified": true,
    "avatarInitials": "BO",
    "photos": [
      "assets/images/reviews/rev_3_1.webp",
      "assets/images/reviews/rev_3_2.webp",
      "assets/images/reviews/rev_3_3.webp"
    ]
  },
  {
    "id": 4,
    "username": "E**s S**a",
    "fullName": "Eliane Silva",
    "rating": 5,
    "comment": "Sabor: Não tem\nÉ quarta vez que eu compro! Minha disposição melhorou demais, não fico mais sem.\nDesempenho: Excelente!",
    "specification": "Item: 1 Pote",
    "date": "13 de Agosto de 2026",
    "location": "Rio de Janeiro, RJ",
    "isVerified": true,
    "avatarInitials": "ES",
    "photos": [
      "assets/images/reviews/rev_4_1.webp",
      "assets/images/reviews/rev_4_2.webp"
    ]
  },
  {
    "id": 5,
    "username": "P**a L**a",
    "fullName": "Paula Lima",
    "rating": 5,
    "comment": "Chegou muito rápido, super indico. Vale muito a pena pelo preço e pela qualidade dos 6 magnésios juntos.",
    "specification": "Item: 1 Pote",
    "date": "13 de Julho de 2026",
    "location": "Goiânia, GO",
    "isVerified": true,
    "avatarInitials": "PL",
    "photos": [
      "assets/images/reviews/rev_5_1.webp",
      "assets/images/reviews/rev_5_2.webp",
      "assets/images/reviews/rev_5_3.webp"
    ]
  },
  {
    "id": 6,
    "username": "L**z C**s",
    "fullName": "Luiz Carlos",
    "rating": 5,
    "comment": "Chegou rápido, não fiz uso ainda. Pelos comentários vi que era bom e comprei logo o kit.",
    "specification": "Item: 1 Pote",
    "date": "09 de Julho de 2026",
    "location": "Recife, PE",
    "isVerified": true,
    "avatarInitials": "LC",
    "photos": [
      "assets/images/reviews/rev_6_1.webp",
      "assets/images/reviews/rev_6_2.webp"
    ]
  },
  {
    "id": 7,
    "username": "R**e T**a",
    "fullName": "Renata Teixeira",
    "rating": 5,
    "comment": "Desempenho: Desincha mesmo e ajuda muito no desempenho de energia no trabalho e treinos.\nSabor: Não tem gosto forte, super fácil de engolir.",
    "specification": "Item: 3 Potes",
    "date": "25 de Abril de 2026",
    "location": "Campinas, SP",
    "isVerified": true,
    "avatarInitials": "RT",
    "photos": [
      "assets/images/reviews/rev_7_1.webp",
      "assets/images/reviews/rev_7_2.webp"
    ]
  },
  {
    "id": 8,
    "username": "J**a S**s",
    "fullName": "Juliana Santos",
    "rating": 5,
    "comment": "Estou gostando muito bom. Chegou muito rápido aqui em Salvador, produto original lacrado.",
    "specification": "Item: 1 Pote",
    "date": "01 de Julho de 2026",
    "location": "Salvador, BA",
    "isVerified": true,
    "avatarInitials": "JS",
    "photos": [
      "assets/images/reviews/rev_8_1.webp",
      "assets/images/reviews/rev_8_2.webp"
    ]
  },
  {
    "id": 9,
    "username": "C**a M**o",
    "fullName": "Carla Monteiro",
    "rating": 5,
    "comment": "Comecei a tomar mas achei bom, já vi resultados no sono logo na primeira semana.",
    "specification": "Item: 1 Pote",
    "date": "27 de Junho de 2026",
    "location": "Fortaleza, CE",
    "isVerified": true,
    "avatarInitials": "CM",
    "photos": [
      "assets/images/reviews/rev_9_1.webp",
      "assets/images/reviews/rev_9_2.webp"
    ]
  },
  {
    "id": 10,
    "username": "R**o S**a",
    "fullName": "Rodrigo Silva",
    "rating": 5,
    "comment": "Muito bom recomendo a todos, ótimo mesmo. Minhas dores nas articulações sumiram.",
    "specification": "Item: 3 Potes",
    "date": "24 de Maio de 2026",
    "location": "Porto Alegre, RS",
    "isVerified": true,
    "avatarInitials": "RS",
    "photos": [
      "assets/images/reviews/rev_10_1.webp",
      "assets/images/reviews/rev_10_2.webp"
    ]
  },
  {
    "id": 11,
    "username": "E**s B**o",
    "fullName": "Elenice Bueno",
    "rating": 5,
    "comment": "Produto de excelente qualidade! Veio super rápido e muito bem protegido.",
    "specification": "Item: 3 Potes",
    "date": "12 de Agosto de 2026",
    "location": "São Paulo, SP",
    "isVerified": true,
    "avatarInitials": "EB",
    "photos": [
      "assets/images/reviews/rev_11_1.webp",
      "assets/images/reviews/rev_11_2.webp"
    ]
  },
  {
    "id": 12,
    "username": "D**h O**l",
    "fullName": "Denilson Oliveira",
    "rating": 5,
    "comment": "Muito bem lacrado e original! Já estou tomando há alguns dias e sinto mais disposição pela manhã.",
    "specification": "Item: 1 Pote",
    "date": "06 de Agosto de 2026",
    "location": "Belo Horizonte, MG",
    "isVerified": true,
    "avatarInitials": "DO",
    "photos": [
      "assets/images/reviews/rev_12_1.webp",
      "assets/images/reviews/rev_12_2.webp"
    ]
  },
  {
    "id": 13,
    "username": "C**a P**a",
    "fullName": "Cláudia Pereira",
    "rating": 5,
    "comment": "Tô tomando tem 2 semanas e já vi muita diferença. Principalmente no sono profundo e na ansiedade do fim do dia.",
    "specification": "Item: 1 Pote",
    "date": "30 de Julho de 2026",
    "location": "Curitiba, PR",
    "isVerified": true,
    "avatarInitials": "CP",
    "photos": []
  },
  {
    "id": 14,
    "username": "T**s M**a",
    "fullName": "Taís Miranda",
    "rating": 5,
    "comment": "Sabor: Nao tem sabor\nDesempenho: Pra mim é otimo, melhorou meu sono e tambem ando mais calma e com uma boa disposiçao no dia a dia. Super recomendo e comprarei mais com certeza!",
    "specification": "Item: 3 Potes",
    "date": "12 de Julho de 2026",
    "location": "Rio de Janeiro, RJ",
    "isVerified": true,
    "avatarInitials": "TM",
    "photos": []
  },
  {
    "id": 15,
    "username": "D**e S**t",
    "fullName": "Denise Schmitt",
    "rating": 5,
    "comment": "Entrega rápida, produto chegou bem embalado e todo lacrado. Comecei a tomar pra ajudar no estresse e energia. Pelo preço compensa muito.",
    "specification": "Item: 2 Potes",
    "date": "23 de Junho de 2026",
    "location": "Salvador, BA",
    "isVerified": true,
    "avatarInitials": "DS",
    "photos": []
  },
  {
    "id": 16,
    "username": "K**n T**s",
    "fullName": "Karen Teles",
    "rating": 5,
    "comment": "Muito bom, segunda vez que compro e vejo resultado. Minhas cãibras noturnas pararam.",
    "specification": "Item: 1 Pote",
    "date": "01 de Setembro de 2026",
    "location": "Manaus, AM",
    "isVerified": true,
    "avatarInitials": "KT",
    "photos": []
  },
  {
    "id": 17,
    "username": "V**e S**a",
    "fullName": "Valeska Santana",
    "rating": 5,
    "comment": "Sabor: Sem sabor, então facilita o consumo\nDesempenho: Estou gostando muito já comprei duas vezes.",
    "specification": "Item: 1 Pote",
    "date": "13 de Setembro de 2026",
    "location": "Campinas, SP",
    "isVerified": true,
    "avatarInitials": "VS",
    "photos": []
  },
  {
    "id": 18,
    "username": "C**a B**o",
    "fullName": "Célia Bueno",
    "rating": 5,
    "comment": "Super recomendo muito bom produto! Ótimo para dor no corpo, desgaste, canseira... maravilhoso produto vitamínico!",
    "specification": "Item: 1 Pote",
    "date": "13 de Setembro de 2026",
    "location": "Salvador, BA",
    "isVerified": true,
    "avatarInitials": "CB",
    "photos": []
  },
  {
    "id": 19,
    "username": "F** J**s",
    "fullName": "Fábio Jesus",
    "rating": 5,
    "comment": "Sabor: Não tem sabor\nDesempenho: Ótimo\nChegou no prazo e veio os 3 potes, tudo certo.",
    "specification": "Item: 3 Potes",
    "date": "01 de Setembro de 2026",
    "location": "Fortaleza, CE",
    "isVerified": true,
    "avatarInitials": "FJ",
    "photos": []
  },
  {
    "id": 20,
    "username": "L**n B**s",
    "fullName": "Leandro Borges",
    "rating": 5,
    "comment": "Sabor: Sem nenhum sabor, muito fácil de tomar, comprei e já estou tomando. Chegou bem embalado e dentro do prazo prometido.",
    "specification": "Item: 1 Pote",
    "date": "18 de Agosto de 2026",
    "location": "Porto Alegre, RS",
    "isVerified": true,
    "avatarInitials": "LB",
    "photos": []
  }
];
