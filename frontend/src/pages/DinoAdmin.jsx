import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { LogOut, FileText, Clipboard, FolderOpen, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dispense as initialDispense, simulazioni as initialSimulazioni } from '../data/dinoMock';
import { useToast } from '../hooks/use-toast';

export const DinoAdmin = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [dispense, setDispense] = useState(initialDispense);
  const [simulazioni, setSimulazioni] = useState(initialSimulazioni);
  const [activeTab, setActiveTab] = useState('dispense');

  // States for adding new items
  const [showAddDispensa, setShowAddDispensa] = useState(false);
  const [showAddSimulazione, setShowAddSimulazione] = useState(false);
  const [newDispensa, setNewDispensa] = useState({
    titolo: '',
    materia: 'Biologia',
    descrizione: '',
    aChiServe: '',
    pagine: 1,
    tag: ''
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout effettuato",
      description: "A presto!",
    });
    navigate('/');
  };

  const handleDeleteDispensa = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa dispensa?')) {
      setDispense(dispense.filter(d => d.id !== id));
      toast({
        title: "Dispensa eliminata",
        description: "La dispensa è stata rimossa.",
      });
    }
  };

  const handleToggleDispensa = (id) => {
    setDispense(dispense.map(d => 
      d.id === id ? { ...d, pubblicata: !d.pubblicata } : d
    ));
    toast({
      title: "Stato aggiornato",
      description: "Lo stato di pubblicazione è stato modificato.",
    });
  };

  const handleAddDispensa = (e) => {
    e.preventDefault();
    const tags = newDispensa.tag.split(',').map(t => t.trim()).filter(t => t);
    const dispensa = {
      id: dispense.length + 1,
      ...newDispensa,
      tag: tags,
      pubblicata: true,
      pagine: parseInt(newDispensa.pagine)
    };
    setDispense([...dispense, dispensa]);
    setNewDispensa({
      titolo: '',
      materia: 'Biologia',
      descrizione: '',
      aChiServe: '',
      pagine: 1,
      tag: ''
    });
    setShowAddDispensa(false);
    toast({
      title: "Dispensa aggiunta!",
      description: "La nuova dispensa è stata creata.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Area Admin DinoMed</h1>
              <p className="text-blue-100">Benvenuto, {user?.username}</p>
            </div>
            <Button 
              onClick={handleLogout}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-md">
            <TabsTrigger value="dispense" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Gestione Dispense
            </TabsTrigger>
            <TabsTrigger value="simulazioni" className="data-[state=active]:bg-lime-600 data-[state=active]:text-white">
              <Clipboard className="h-4 w-4 mr-2" />
              Gestione Simulazioni
            </TabsTrigger>
            <TabsTrigger value="file" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <FolderOpen className="h-4 w-4 mr-2" />
              Gestione File
            </TabsTrigger>
          </TabsList>

          {/* Gestione Dispense */}
          <TabsContent value="dispense" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <div className="flex justify-between items-center">
                  <CardTitle>Elenco Dispense ({dispense.length})</CardTitle>
                  <Button 
                    onClick={() => setShowAddDispensa(!showAddDispensa)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Dispensa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {showAddDispensa && (
                  <form onSubmit={handleAddDispensa} className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Nuova Dispensa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Titolo"
                        value={newDispensa.titolo}
                        onChange={(e) => setNewDispensa({...newDispensa, titolo: e.target.value})}
                        required
                      />
                      <select
                        className="border-2 border-gray-200 rounded-md px-3 py-2"
                        value={newDispensa.materia}
                        onChange={(e) => setNewDispensa({...newDispensa, materia: e.target.value})}
                      >
                        <option>Biologia</option>
                        <option>Chimica</option>
                        <option>Fisica</option>
                        <option>Generale</option>
                      </select>
                      <Textarea
                        placeholder="Descrizione"
                        value={newDispensa.descrizione}
                        onChange={(e) => setNewDispensa({...newDispensa, descrizione: e.target.value})}
                        required
                        className="md:col-span-2"
                      />
                      <Textarea
                        placeholder="A chi serve"
                        value={newDispensa.aChiServe}
                        onChange={(e) => setNewDispensa({...newDispensa, aChiServe: e.target.value})}
                        required
                        className="md:col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Numero pagine"
                        value={newDispensa.pagine}
                        onChange={(e) => setNewDispensa({...newDispensa, pagine: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Tag (separati da virgola)"
                        value={newDispensa.tag}
                        onChange={(e) => setNewDispensa({...newDispensa, tag: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <Button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white">
                        Salva
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddDispensa(false)}>
                        Annulla
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {dispense.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{d.titolo}</h4>
                          <Badge className={d.pubblicata ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {d.pubblicata ? 'Pubblicata' : 'Bozza'}
                          </Badge>
                          <Badge variant="outline">{d.materia}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{d.descrizione}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDispensa(d.id)}
                        >
                          {d.pubblicata ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteDispensa(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestione Simulazioni */}
          <TabsContent value="simulazioni" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-lime-50 to-white">
                <div className="flex justify-between items-center">
                  <CardTitle>Elenco Simulazioni</CardTitle>
                  <Button className="bg-lime-600 hover:bg-lime-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Simulazione
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {Object.entries(simulazioni).map(([materia, sims]) => (
                  <div key={materia} className="mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 capitalize">{materia}</h3>
                    <div className="space-y-3">
                      {sims.map((sim) => (
                        <div key={sim.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-semibold text-gray-900">{sim.titolo}</h4>
                              <Badge className={sim.attiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {sim.attiva ? 'Attiva' : 'Disattiva'}
                              </Badge>
                              <Badge variant="outline">{sim.tipo}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {sim.domande} domande • {sim.durata} • {sim.livello}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestione File */}
          <TabsContent value="file" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-white">
                <CardTitle>Libreria File</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestione File</h3>
                  <p className="text-gray-600 mb-6">
                    Carica PDF, immagini e altri file per le dispense e le simulazioni.
                  </p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Carica File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
