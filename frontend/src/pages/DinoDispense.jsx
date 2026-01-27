import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, FileText, Tag } from 'lucide-react';
import { dispense } from '../data/dinoMock';

export const DinoDispense = () => {
  const getMateriaBadgeColor = (materia) => {
    switch (materia) {
      case 'Biologia':
        return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'Chimica':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fisica':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dispense gratuite (brevi e mirate)
          </h1>
          
          <div className="prose max-w-none text-gray-700 space-y-4 mb-6">
            <p>
              <strong>Regola:</strong> niente riassunti lunghi; solo materiale pratico "da esame".
            </p>
            <p>
              Ogni dispensa è costruita per rispondere a una domanda specifica:
              come evito questo tipo di errore? Come riconosco quella parola-trappola? 
              Quali sono i passaggi minimi per non sbagliare?
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-lime-50 border-l-4 border-blue-600 p-5 rounded-r-lg shadow-md">
            <p className="text-gray-700 font-medium flex items-center">
              <FileText className="inline h-5 w-5 text-blue-600 mr-2" />
              Download libero • Senza registrazione • Senza email
            </p>
          </div>
        </div>

        {/* Lista dispense */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dispense.map((dispensa) => (
            <Card key={dispensa.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${getMateriaBadgeColor(dispensa.materia)} border`}>
                    {dispensa.materia}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    {dispensa.pagine} pagine
                  </span>
                </div>
                <CardTitle className="text-lg">{dispensa.titolo}</CardTitle>
                <CardDescription className="space-y-2">
                  <p className="text-gray-600">{dispensa.descrizione}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    🎯 {dispensa.aChiServe}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {dispensa.tag.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center space-x-2 shadow-md">
                    <Download className="h-4 w-4" />
                    <span>Scarica PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
