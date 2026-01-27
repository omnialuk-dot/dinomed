// Quiz Demo Data

export const demoQuiz = {
  id: 'demo',
  titolo: 'Demo – Simulazione Mista',
  descrizione: '5 domande per provare il formato del semestre filtro',
  tipo: 'mix',
  domande: 5,
  durata: 6,
  materie: ['Biologia', 'Chimica', 'Fisica'],
  domande_list: [
    {
      id: 1,
      tipo: 'crocetta',
      materia: 'Biologia',
      testo: 'Quale struttura è presente nelle cellule vegetali ma non in quelle animali?',
      opzioni: [
        'Mitocondri',
        'Ribosomi',
        'Parete cellulare',
        'Membrana plasmatica'
      ],
      rispostaCorretta: 2, // index 2 = "Parete cellulare"
      spiegazione: 'Le cellule vegetali hanno parete cellulare (cellulosa). Mitocondri, ribosomi e membrana plasmatica sono presenti anche nelle cellule animali.'
    },
    {
      id: 2,
      tipo: 'crocetta',
      materia: 'Chimica',
      testo: 'In una reazione redox, l’ossidazione corrisponde a:',
      opzioni: [
        'Acquisto di elettroni',
        'Perdita di elettroni',
        'Diminuzione del numero di ossidazione',
        'Formazione di un sale'
      ],
      rispostaCorretta: 1, // index 1 = "Perdita di elettroni"
      spiegazione: 'Ossidazione = perdita di elettroni (LEO). Riduzione = acquisto di elettroni (GER).'
    },
    {
      id: 3,
      tipo: 'completamento',
      materia: 'Fisica',
      testo: "Completa: L'unità di misura della forza nel Sistema Internazionale è il ________.",
      rispostaCorretta: 'newton',
      risposteAccettate: ['newton', 'Newton', 'N'],
      spiegazione: 'La forza si misura in newton (N), definito come kg·m/s².'
    },
    {
      id: 4,
      tipo: 'crocetta',
      materia: 'Biologia',
      testo: 'Il DNA è composto da nucleotidi che contengono:',
      opzioni: [
        'Ribosio e uracile',
        'Desossiribosio e timina',
        'Ribosio e timina',
        'Desossiribosio e uracile'
      ],
      rispostaCorretta: 1, // index 1 = "Desossiribosio e timina"
      spiegazione: "Nel DNA lo zucchero è desossiribosio e una base tipica è la timina. L'uracile è tipico dell'RNA."
    },
    {
      id: 5,
      tipo: 'completamento',
      materia: 'Chimica',
      testo: 'Completa: Una soluzione con pH 3 è ________ (acida/basica).',
      rispostaCorretta: 'acida',
      risposteAccettate: ['acida', 'Acida'],
      spiegazione: 'pH < 7 indica ambiente acido, pH = 7 neutro, pH > 7 basico.'
    }
  ]
};
