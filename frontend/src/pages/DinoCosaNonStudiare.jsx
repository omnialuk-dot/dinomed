import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { cosaNonStudiare } from '../data/dinoMock';

export const DinoCosaNonStudiare = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cosa NON studiare (o non approfondire troppo)
          </h1>
          
          <div className="prose max-w-none text-gray-700 space-y-4">
            <p>
              Questa sezione è dedicata a chi vuole <strong>ottimizzare il tempo</strong> concentrandosi 
              su ciò che rende davvero nel formato del semestre filtro.
            </p>
            <p>
              Il problema non è studiare poco, ma studiare male. Approfondire troppo argomenti 
              che poi vengono chiesti in modo diverso crea confusione e false sicurezze.
            </p>
            <p className="font-semibold text-lg">
              La resa tempo/punti conta. Usa questa guida per decidere dove investire le tue ore.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mt-6 shadow-md">
            <p className="text-gray-700 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Attenzione:</strong> queste sono indicazioni generali basate sull'esperienza. 
                Ogni anno l'esame può variare. L'obiettivo è orientarti, non sostituire il tuo giudizio.
              </span>
            </p>
          </div>
        </div>

        {/* Sezioni */}
        <div className="space-y-6">
          {cosaNonStudiare.map((sezione, index) => (
            <Card key={index} className="border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <TrendingDown className="h-5 w-5 text-blue-600 mr-2" />
                  {sezione.titolo}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {sezione.punti.map((punto, pIndex) => (
                    <li key={pIndex} className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-1.5 mt-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{punto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nota finale */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-lime-50 rounded-lg border-2 border-blue-200 p-8 shadow-lg">
          <h3 className="font-bold text-xl text-gray-900 mb-4">Come usare questa guida</h3>
          <div className="text-gray-700 space-y-3">
            <p>
              Non si tratta di <em>non studiare</em> questi argomenti, ma di <strong>non approfondirli 
              oltre il necessario</strong> per il formato test.
            </p>
            <p>
              Chiediti sempre: "Questo livello di dettaglio può entrare in una crocetta o in un completamento?"
            </p>
            <p>
              Se la risposta è no, meglio dedicare quel tempo a fare più simulazioni sul formato reale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
