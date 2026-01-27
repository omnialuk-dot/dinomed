import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Target, BookCheck, TrendingDown, Play, CheckCircle } from 'lucide-react';
import { QuizPlayer } from '../components/QuizPlayer';
import { demoQuiz } from '../data/quizData';

export const Home = () => {
  const [showDemo, setShowDemo] = useState(false);

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
                DinoMed
              </h1>
              <p className="text-2xl text-blue-600 font-semibold mb-6">
                Da zero confusione a più chiarezza.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Allenati sul formato reale del semestre filtro di Medicina. Simulazioni gratuite con domande a crocette e completamenti, esattamente come all'esame.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/simulazioni">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Inizia una simulazione
                  </Button>
                </Link>
                <Link to="/dispense">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg rounded-lg">
                    Scarica dispense gratuite
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center animate-slideInRight">
              <img 
                src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/0nbasxb8_IMG_0596.png" 
                alt="DinoMed" 
                className="h-64 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prova subito la demo gratuita
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            5 domande in formato reale (3 crocette + 2 completamenti) per capire come funzionano le simulazioni
          </p>
          <Button 
            onClick={() => setShowDemo(true)}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-lg shadow-xl"
          >
            <Play className="h-5 w-5 mr-2" />
            Avvia la demo (6 minuti)
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perché DinoMed
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" 
                  alt="Formato reale esame" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 -mt-14 relative z-10">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Formato reale</h3>
                <p className="text-gray-600 leading-relaxed">
                  Crocette e completamenti esattamente come nel semestre filtro. Nessun esercizio fuori formato.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80" 
                  alt="Correzione dettagliata" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8">
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 -mt-14 relative z-10">
                  <BookCheck className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Correzione dettagliata</h3>
                <p className="text-gray-600 leading-relaxed">
                  Spiegazioni chiare per ogni domanda. Impari dagli errori e capisci i distrattori tipici.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" 
                  alt="Zero dispersione" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 -mt-14 relative z-10">
                  <TrendingDown className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Zero dispersione</h3>
                <p className="text-gray-600 leading-relaxed">
                  Materiali mirati e una sezione dedicata a cosa NON studiare. Ottimizza il tempo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Come funziona
          </h2>
          
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Scegli materia e tipo di domande",
                desc: "Biologia, Chimica o Fisica. Crocette, completamenti o modalità mista."
              },
              {
                step: 2,
                title: "Fai la simulazione",
                desc: "10-15 domande in 10-15 minuti, come al semestre filtro."
              },
              {
                step: 3,
                title: "Leggi correzione e spiegazioni",
                desc: "Feedback immediato con focus sugli errori tipici e parole-chiave."
              },
              {
                step: 4,
                title: "Ripeti e migliora",
                desc: "Allenati sugli argomenti dove sbagli di più."
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Nota importante</h3>
                <p className="text-gray-700 leading-relaxed">
                  DinoMed è gratuito e non promette risultati. Serve ad allenarti sul formato reale della prova e a ridurre la confusione. Non sostituisce lo studio, lo orienta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
