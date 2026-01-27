import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Target, AlertCircle, BookOpen, CheckCircle2, Play } from 'lucide-react';
import { QuizPlayer } from '../components/QuizPlayer';
import { demoQuiz } from '../data/quizData';

export const DinoHome = () => {
  const [showDemo, setShowDemo] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section con mascotte e background image */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-lime-50 py-16 sm:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1752920299180-e8fd9276c202" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Testo */}
            <div className="animate-fadeIn">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
                DinoMed
              </h1>
              <h2 className="text-2xl sm:text-3xl text-gray-700 mb-6">
                Da zero confusione a più chiarezza.
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                Allenamento sul formato reale del semestre filtro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/simulazioni">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    Inizia subito una simulazione
                  </Button>
                </Link>
                <Link to="/dispense">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-lime-600 text-lime-700 hover:bg-lime-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                    Scarica dispense gratuite
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mascotte */}
            <div className="flex justify-center lg:justify-end animate-slideInRight">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-2xl opacity-40"></div>
                <img 
                  src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/6a6b10sd_1384049B-0EB7-4CD8-857B-844777CEC3F5.png" 
                  alt="DinoMed Mascotte" 
                  className="relative h-64 w-64 sm:h-80 sm:w-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Quiz Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-scaleIn">
            <h2 className="text-3xl font-bold mb-4">🎯 Prova subito la Demo!</h2>
            <p className="text-blue-100 mb-8 text-lg">
              5 domande in formato reale per capire come funzionano le simulazioni DinoMed
            </p>
            <Button 
              onClick={() => setShowDemo(true)}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all"
            >
              <Play className="h-5 w-5 mr-2" />
              Parti la Demo (6 minuti)
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Card Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Formato reale</h3>
                <p className="text-gray-600 text-sm">
                  Crocette e completamenti come nel semestre filtro. Allenamento pratico, non teoria infinita.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-lime-100 hover:border-lime-300 hover:shadow-lg transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="bg-lime-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-lime-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Errori tipici</h3>
                <p className="text-gray-600 text-sm">
                  Spiegazioni brevi su perché si sbaglia: parole-trappola, distrattori, fretta.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Zero dispersione</h3>
                <p className="text-gray-600 text-sm">
                  Materiali mirati e una sezione 'Cosa NON studiare' per risparmiare tempo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Come funziona - 4 steps */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Come funziona
          </h2>
          
          <div className="space-y-6 stagger-children">
            {[
              {
                step: 1,
                titolo: "Scegli materia e modalità",
                descrizione: "Seleziona tra Biologia, Chimica, Fisica. Decidi se fare crocette, completamenti o mix."
              },
              {
                step: 2,
                titolo: "Fai un test breve",
                descrizione: "10-15 domande in 10-15 minuti. Formato identico al semestre filtro."
              },
              {
                step: 3,
                titolo: "Vedi spiegazioni + errori tipici",
                descrizione: "Feedback immediato con focus sulle parole-chiave e distrattori frequenti."
              },
              {
                step: 4,
                titolo: "Ripeti con focus sugli argomenti deboli",
                descrizione: "Allenati di più dove sbagli di più. Ottimizza il tempo di studio."
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-4 transform hover:translate-x-2 transition-all">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.titolo}</h3>
                  <p className="text-gray-600 text-sm">{item.descrizione}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nota onesta */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-lime-50 border-l-4 border-blue-600 p-6 rounded-r-lg shadow-md transform hover:scale-102 transition-all">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
              Nota onesta
            </h3>
            <p className="text-gray-700">
              DinoMed è gratuito e non promette risultati. Serve a farti allenare sul formato reale 
              della prova e a ridurre la confusione. Non sostituisce lo studio, lo orienta.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
