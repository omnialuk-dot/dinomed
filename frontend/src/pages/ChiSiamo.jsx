import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Users, Target, Heart, Shield } from 'lucide-react';

export const ChiSiamo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con logo e immagine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <div className="flex justify-center lg:justify-start items-center mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/0nbasxb8_IMG_0596.png" 
                alt="DinoMed" 
                className="h-16 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Chi siamo
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Studenti che hanno vissuto la confusione del semestre filtro
            </p>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
              alt="Team di studenti" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Contenuto principale */}
        <div className="prose max-w-none text-gray-700 space-y-6 mb-12">
          <p>
            <strong>DinoMed</strong> è nato dall'esperienza diretta di studenti di Medicina che hanno 
            affrontato il semestre filtro. Ci siamo accorti che il problema principale non è la mancanza 
            di studio, ma la <strong>dispersione e la confusione</strong> su cosa e come studiare.
          </p>
          <p>
            Abbiamo osservato il formato reale dell'esame, analizzato come vengono formulate le domande, 
            e capito che molti studenti preparati sbagliano non per ignoranza, ma perché si allenano 
            su materiali diversi dal tipo di prova che affronteranno.
          </p>
          <p className="text-lg font-semibold text-gray-900">
            DinoMed non è una scuola. Non vende corsi. Non promette punteggi o risultati garantiti.
          </p>
          <p>
            È semplicemente un <strong>supporto gratuito</strong> per chi vuole allenarsi al formato 
            specifico del semestre filtro: crocette, completamenti, distrattori tipici, parole-trappola.
          </p>
        </div>

        {/* Valori */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Creato da studenti</h3>
              <p className="text-sm text-gray-600">
                Conosciamo il problema perché lo abbiamo vissuto in prima persona.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-lime-100 hover:border-lime-300 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-lime-100 to-lime-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Target className="h-8 w-8 text-lime-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Focus sul formato</h3>
              <p className="text-sm text-gray-600">
                Non teoria generica, ma allenamento specifico su come vengono fatte le domande.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Heart className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Completamente gratuito</h3>
              <p className="text-sm text-gray-600">
                Nessun costo, nessuna registrazione obbligatoria, nessuna promessa commerciale.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patto di trasparenza */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-lime-50 rounded-lg border-2 border-blue-200 p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            Patto di trasparenza
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
              <span className="text-gray-700"><strong>Gratuito</strong>: nessun pagamento, mai.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-lime-600 w-2 h-2 rounded-full"></div>
              <span className="text-gray-700"><strong>Niente promesse</strong>: non garantiamo risultati o punteggi.</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
              <span className="text-gray-700"><strong>Contenuti basati sul formato</strong>: tutto costruito a partire dall'esame reale.</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-md">
          <p className="text-gray-700">
            <strong>Importante:</strong> DinoMed non garantisce risultati, non promette punteggi, 
            e non sostituisce lo studio personale. È uno strumento di supporto per orientare 
            la preparazione sul formato reale dell'esame.
          </p>
        </div>
      </div>
    </div>
  );
};
