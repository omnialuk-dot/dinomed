import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Clock, FileQuestion, CheckSquare, Zap, AlertCircle, Play, Sparkles } from 'lucide-react';
import { simulazioni, feedbackEsempi } from '../data/dinoMock';
import { QuizPlayer } from '../components/QuizPlayer';
import { demoQuiz } from '../data/quizData';

export const DinoSimulazioni = () => {
  const [selectedTab, setSelectedTab] = useState('biologia');
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

  const getTipoBadge = (tipo) => {
    if (tipo === 'crocette') {
      return <Badge className="bg-blue-100 text-blue-700">Crocette</Badge>;
    } else if (tipo === 'completamento') {
      return <Badge className="bg-lime-100 text-lime-700">Completamento</Badge>;
    } else {
      return <Badge className="bg-purple-100 text-purple-700">Mix</Badge>;
    }
  };

  const renderSimulazione = (sim) => (
    <Card key={sim.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
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
            {sim.completamenti > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <CheckSquare className="h-3 w-3" />
                <span>{sim.completamenti} completamenti</span>
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{sim.durata}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>{sim.livello}</span>
            </Badge>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md">
            Inizia simulazione
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fadeIn">
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
            <p>
              Ogni simulazione è progettata per allenarti non solo sulle conoscenze, ma soprattutto 
              su <strong>come vengono chieste</strong> all'esame.
            </p>
          </div>
        </div>

        {/* Demo Quiz Card - Highlighted */}
        <Card className="mb-8 border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-2xl animate-scaleIn">
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
              >
                <Play className="h-5 w-5 mr-2" />
                Parti la Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs per materie */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100">
            <TabsTrigger value="biologia" className="data-[state=active]:bg-lime-600 data-[state=active]:text-white">Biologia</TabsTrigger>
            <TabsTrigger value="chimica" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Chimica</TabsTrigger>
            <TabsTrigger value="fisica" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Fisica</TabsTrigger>
          </TabsList>

          <TabsContent value="biologia" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {simulazioni.biologia.map(renderSimulazione)}
            </div>
          </TabsContent>

          <TabsContent value="chimica" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {simulazioni.chimica.map(renderSimulazione)}
            </div>
          </TabsContent>

          <TabsContent value="fisica" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {simulazioni.fisica.map(renderSimulazione)}
            </div>
          </TabsContent>
        </Tabs>

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
            {feedbackEsempi.generale.map((feedback, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="bg-lime-100 rounded-full p-1.5 mt-0.5">
                  <div className="w-2 h-2 bg-lime-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">{feedback}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
