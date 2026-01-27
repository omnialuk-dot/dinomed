import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Clock, FileQuestion, CheckSquare, Zap, AlertCircle, Play, Sparkles, Loader2 } from 'lucide-react';
import { QuizPlayer } from '../components/QuizPlayer';
import { demoQuiz } from '../data/quizData';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Simulazioni = () => {
  const [selectedTab, setSelectedTab] = useState('tutte');
  const [showDemo, setShowDemo] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [simulazioni, setSimulazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    loadSimulazioni();
  }, []);

  const loadSimulazioni = async () => {
    try {
      const response = await axios.get(`${API}/simulazioni/attive`);
      setSimulazioni(response.data);
    } catch (error) {
      console.error('Errore caricamento simulazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (simulazioneId) => {
    setLoadingQuiz(true);
    try {
      const response = await axios.get(`${API}/simulazioni/${simulazioneId}`);
      setActiveQuiz(response.data);
    } catch (error) {
      console.error('Errore caricamento quiz:', error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Show demo quiz
  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuizPlayer 
            quiz={demoQuiz} 
            onComplete={() => {}}
            onBack={() => setShowDemo(false)}
          />
        </div>
      </div>
    );
  }

  // Show active quiz from database
  if (activeQuiz) {
    // Check if we have questions
    if (!activeQuiz.domande_list || activeQuiz.domande_list.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="max-w-md mx-auto border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="py-8">
                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Simulazione vuota</h2>
                <p className="text-gray-600 mb-4">Questa simulazione non ha ancora domande.</p>
                <Button onClick={() => setActiveQuiz(null)} variant="outline">
                  Torna alle simulazioni
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Transform data for QuizPlayer
    const quizForPlayer = {
      id: activeQuiz.simulazione.id,
      titolo: activeQuiz.simulazione.titolo,
      descrizione: activeQuiz.simulazione.descrizione,
      tipo: activeQuiz.simulazione.tipo,
      domande: activeQuiz.simulazione.domande,
      durata: activeQuiz.simulazione.durata,
      domande_list: activeQuiz.domande_list.map(d => ({
        id: d.id,
        tipo: d.tipo,
        materia: d.materia,
        testo: d.testo,
        opzioni: d.opzioni || [],
        rispostaCorretta: d.tipo === 'crocetta' ? parseInt(d.rispostaCorretta) : d.rispostaCorretta,
        risposteAccettate: d.risposteAccettate,
        spiegazione: d.spiegazione
      }))
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuizPlayer 
            quiz={quizForPlayer} 
            onComplete={() => {}}
            onBack={() => setActiveQuiz(null)}
          />
        </div>
      </div>
    );
  }

  const getTipoBadge = (tipo) => {
    if (tipo === 'crocette') {
      return <Badge className="bg-blue-100 text-blue-700">Crocette</Badge>;
    } else if (tipo === 'completamento') {
      return <Badge className="bg-lime-100 text-lime-700">Completamento</Badge>;
    } else {
      return <Badge className="bg-purple-100 text-purple-700">Mix</Badge>;
    }
  };

  const getLivelloBadge = (livello) => {
    const colors = {
      'facile': 'bg-green-100 text-green-700',
      'medio': 'bg-yellow-100 text-yellow-700',
      'difficile': 'bg-red-100 text-red-700'
    };
    return <Badge className={colors[livello] || 'bg-gray-100 text-gray-700'}>{livello}</Badge>;
  };

  // Filter simulazioni by materia
  const filteredSimulazioni = selectedTab === 'tutte' 
    ? simulazioni 
    : simulazioni.filter(s => s.materia.toLowerCase() === selectedTab.toLowerCase());

  const renderSimulazione = (sim) => (
    <Card key={sim.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all" data-testid={`quiz-card-${sim.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{sim.titolo}</CardTitle>
          {getTipoBadge(sim.tipo)}
        </div>
        <CardDescription>{sim.descrizione}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileQuestion className="h-3 w-3" />
              <span>{sim.domande} domande</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{sim.durata}</span>
            </Badge>
            {getLivelloBadge(sim.livello)}
          </div>
          <Button 
            onClick={() => startQuiz(sim.id)}
            disabled={loadingQuiz}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md"
            data-testid={`start-quiz-${sim.id}`}
          >
            {loadingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Inizia simulazione
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with image */}
        <div className="mb-12 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Simulazioni gratuite – formato semestre filtro
              </h1>
              
              <div className="prose max-w-none text-gray-700 space-y-4">
                <p>
                  Le simulazioni di DinoMed replicano esattamente il formato del semestre filtro:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Domande a crocette</strong>: scelta multipla con distrattori tipici</li>
                  <li><strong>Domande di completamento</strong>: riempi lo spazio con terminologia precisa</li>
                  <li><strong>Mix</strong>: combinazione di crocette e completamenti</li>
                </ul>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" 
                alt="Studenti che fanno simulazioni" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Demo Quiz Card - Highlighted */}
        <Card className="mb-8 border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-2xl animate-scaleIn" data-testid="demo-quiz-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                  <Badge className="bg-blue-600 text-white text-sm">DEMO GRATIS</Badge>
                </div>
                <CardTitle className="text-2xl">Demo – Simulazione Mista (5 domande)</CardTitle>
                <CardDescription className="text-base mt-2">
                  Prova subito come funzionano le simulazioni! 3 crocette + 2 completamenti su Bio/Chim/Fis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <FileQuestion className="h-3 w-3" />
                  <span>5 domande</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>6 minuti</span>
                </Badge>
                <Badge className="bg-purple-100 text-purple-700">Mix</Badge>
              </div>
              <Button 
                onClick={() => setShowDemo(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg text-lg py-6 transform hover:scale-105 transition-all"
                data-testid="start-demo-btn"
              >
                <Play className="h-5 w-5 mr-2" />
                Avvia la Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulazioni dal database */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 text-blue-600 mr-2" />
            Simulazioni disponibili
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Caricamento simulazioni...</p>
            </div>
          ) : simulazioni.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
              <CardContent className="py-12 text-center">
                <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nessuna simulazione disponibile al momento.</p>
                <p className="text-gray-500 text-sm mt-2">Prova la Demo sopra oppure torna più tardi!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tabs per materie */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                  <TabsTrigger value="tutte" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Tutte</TabsTrigger>
                  <TabsTrigger value="biologia" className="data-[state=active]:bg-lime-600 data-[state=active]:text-white">Biologia</TabsTrigger>
                  <TabsTrigger value="chimica" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Chimica</TabsTrigger>
                  <TabsTrigger value="fisica" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Fisica</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSimulazioni.map(renderSimulazione)}
              </div>

              {filteredSimulazioni.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nessuna simulazione trovata per questa materia.
                </p>
              )}
            </>
          )}
        </div>

        {/* Cosa guardare dopo il test */}
        <section className="bg-white rounded-lg border-2 border-blue-100 p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-2" />
            Cosa guardare dopo il test
          </h2>
          <p className="text-gray-700 mb-6">
            Dopo ogni simulazione riceverai feedback specifici. Ecco alcuni esempi di analisi degli errori:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <div className="bg-lime-100 rounded-full p-1.5 mt-0.5">
                <div className="w-2 h-2 bg-lime-600 rounded-full"></div>
              </div>
              <span className="text-gray-700">Rivedi il meccanismo di azione degli enzimi (capitolo 3)</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="bg-lime-100 rounded-full p-1.5 mt-0.5">
                <div className="w-2 h-2 bg-lime-600 rounded-full"></div>
              </div>
              <span className="text-gray-700">Ripassa le formule di cinematica</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="bg-lime-100 rounded-full p-1.5 mt-0.5">
                <div className="w-2 h-2 bg-lime-600 rounded-full"></div>
              </div>
              <span className="text-gray-700">Memorizza la nomenclatura dei gruppi funzionali</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
