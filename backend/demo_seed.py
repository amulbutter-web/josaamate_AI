# JOSAA MATE AI – Demo Seed Data for Backend
# All data below is illustrative. NOT official JoSAA data.

DEMO_INSTITUTES = [
  {"id": "iitb", "name": "Indian Institute of Technology Bombay", "short_name": "IIT Bombay", "type": "IIT", "state": "Maharashtra", "city": "Mumbai"},
  {"id": "iitd", "name": "Indian Institute of Technology Delhi", "short_name": "IIT Delhi", "type": "IIT", "state": "Delhi", "city": "New Delhi"},
  {"id": "iitm", "name": "Indian Institute of Technology Madras", "short_name": "IIT Madras", "type": "IIT", "state": "Tamil Nadu", "city": "Chennai"},
  {"id": "iitk", "name": "Indian Institute of Technology Kanpur", "short_name": "IIT Kanpur", "type": "IIT", "state": "Uttar Pradesh", "city": "Kanpur"},
  {"id": "iitkgp", "name": "Indian Institute of Technology Kharagpur", "short_name": "IIT Kharagpur", "type": "IIT", "state": "West Bengal", "city": "Kharagpur"},
  {"id": "iitr", "name": "Indian Institute of Technology Roorkee", "short_name": "IIT Roorkee", "type": "IIT", "state": "Uttarakhand", "city": "Roorkee"},
  {"id": "nitw", "name": "National Institute of Technology Warangal", "short_name": "NIT Warangal", "type": "NIT", "state": "Telangana", "city": "Warangal"},
  {"id": "nitt", "name": "National Institute of Technology Tiruchirappalli", "short_name": "NIT Trichy", "type": "NIT", "state": "Tamil Nadu", "city": "Tiruchirappalli"},
  {"id": "nitr", "name": "National Institute of Technology Rourkela", "short_name": "NIT Rourkela", "type": "NIT", "state": "Odisha", "city": "Rourkela"},
  {"id": "nitc", "name": "National Institute of Technology Calicut", "short_name": "NIT Calicut", "type": "NIT", "state": "Kerala", "city": "Calicut"},
  {"id": "iiita", "name": "Indian Institute of Information Technology Allahabad", "short_name": "IIIT Allahabad", "type": "IIIT", "state": "Uttar Pradesh", "city": "Prayagraj"},
  {"id": "iiith", "name": "IIIT Hyderabad", "short_name": "IIIT Hyderabad", "type": "IIIT", "state": "Telangana", "city": "Hyderabad"},
  {"id": "dtudelhi", "name": "Delhi Technological University", "short_name": "DTU Delhi", "type": "GFTI", "state": "Delhi", "city": "New Delhi"},
]

DEMO_PROGRAMMES = [
  {"id": "iitb-cs", "institute_id": "iitb", "institute_name": "IIT Bombay", "institute_type": "IIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Maharashtra", "city": "Mumbai"},
  {"id": "iitb-ee", "institute_id": "iitb", "institute_name": "IIT Bombay", "institute_type": "IIT", "program_name": "Electrical Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Maharashtra", "city": "Mumbai"},
  {"id": "iitd-cs", "institute_id": "iitd", "institute_name": "IIT Delhi", "institute_type": "IIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Delhi", "city": "New Delhi"},
  {"id": "iitm-cs", "institute_id": "iitm", "institute_name": "IIT Madras", "institute_type": "IIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Tamil Nadu", "city": "Chennai"},
  {"id": "iitk-cs", "institute_id": "iitk", "institute_name": "IIT Kanpur", "institute_type": "IIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Uttar Pradesh", "city": "Kanpur"},
  {"id": "iitr-cs", "institute_id": "iitr", "institute_name": "IIT Roorkee", "institute_type": "IIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Uttarakhand", "city": "Roorkee"},
  {"id": "nitw-cs", "institute_id": "nitw", "institute_name": "NIT Warangal", "institute_type": "NIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Telangana", "city": "Warangal"},
  {"id": "nitw-ece", "institute_id": "nitw", "institute_name": "NIT Warangal", "institute_type": "NIT", "program_name": "Electronics and Communication Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Telangana", "city": "Warangal"},
  {"id": "nitt-cs", "institute_id": "nitt", "institute_name": "NIT Trichy", "institute_type": "NIT", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Tamil Nadu", "city": "Tiruchirappalli"},
  {"id": "nitt-ece", "institute_id": "nitt", "institute_name": "NIT Trichy", "institute_type": "NIT", "program_name": "Electronics and Communication Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Tamil Nadu", "city": "Tiruchirappalli"},
  {"id": "iiita-it", "institute_id": "iiita", "institute_name": "IIIT Allahabad", "institute_type": "IIIT", "program_name": "Information Technology", "duration": "4 Years", "degree": "B.Tech", "state": "Uttar Pradesh", "city": "Prayagraj"},
  {"id": "dtu-cs", "institute_id": "dtudelhi", "institute_name": "DTU Delhi", "institute_type": "GFTI", "program_name": "Computer Science and Engineering", "duration": "4 Years", "degree": "B.Tech", "state": "Delhi", "city": "New Delhi"},
]

DEMO_CUTOFFS = [
  # IIT Bombay CS — OPEN AI GN (demo values only)
  {"id":"c1","year":2021,"round":6,"institute_id":"iitb","institute_name":"IIT Bombay","institute_type":"IIT","program_name":"Computer Science and Engineering","quota":"AI","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1,"closing_rank":67,"rank_type":"Advanced","state":"Maharashtra"},
  {"id":"c2","year":2022,"round":6,"institute_id":"iitb","institute_name":"IIT Bombay","institute_type":"IIT","program_name":"Computer Science and Engineering","quota":"AI","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1,"closing_rank":72,"rank_type":"Advanced","state":"Maharashtra"},
  {"id":"c3","year":2023,"round":6,"institute_id":"iitb","institute_name":"IIT Bombay","institute_type":"IIT","program_name":"Computer Science and Engineering","quota":"AI","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1,"closing_rank":58,"rank_type":"Advanced","state":"Maharashtra"},
  {"id":"c4","year":2024,"round":6,"institute_id":"iitb","institute_name":"IIT Bombay","institute_type":"IIT","program_name":"Computer Science and Engineering","quota":"AI","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1,"closing_rank":62,"rank_type":"Advanced","state":"Maharashtra"},
  # NIT Trichy CS OS OPEN GN (demo values only)
  {"id":"c13","year":2021,"round":6,"institute_id":"nitt","institute_name":"NIT Trichy","institute_type":"NIT","program_name":"Computer Science and Engineering","quota":"OS","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1820,"closing_rank":3450,"rank_type":"Main","state":"Tamil Nadu"},
  {"id":"c14","year":2022,"round":6,"institute_id":"nitt","institute_name":"NIT Trichy","institute_type":"NIT","program_name":"Computer Science and Engineering","quota":"OS","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1960,"closing_rank":3710,"rank_type":"Main","state":"Tamil Nadu"},
  {"id":"c15","year":2023,"round":6,"institute_id":"nitt","institute_name":"NIT Trichy","institute_type":"NIT","program_name":"Computer Science and Engineering","quota":"OS","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1750,"closing_rank":3280,"rank_type":"Main","state":"Tamil Nadu"},
  {"id":"c16","year":2024,"round":6,"institute_id":"nitt","institute_name":"NIT Trichy","institute_type":"NIT","program_name":"Computer Science and Engineering","quota":"OS","seat_pool":"OPEN","gender_pool":"Gender-Neutral","opening_rank":1890,"closing_rank":3520,"rank_type":"Main","state":"Tamil Nadu"},
]
