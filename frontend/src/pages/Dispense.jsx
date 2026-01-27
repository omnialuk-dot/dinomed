import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Download, FileText, Tag, Search } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Dispense = () => {
  const [dispense, setDispense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMateria, setFilterMateria] = useState('Tutte');

  useEffect(() => {
    loadDispense();
  }, []);

  const loadDispense = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/dispense/pubbliche`);
      setDispense(response.data);
    } catch (error) {
      console.error('Errore caricamento dispense:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMateriaBadgeColor = (materia) => {
    switch (materia) {
      case 'Biologia':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Chimica':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fisica':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const filteredDispense = dispense.filter(d => {
    const matchSearch = d.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       d.descrizione.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMateria = filterMateria === 'Tutte' || d.materia === filterMateria;
    return matchSearch && matchMateria;
  });

  const materie = ['Tutte', 'Biologia', 'Chimica', 'Fisica', 'Generale'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
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
          
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80" 
              alt="Studio con dispense" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Filtri e ricerca */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca dispense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {materie.map(materia => (
              <Button
                key={materia}
                onClick={() => setFilterMateria(materia)}
                variant={filterMateria === materia ? "default" : "outline"}
                className={filterMateria === materia ? "bg-blue-600 text-white" : ""}
                size="sm"
              >
                {materia}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento dispense...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredDispense.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nessuna dispensa trovata</p>
          </div>
        )}

        {/* Lista dispense */}
        {!loading && filteredDispense.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDispense.map((dispensa) => (
              <Card key={dispensa.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
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
                      {dispensa.tag && dispensa.tag.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {dispensa.file_url ? (
                      <a href={dispensa.file_url} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center space-x-2 shadow-md">
                          <Download className="h-4 w-4" />
                          <span>Scarica PDF</span>
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                        PDF non disponibile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
