// Mock data per DinoMed

export const simulazioni = {
  biologia: [
    {
      id: 1,
      titolo: "Cellula e membrane",
      tipo: "crocette",
      domande: 12,
      completamenti: 0,
      durata: "10 min",
      livello: "base/medio",
      descrizione: "Strutture cellulari e meccanismi di trasporto attraverso membrane.",
      attiva: true
    },
    {
      id: 2,
      titolo: "Genetica essenziale",
      tipo: "mix",
      domande: 10,
      completamenti: 3,
      durata: "13 min",
      livello: "medio",
      descrizione: "DNA, RNA, leggi di Mendel e ereditarietà.",
      attiva: true
    },
    {
      id: 3,
      titolo: "Sistema immunitario",
      tipo: "crocette",
      domande: 15,
      completamenti: 0,
      durata: "14 min",
      livello: "medio/alto",
      descrizione: "Immunità innata e acquisita, anticorpi e risposta immunitaria.",
      attiva: true
    },
    {
      id: 4,
      titolo: "Ecologia & evoluzione",
      tipo: "mix",
      domande: 8,
      completamenti: 4,
      durata: "12 min",
      livello: "medio",
      descrizione: "Selezione naturale, ecosistemi e relazioni tra organismi.",
      attiva: true
    }
  ],
  chimica: [
    {
      id: 5,
      titolo: "Moli e stechiometria",
      tipo: "mix",
      domande: 10,
      completamenti: 3,
      durata: "15 min",
      livello: "base/medio",
      descrizione: "Calcoli stechiometrici, formule e bilanciamento reazioni.",
      attiva: true
    },
    {
      id: 6,
      titolo: "Acidi e basi",
      tipo: "crocette",
      domande: 12,
      completamenti: 0,
      durata: "12 min",
      livello: "medio",
      descrizione: "pH, equilibri acido-base, soluzioni tampone.",
      attiva: true
    },
    {
      id: 7,
      titolo: "Redox rapida",
      tipo: "crocette",
      domande: 10,
      completamenti: 0,
      durata: "12 min",
      livello: "medio",
      descrizione: "Reazioni di ossidoriduzione e numero di ossidazione.",
      attiva: true
    },
    {
      id: 8,
      titolo: "Equilibri",
      tipo: "mix",
      domande: 8,
      completamenti: 4,
      durata: "14 min",
      livello: "medio/alto",
      descrizione: "Equilibrio chimico, costanti e principio di Le Chatelier.",
      attiva: true
    }
  ],
  fisica: [
    {
      id: 9,
      titolo: "Cinematica",
      tipo: "crocette",
      domande: 12,
      completamenti: 0,
      durata: "12 min",
      livello: "base/medio",
      descrizione: "Moto rettilineo, velocità e accelerazione.",
      attiva: true
    },
    {
      id: 10,
      titolo: "Dinamica",
      tipo: "mix",
      domande: 10,
      completamenti: 3,
      durata: "15 min",
      livello: "medio",
      descrizione: "Forze, leggi di Newton e applicazioni pratiche.",
      attiva: true
    },
    {
      id: 11,
      titolo: "Energia e lavoro",
      tipo: "crocette",
      domande: 12,
      completamenti: 0,
      durata: "13 min",
      livello: "medio",
      descrizione: "Lavoro, energia cinetica e potenziale, conservazione.",
      attiva: true
    },
    {
      id: 12,
      titolo: "Elettricità base",
      tipo: "mix",
      domande: 8,
      completamenti: 4,
      durata: "14 min",
      livello: "medio",
      descrizione: "Corrente, tensione, resistenza e circuiti semplici.",
      attiva: true
    }
  ]
};

export const feedbackEsempi = {
  generale: [
    "Hai sbagliato perché due opzioni erano quasi identiche: qui conta la parola chiave.",
    "Nei completamenti perdi punti per termini troppo generici: serve precisione.",
    "Il problema non è il calcolo, è leggere male il testo: prova a sottolineare dati e richiesta."
  ]
};

export const dispense = [
  {
    id: 1,
    titolo: "Parole-trappola nelle crocette",
    materia: "Generale",
    descrizione: "Esempi di 'sempre', 'mai', 'solo' e altre parole che cambiano completamente il significato delle risposte.",
    aChiServe: "Utile per tutti: riduce errori da lettura frettolosa.",
    pagine: 6,
    tag: ["crocette", "errori", "generale"],
    pubblicata: true
  },
  {
    id: 2,
    titolo: "Completamenti: come evitare risposte vaghe",
    materia: "Generale",
    descrizione: "Tecniche per dare risposte precise nei completamenti, evitando termini troppo generici.",
    aChiServe: "Per chi perde punti nei completamenti pur conoscendo l'argomento.",
    pagine: 5,
    tag: ["completamenti", "tecnica", "generale"],
    pubblicata: true
  },
  {
    id: 3,
    titolo: "Biologia: definizioni simili che confondono",
    materia: "Biologia",
    descrizione: "Confronto tra termini che sembrano intercambiabili ma hanno significati diversi (es. mitosi/meiosi).",
    aChiServe: "Per evitare confusione tra concetti simili in biologia.",
    pagine: 8,
    tag: ["biologia", "definizioni"],
    pubblicata: true
  },
  {
    id: 4,
    titolo: "Biologia: errori ricorrenti su genetica",
    materia: "Biologia",
    descrizione: "Gli sbagli più frequenti su geni, cromosomi, DNA e eredità.",
    aChiServe: "Focus su genetica con esempi di errori tipici del semestre filtro.",
    pagine: 10,
    tag: ["biologia", "genetica"],
    pubblicata: true
  },
  {
    id: 5,
    titolo: "Chimica: formule che sembrano uguali",
    materia: "Chimica",
    descrizione: "Distinzione tra formule molecolari, di struttura e brute con esempi pratici.",
    aChiServe: "Per non confondere i diversi tipi di formule chimiche.",
    pagine: 7,
    tag: ["chimica", "formule"],
    pubblicata: true
  },
  {
    id: 6,
    titolo: "Chimica: acidi/basi senza confusione",
    materia: "Chimica",
    descrizione: "Schema chiaro su pH, definizioni di Brønsted-Lowry e Lewis, con esempi diretti.",
    aChiServe: "Chiarezza su acidi e basi per rispondere velocemente alle crocette.",
    pagine: 9,
    tag: ["chimica", "acidi", "basi"],
    pubblicata: true
  },
  {
    id: 7,
    titolo: "Fisica: unità di misura e conversioni",
    materia: "Fisica",
    descrizione: "Tabella rapida delle unità SI e conversioni più frequenti nei problemi.",
    aChiServe: "Per non perdere tempo (e punti) sulle conversioni.",
    pagine: 5,
    tag: ["fisica", "unità"],
    pubblicata: true
  },
  {
    id: 8,
    titolo: "Fisica: problemi brevi, lettura veloce",
    materia: "Fisica",
    descrizione: "Come estrarre dati e richiesta da problemi di fisica in pochi secondi.",
    aChiServe: "Tecnica di lettura per problemi che sembrano lunghi ma sono diretti.",
    pagine: 6,
    tag: ["fisica", "tecnica"],
    pubblicata: true
  },
  {
    id: 9,
    titolo: "Stechiometria: passaggi minimi per non sbagliare",
    materia: "Chimica",
    descrizione: "Metodo step-by-step per calcoli stechiometrici senza errori.",
    aChiServe: "Per chi sbaglia i calcoli non per teoria ma per procedura.",
    pagine: 8,
    tag: ["chimica", "stechiometria"],
    pubblicata: true
  },
  {
    id: 10,
    titolo: "Checklist pre-test: come gestire tempo e fretta",
    materia: "Generale",
    descrizione: "Lista pratica di controllo prima e durante il test per gestire tempo e ansia.",
    aChiServe: "Per tutti, da consultare prima di ogni simulazione o test reale.",
    pagine: 4,
    tag: ["generale", "tecnica", "tempo"],
    pubblicata: true
  }
];

export const cosaNonStudiare = [
  {
    titolo: "Quando stai approfondendo troppo",
    punti: [
      "Se un argomento ti richiede più di 2 ore di studio per un singolo concetto, fermati e chiediti: questo livello di dettaglio serve per una crocetta?",
      "Derivazioni matematiche complesse: utili per capire, ma raramente richieste nel formato test.",
      "Storia delle scoperte scientifiche: interessante ma quasi mai oggetto di domande al semestre filtro.",
      "Casi particolari ed eccezioni ultra-specifiche: impara prima la regola generale."
    ]
  },
  {
    titolo: "Errori di dispersione tipici",
    punti: [
      "Fare 50 esercizi lunghi invece di 100 domande formato test: il primo non prepara al secondo.",
      "Leggere 3 libri diversi sullo stesso argomento: meglio uno ben fatto + simulazioni.",
      "Studiare argomenti che il professore ha definito 'cultura generale' o 'fuori programma'.",
      "Passare ore su formule che non hai mai visto in una domanda tipo."
    ]
  },
  {
    titolo: "Come decidere cosa saltare",
    punti: [
      "Prova a trasformare l'argomento in una domanda a crocette: se non riesci, probabilmente è low priority.",
      "Guarda quante domande passate ci sono su quell'argomento: se sono zero, valuta bene.",
      "Chiedi a chi ha passato l'esame: cosa non è mai stato chiesto?",
      "Se un argomento occupa 10 pagine di teoria ma genera solo 1 domanda, ottimizza il tempo."
    ]
  }
];
