// Mock data per MedZero

export const simulazioni = {
  biologia: [
    {
      id: 1,
      titolo: "Enzimi e metabolismo",
      domande: 10,
      completamenti: 2,
      durata: "12 minuti",
      descrizione: "Domande formulate come al semestre filtro, con definizioni simili e distrattori frequenti."
    },
    {
      id: 2,
      titolo: "DNA, RNA e sintesi proteica",
      domande: 8,
      completamenti: 3,
      durata: "15 minuti",
      descrizione: "Focus su terminologia e processi esatti come vengono chiesti all'esame."
    },
    {
      id: 3,
      titolo: "Ciclo cellulare e mitosi",
      domande: 12,
      completamenti: 1,
      durata: "10 minuti",
      descrizione: "Domande rapide su fasi e caratteristiche, senza approfondimenti teorici eccessivi."
    },
    {
      id: 4,
      titolo: "Membrane e trasporti cellulari",
      domande: 9,
      completamenti: 2,
      durata: "13 minuti",
      descrizione: "Attenzione ai termini chiave e alle distinzioni sottili tra meccanismi simili."
    }
  ],
  chimica: [
    {
      id: 5,
      titolo: "Legami chimici e nomenclatura",
      domande: 10,
      completamenti: 3,
      durata: "14 minuti",
      descrizione: "Domande dirette su tipi di legame e nomenclatura IUPAC, come al filtro."
    },
    {
      id: 6,
      titolo: "Equilibrio chimico e pH",
      domande: 8,
      completamenti: 2,
      durata: "12 minuti",
      descrizione: "Focus su riconoscimento rapido, non calcoli complessi."
    },
    {
      id: 7,
      titolo: "Stechiometria essenziale",
      domande: 7,
      completamenti: 2,
      durata: "11 minuti",
      descrizione: "Solo i calcoli base che compaiono effettivamente all'esame."
    },
    {
      id: 8,
      titolo: "Reazioni redox e bilanciamento",
      domande: 9,
      completamenti: 1,
      durata: "10 minuti",
      descrizione: "Domande formulate come nelle prove reali, con distrattori tipici."
    }
  ],
  fisica: [
    {
      id: 9,
      titolo: "Cinematica e dinamica base",
      domande: 10,
      completamenti: 2,
      durata: "13 minuti",
      descrizione: "Domande brevi che sembrano calcoli ma richiedono solo ragionamento."
    },
    {
      id: 10,
      titolo: "Lavoro, energia e potenza",
      domande: 8,
      completamenti: 2,
      durata: "11 minuti",
      descrizione: "Focus su definizioni e applicazioni dirette, senza derivazioni complesse."
    },
    {
      id: 11,
      titolo: "Elettrostatica e circuiti",
      domande: 9,
      completamenti: 3,
      durata: "15 minuti",
      descrizione: "Domande sul formato reale: riconoscimento e completamenti essenziali."
    },
    {
      id: 12,
      titolo: "Termodinamica essenziale",
      domande: 7,
      completamenti: 2,
      durata: "10 minuti",
      descrizione: "Solo concetti che compaiono effettivamente nel semestre filtro."
    }
  ]
};

export const feedbackEsempi = [
  "Errore tipico: conosci il concetto, ma sbagli perché due opzioni sono quasi identiche.",
  "Qui il problema non è la teoria, ma il completamento: basta una parola sbagliata.",
  "Hai perso tempo su domande che richiedevano solo riconoscimento rapido.",
  "Questo distrattore appare spesso: sembra corretto ma manca un dettaglio chiave.",
  "La domanda usa una formulazione diversa da quella del libro, ma il concetto è lo stesso."
];

export const dispense = [
  {
    id: 1,
    titolo: "Biologia: parole chiave che cambiano completamente la risposta (crocette)",
    materia: "Biologia",
    descrizione: "Elenco di termini e formulazioni che fanno la differenza nelle domande a scelta multipla.",
    pagine: 8
  },
  {
    id: 2,
    titolo: "Chimica: completamenti tipici e come non sbagliarli",
    materia: "Chimica",
    descrizione: "Analisi dei completamenti più frequenti con esempi reali dall'esame.",
    pagine: 12
  },
  {
    id: 3,
    titolo: "Fisica: domande brevi che sembrano calcoli ma non lo sono",
    materia: "Fisica",
    descrizione: "Come riconoscere quando serve ragionamento invece di calcolo complesso.",
    pagine: 10
  },
  {
    id: 4,
    titolo: "Come leggere una domanda prima ancora di pensare alla risposta",
    materia: "Generale",
    descrizione: "Tecnica di lettura per identificare subito cosa chiede davvero la domanda.",
    pagine: 6
  },
  {
    id: 5,
    titolo: "Distrattori frequenti in Biologia: impara a riconoscerli",
    materia: "Biologia",
    descrizione: "Le risposte sbagliate che appaiono più spesso e perché sembrano corrette.",
    pagine: 9
  },
  {
    id: 6,
    titolo: "Chimica: nomenclatura veloce per l'esame",
    materia: "Chimica",
    descrizione: "Solo le regole di nomenclatura che servono davvero al semestre filtro.",
    pagine: 7
  },
  {
    id: 7,
    titolo: "Fisica: formule essenziali e quando NON servono",
    materia: "Fisica",
    descrizione: "Le poche formule necessarie e quando la domanda richiede solo logica.",
    pagine: 8
  },
  {
    id: 8,
    titolo: "Gestione del tempo: come distribuire i minuti tra le domande",
    materia: "Generale",
    descrizione: "Strategie pratiche per non perdere tempo su domande che rendono poco.",
    pagine: 5
  },
  {
    id: 9,
    titolo: "Biologia: processi cellulari nel formato del filtro",
    materia: "Biologia",
    descrizione: "Come vengono chiesti i processi cellulari: focus su formato, non teoria astratta.",
    pagine: 11
  },
  {
    id: 10,
    titolo: "Errori da evitare nei completamenti di tutte le materie",
    materia: "Generale",
    descrizione: "Gli sbagli più comuni nei completamenti e come prevenirli.",
    pagine: 6
  }
];

export const cosaNonStudiare = [
  {
    categoria: "Biologia",
    punti: [
      "Approfondimenti eccessivi su vie metaboliche secondarie che non compaiono nelle crocette",
      "Dettagli storici su scoperte scientifiche (non richiesti nel formato dell'esame)",
      "Meccanismi molecolari ultra-specifici che vanno oltre le domande reali",
      "Esercizi di genetica complessi con alberi genealogici estesi (il filtro usa domande più dirette)"
    ]
  },
  {
    categoria: "Chimica",
    punti: [
      "Calcoli stechiometrici con più di 2-3 passaggi (troppo complessi per il formato dell'esame)",
      "Derivazioni teoriche delle leggi (non richieste, serve solo applicazione diretta)",
      "Chimica organica avanzata oltre le strutture base",
      "Problemi di equilibrio chimico con sistemi complessi (il filtro usa casi semplificati)"
    ]
  },
  {
    categoria: "Fisica",
    punti: [
      "Dimostrazioni matematiche delle formule (non compaiono all'esame)",
      "Esercizi con più di 2 corpi in movimento (troppo articolati per il formato)",
      "Approfondimenti sulla fisica moderna oltre i concetti base",
      "Problemi che richiedono sistemi di equazioni complessi"
    ]
  },
  {
    categoria: "Generale",
    punti: [
      "Tutto ciò che nei libri occupa più di una pagina per un singolo concetto",
      "Esercizi 'da olimpiadi' o da concorsi specializzati",
      "Argomenti che nei corsi universitari vengono trattati dopo il primo anno",
      "Approfondimenti che il professore stesso definisce 'cultura generale' e non materia d'esame"
    ]
  }
];
