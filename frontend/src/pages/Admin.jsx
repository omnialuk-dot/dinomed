import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { LogOut, FileText, Clipboard, FolderOpen, Plus, Trash2, Eye, EyeOff, Upload, Home, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Admin = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dispense');
  
  // Data states
  const [dispense, setDispense] = useState([]);
  const [simulazioni, setSimulazioni] = useState([]);
  const [files, setFiles] = useState([]);
  
  // Loading states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingDispense, setLoadingDispense] = useState(false);
  const [loadingSimulazioni, setLoadingSimulazioni] = useState(false);

  // Dispensa form
  const [showAddDispensa, setShowAddDispensa] = useState(false);
  const [newDispensa, setNewDispensa] = useState({
    titolo: '', materia: 'Biologia', descrizione: '', aChiServe: '', pagine: 1, tag: '', filename: ''
  });

  // Simulazione form & state
  const [showAddSimulazione, setShowAddSimulazione] = useState(false);
  const [newSimulazione, setNewSimulazione] = useState({
    titolo: '', materia: 'Biologia', tipo: 'crocette', domande: 10, durata: '15 min', livello: 'medio', descrizione: ''
  });
  const [expandedSimulazione, setExpandedSimulazione] = useState(null);
  const [domande, setDomande] = useState({});
  
  // Domanda form
  const [showAddDomanda, setShowAddDomanda] = useState(null);
  const [newDomanda, setNewDomanda] = useState({
    testo: '', tipo: 'crocetta', opzioni: ['', '', '', ''], rispostaCorretta: '0', spiegazione: '', materia: 'Biologia'
  });

  // ========== LOAD DATA (useCallback BEFORE useEffect) ==========
  const loadFiles = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/files/list`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Errore caricamento file:', error);
    }
  }, []);

  const loadDispense = useCallback(async () => {
    setLoadingDispense(true);
    try {
      const response = await axios.get(`${API}/dispense/`);
      setDispense(response.data);
    } catch (error) {
      console.error('Errore caricamento dispense:', error);
      toast({ title: "Errore", description: "Impossibile caricare le dispense", variant: "destructive" });
    } finally {
      setLoadingDispense(false);
    }
  }, [toast]);

  const loadSimulazioni = useCallback(async () => {
    setLoadingSimulazioni(true);
    try {
      const response = await axios.get(`${API}/simulazioni/`);
      setSimulazioni(response.data);
    } catch (error) {
      console.error('Errore caricamento simulazioni:', error);
      toast({ title: "Errore", description: "Impossibile caricare le simulazioni", variant: "destructive" });
    } finally {
      setLoadingSimulazioni(false);
    }
  }, [toast]);

  const loadDomande = useCallback(async (simulazioneId) => {
    try {
      const response = await axios.get(`${API}/simulazioni/${simulazioneId}/domande`);
      setDomande(prev => ({ ...prev, [simulazioneId]: response.data }));
    } catch (error) {
      console.error('Errore caricamento domande:', error);
    }
  }, []);

  // useEffect AFTER useCallback definitions
  useEffect(() => {
    loadDispense();
    loadSimulazioni();
    loadFiles();
  }, [loadDispense, loadSimulazioni, loadFiles]);

  // ========== HANDLERS ==========
  const handleLogout = () => {
    logout();
    toast({ title: "Logout effettuato", description: "A presto!" });
    navigate('/');
  };

  // --- FILE UPLOAD ---
  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      const response = await axios.post(`${API}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: "File caricato!", description: `${file.name} caricato con successo.` });
      loadFiles();
      return response.data.filename;
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile caricare il file.", variant: "destructive" });
      return null;
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (filename, fileType) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo file?')) return;
    try {
      await axios.delete(`${API}/files/${filename}?file_type=${fileType}`);
      toast({ title: "File eliminato", description: "Il file è stato rimosso." });
      loadFiles();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare il file.", variant: "destructive" });
    }
  };

  // --- DISPENSE ---
  const handleAddDispensa = async (e) => {
    e.preventDefault();
    const tags = newDispensa.tag.split(',').map(t => t.trim()).filter(t => t);
    
    try {
      await axios.post(`${API}/dispense/`, {
        ...newDispensa,
        tag: tags,
        pagine: parseInt(newDispensa.pagine),
        filename: newDispensa.filename || null
      });
      toast({ title: "Dispensa aggiunta!", description: "La nuova dispensa è stata creata." });
      setNewDispensa({ titolo: '', materia: 'Biologia', descrizione: '', aChiServe: '', pagine: 1, tag: '', filename: '' });
      setShowAddDispensa(false);
      loadDispense();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile creare la dispensa.", variant: "destructive" });
    }
  };

  const handleToggleDispensa = async (id) => {
    try {
      await axios.patch(`${API}/dispense/${id}/toggle`);
      toast({ title: "Stato aggiornato", description: "Lo stato di pubblicazione è stato modificato." });
      loadDispense();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato.", variant: "destructive" });
    }
  };

  const handleDeleteDispensa = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa dispensa?')) return;
    try {
      await axios.delete(`${API}/dispense/${id}`);
      toast({ title: "Dispensa eliminata", description: "La dispensa è stata rimossa." });
      loadDispense();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare la dispensa.", variant: "destructive" });
    }
  };

  // --- SIMULAZIONI ---
  const handleAddSimulazione = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/simulazioni/`, {
        ...newSimulazione,
        domande: parseInt(newSimulazione.domande)
      });
      toast({ title: "Simulazione creata!", description: "La nuova simulazione è stata aggiunta." });
      setNewSimulazione({ titolo: '', materia: 'Biologia', tipo: 'crocette', domande: 10, durata: '15 min', livello: 'medio', descrizione: '' });
      setShowAddSimulazione(false);
      loadSimulazioni();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile creare la simulazione.", variant: "destructive" });
    }
  };

  const handleToggleSimulazione = async (id) => {
    try {
      await axios.patch(`${API}/simulazioni/${id}/toggle`);
      toast({ title: "Stato aggiornato", description: "Lo stato di attivazione è stato modificato." });
      loadSimulazioni();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato.", variant: "destructive" });
    }
  };

  const handleDeleteSimulazione = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa simulazione e tutte le sue domande?')) return;
    try {
      await axios.delete(`${API}/simulazioni/${id}`);
      toast({ title: "Simulazione eliminata", description: "La simulazione e le sue domande sono state rimosse." });
      loadSimulazioni();
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare la simulazione.", variant: "destructive" });
    }
  };

  const toggleExpandSimulazione = (id) => {
    if (expandedSimulazione === id) {
      setExpandedSimulazione(null);
    } else {
      setExpandedSimulazione(id);
      if (!domande[id]) {
        loadDomande(id);
      }
    }
  };

  // --- DOMANDE ---
  const handleAddDomanda = async (simulazioneId) => {
    const opzioniFiltered = newDomanda.opzioni.filter(o => o.trim() !== '');
    
    if (newDomanda.tipo === 'crocetta' && opzioniFiltered.length < 2) {
      toast({ title: "Errore", description: "Inserisci almeno 2 opzioni per una domanda a crocetta.", variant: "destructive" });
      return;
    }
    
    try {
      await axios.post(`${API}/simulazioni/${simulazioneId}/domande`, {
        testo: newDomanda.testo,
        tipo: newDomanda.tipo,
        opzioni: newDomanda.tipo === 'crocetta' ? opzioniFiltered : null,
        rispostaCorretta: newDomanda.rispostaCorretta,
        risposteAccettate: newDomanda.tipo === 'completamento' ? [newDomanda.rispostaCorretta] : null,
        spiegazione: newDomanda.spiegazione,
        materia: newDomanda.materia
      });
      toast({ title: "Domanda aggiunta!", description: "La domanda è stata aggiunta alla simulazione." });
      setNewDomanda({ testo: '', tipo: 'crocetta', opzioni: ['', '', '', ''], rispostaCorretta: '0', spiegazione: '', materia: 'Biologia' });
      setShowAddDomanda(null);
      loadDomande(simulazioneId);
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile aggiungere la domanda.", variant: "destructive" });
    }
  };

  const handleDeleteDomanda = async (simulazioneId, domandaId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa domanda?')) return;
    try {
      await axios.delete(`${API}/simulazioni/${simulazioneId}/domande/${domandaId}`);
      toast({ title: "Domanda eliminata", description: "La domanda è stata rimossa." });
      loadDomande(simulazioneId);
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare la domanda.", variant: "destructive" });
    }
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 mb-8" data-testid="admin-header">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Area Admin DinoMed</h1>
              <p className="text-blue-100">Benvenuto, {user?.username}</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => navigate('/')} className="bg-white text-blue-600 hover:bg-gray-100" data-testid="btn-torna-sito">
                <Home className="h-4 w-4 mr-2" />Torna al sito
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10" data-testid="btn-logout">
                <LogOut className="h-4 w-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-md">
            <TabsTrigger value="dispense" data-testid="tab-dispense"><FileText className="h-4 w-4 mr-2" />Gestione Dispense</TabsTrigger>
            <TabsTrigger value="simulazioni" data-testid="tab-simulazioni"><Clipboard className="h-4 w-4 mr-2" />Gestione Simulazioni</TabsTrigger>
            <TabsTrigger value="file" data-testid="tab-file"><FolderOpen className="h-4 w-4 mr-2" />Gestione File</TabsTrigger>
          </TabsList>

          {/* ========== TAB DISPENSE ========== */}
          <TabsContent value="dispense">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <CardTitle>Elenco Dispense ({dispense.length})</CardTitle>
                  <Button onClick={() => setShowAddDispensa(!showAddDispensa)} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="btn-aggiungi-dispensa">
                    <Plus className="h-4 w-4 mr-2" />Aggiungi Dispensa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {showAddDispensa && (
                  <form onSubmit={handleAddDispensa} className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200" data-testid="form-nuova-dispensa">
                    <h3 className="font-semibold text-gray-900 mb-4">Nuova Dispensa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Titolo" value={newDispensa.titolo} onChange={(e) => setNewDispensa({...newDispensa, titolo: e.target.value})} required data-testid="input-dispensa-titolo" />
                      <select className="border-2 border-gray-200 rounded-md px-3 py-2" value={newDispensa.materia} onChange={(e) => setNewDispensa({...newDispensa, materia: e.target.value})} data-testid="select-dispensa-materia">
                        <option>Biologia</option><option>Chimica</option><option>Fisica</option><option>Generale</option>
                      </select>
                      <Textarea placeholder="Descrizione" value={newDispensa.descrizione} onChange={(e) => setNewDispensa({...newDispensa, descrizione: e.target.value})} required className="md:col-span-2" data-testid="input-dispensa-descrizione" />
                      <Textarea placeholder="A chi serve" value={newDispensa.aChiServe} onChange={(e) => setNewDispensa({...newDispensa, aChiServe: e.target.value})} required className="md:col-span-2" data-testid="input-dispensa-achiServe" />
                      <Input type="number" placeholder="Numero pagine" value={newDispensa.pagine} onChange={(e) => setNewDispensa({...newDispensa, pagine: e.target.value})} required data-testid="input-dispensa-pagine" />
                      <Input placeholder="Tag (separati da virgola)" value={newDispensa.tag} onChange={(e) => setNewDispensa({...newDispensa, tag: e.target.value})} data-testid="input-dispensa-tag" />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">File PDF associato (opzionale)</label>
                        <select className="w-full border-2 border-gray-200 rounded-md px-3 py-2" value={newDispensa.filename} onChange={(e) => setNewDispensa({...newDispensa, filename: e.target.value})} data-testid="select-dispensa-file">
                          <option value="">Nessun file</option>
                          {files.filter(f => f.file_type === 'pdf').map(f => (
                            <option key={f.filename} value={f.filename}>{f.filename}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" data-testid="btn-salva-dispensa"><Save className="h-4 w-4 mr-2" />Salva</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddDispensa(false)}><X className="h-4 w-4 mr-2" />Annulla</Button>
                    </div>
                  </form>
                )}

                {loadingDispense ? (
                  <p className="text-center text-gray-500 py-8">Caricamento...</p>
                ) : dispense.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nessuna dispensa presente. Aggiungi la prima!</p>
                ) : (
                  <div className="space-y-3">
                    {dispense.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors" data-testid={`dispensa-item-${d.id}`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1 flex-wrap gap-2">
                            <h4 className="font-semibold text-gray-900">{d.titolo}</h4>
                            <Badge className={d.pubblicata ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {d.pubblicata ? 'Pubblicata' : 'Bozza'}
                            </Badge>
                            <Badge variant="outline">{d.materia}</Badge>
                            {d.filename && <Badge className="bg-blue-100 text-blue-800">PDF allegato</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{d.descrizione}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleToggleDispensa(d.id)} data-testid={`btn-toggle-dispensa-${d.id}`}>
                            {d.pubblicata ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteDispensa(d.id)} data-testid={`btn-delete-dispensa-${d.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== TAB SIMULAZIONI ========== */}
          <TabsContent value="simulazioni">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <CardTitle>Gestione Simulazioni ({simulazioni.length})</CardTitle>
                  <Button onClick={() => setShowAddSimulazione(!showAddSimulazione)} className="bg-green-600 hover:bg-green-700 text-white" data-testid="btn-aggiungi-simulazione">
                    <Plus className="h-4 w-4 mr-2" />Aggiungi Simulazione
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {showAddSimulazione && (
                  <form onSubmit={handleAddSimulazione} className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200" data-testid="form-nuova-simulazione">
                    <h3 className="font-semibold text-gray-900 mb-4">Nuova Simulazione</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Titolo simulazione" value={newSimulazione.titolo} onChange={(e) => setNewSimulazione({...newSimulazione, titolo: e.target.value})} required data-testid="input-simulazione-titolo" />
                      <select className="border-2 border-gray-200 rounded-md px-3 py-2" value={newSimulazione.materia} onChange={(e) => setNewSimulazione({...newSimulazione, materia: e.target.value})} data-testid="select-simulazione-materia">
                        <option>Biologia</option><option>Chimica</option><option>Fisica</option>
                      </select>
                      <select className="border-2 border-gray-200 rounded-md px-3 py-2" value={newSimulazione.tipo} onChange={(e) => setNewSimulazione({...newSimulazione, tipo: e.target.value})} data-testid="select-simulazione-tipo">
                        <option value="crocette">Crocette</option><option value="completamento">Completamento</option><option value="mix">Mix</option>
                      </select>
                      <Input type="number" placeholder="Numero domande" value={newSimulazione.domande} onChange={(e) => setNewSimulazione({...newSimulazione, domande: e.target.value})} required data-testid="input-simulazione-domande" />
                      <Input placeholder="Durata (es. 15 min)" value={newSimulazione.durata} onChange={(e) => setNewSimulazione({...newSimulazione, durata: e.target.value})} required data-testid="input-simulazione-durata" />
                      <Input placeholder="Livello (es. medio)" value={newSimulazione.livello} onChange={(e) => setNewSimulazione({...newSimulazione, livello: e.target.value})} required data-testid="input-simulazione-livello" />
                      <Textarea placeholder="Descrizione" value={newSimulazione.descrizione} onChange={(e) => setNewSimulazione({...newSimulazione, descrizione: e.target.value})} required className="md:col-span-2" data-testid="input-simulazione-descrizione" />
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" data-testid="btn-salva-simulazione"><Save className="h-4 w-4 mr-2" />Salva Simulazione</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddSimulazione(false)}><X className="h-4 w-4 mr-2" />Annulla</Button>
                    </div>
                  </form>
                )}

                {loadingSimulazioni ? (
                  <p className="text-center text-gray-500 py-8">Caricamento...</p>
                ) : simulazioni.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nessuna simulazione presente. Crea la prima!</p>
                ) : (
                  <div className="space-y-4">
                    {simulazioni.map((sim) => (
                      <div key={sim.id} className="bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors" data-testid={`simulazione-item-${sim.id}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex-1 cursor-pointer" onClick={() => toggleExpandSimulazione(sim.id)}>
                            <div className="flex items-center space-x-3 mb-1 flex-wrap gap-2">
                              <h4 className="font-semibold text-gray-900">{sim.titolo}</h4>
                              <Badge className={sim.attiva ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {sim.attiva ? 'Attiva' : 'Bozza'}
                              </Badge>
                              <Badge variant="outline">{sim.materia}</Badge>
                              <Badge variant="outline">{sim.tipo}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{sim.descrizione}</p>
                            <p className="text-xs text-gray-400 mt-1">{sim.domande} domande • {sim.durata} • {sim.livello}</p>
                          </div>
                          <div className="flex space-x-2 ml-4 items-center">
                            <Button size="sm" variant="ghost" onClick={() => toggleExpandSimulazione(sim.id)} data-testid={`btn-expand-${sim.id}`}>
                              {expandedSimulazione === sim.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleToggleSimulazione(sim.id)} data-testid={`btn-toggle-simulazione-${sim.id}`}>
                              {sim.attiva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteSimulazione(sim.id)} data-testid={`btn-delete-simulazione-${sim.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded: Domande */}
                        {expandedSimulazione === sim.id && (
                          <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-semibold text-gray-800">Domande ({domande[sim.id]?.length || 0})</h5>
                              <Button size="sm" onClick={() => setShowAddDomanda(showAddDomanda === sim.id ? null : sim.id)} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid={`btn-aggiungi-domanda-${sim.id}`}>
                                <Plus className="h-4 w-4 mr-1" />Aggiungi Domanda
                              </Button>
                            </div>

                            {/* Form nuova domanda */}
                            {showAddDomanda === sim.id && (
                              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200" data-testid={`form-nuova-domanda-${sim.id}`}>
                                <h6 className="font-semibold text-gray-800 mb-3">Nuova Domanda</h6>
                                <div className="space-y-3">
                                  <Textarea placeholder="Testo della domanda" value={newDomanda.testo} onChange={(e) => setNewDomanda({...newDomanda, testo: e.target.value})} required data-testid="input-domanda-testo" />
                                  <div className="grid grid-cols-2 gap-3">
                                    <select className="border-2 border-gray-200 rounded-md px-3 py-2" value={newDomanda.tipo} onChange={(e) => setNewDomanda({...newDomanda, tipo: e.target.value})} data-testid="select-domanda-tipo">
                                      <option value="crocetta">Crocetta</option>
                                      <option value="completamento">Completamento</option>
                                    </select>
                                    <select className="border-2 border-gray-200 rounded-md px-3 py-2" value={newDomanda.materia} onChange={(e) => setNewDomanda({...newDomanda, materia: e.target.value})} data-testid="select-domanda-materia">
                                      <option>Biologia</option><option>Chimica</option><option>Fisica</option>
                                    </select>
                                  </div>
                                  
                                  {newDomanda.tipo === 'crocetta' && (
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-600">Opzioni (min. 2):</p>
                                      {newDomanda.opzioni.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          <input type="radio" name="rispostaCorretta" checked={newDomanda.rispostaCorretta === String(idx)} onChange={() => setNewDomanda({...newDomanda, rispostaCorretta: String(idx)})} />
                                          <Input placeholder={`Opzione ${idx + 1}`} value={opt} onChange={(e) => {
                                            const newOpzioni = [...newDomanda.opzioni];
                                            newOpzioni[idx] = e.target.value;
                                            setNewDomanda({...newDomanda, opzioni: newOpzioni});
                                          }} data-testid={`input-opzione-${idx}`} />
                                        </div>
                                      ))}
                                      <p className="text-xs text-gray-500">Seleziona il radio button per indicare la risposta corretta</p>
                                    </div>
                                  )}
                                  
                                  {newDomanda.tipo === 'completamento' && (
                                    <Input placeholder="Risposta corretta" value={newDomanda.rispostaCorretta} onChange={(e) => setNewDomanda({...newDomanda, rispostaCorretta: e.target.value})} data-testid="input-risposta-corretta" />
                                  )}
                                  
                                  <Textarea placeholder="Spiegazione (mostrata dopo la risposta)" value={newDomanda.spiegazione} onChange={(e) => setNewDomanda({...newDomanda, spiegazione: e.target.value})} data-testid="input-domanda-spiegazione" />
                                  
                                  <div className="flex space-x-3">
                                    <Button type="button" onClick={() => handleAddDomanda(sim.id)} className="bg-green-600 hover:bg-green-700 text-white" data-testid="btn-salva-domanda"><Save className="h-4 w-4 mr-2" />Salva Domanda</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowAddDomanda(null)}><X className="h-4 w-4 mr-2" />Annulla</Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Lista domande */}
                            {!domande[sim.id] || domande[sim.id].length === 0 ? (
                              <p className="text-gray-500 text-center py-4">Nessuna domanda presente. Aggiungi la prima!</p>
                            ) : (
                              <div className="space-y-2">
                                {domande[sim.id].map((d, idx) => (
                                  <div key={d.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200" data-testid={`domanda-item-${d.id}`}>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        <span className="text-gray-400 mr-2">#{idx + 1}</span>
                                        {d.testo}
                                      </p>
                                      <div className="flex gap-2 mt-1 flex-wrap">
                                        <Badge variant="outline" className="text-xs">{d.tipo}</Badge>
                                        <Badge variant="outline" className="text-xs">{d.materia}</Badge>
                                        {d.tipo === 'crocetta' && d.opzioni && (
                                          <span className="text-xs text-green-600">Risposta: {d.opzioni[parseInt(d.rispostaCorretta)]}</span>
                                        )}
                                        {d.tipo === 'completamento' && (
                                          <span className="text-xs text-green-600">Risposta: {d.rispostaCorretta}</span>
                                        )}
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteDomanda(sim.id, d.id)} data-testid={`btn-delete-domanda-${d.id}`}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== TAB FILE ========== */}
          <TabsContent value="file">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-white">
                <CardTitle>Libreria File</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Carica PDF</h3>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf')} className="hidden" id="pdf-upload" disabled={uploadingFile} />
                    <label htmlFor="pdf-upload">
                      <span className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${uploadingFile ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`} data-testid="btn-upload-pdf">
                        {uploadingFile ? 'Caricamento...' : 'Scegli PDF'}
                      </span>
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Carica Immagine</h3>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" id="image-upload" disabled={uploadingFile} />
                    <label htmlFor="image-upload">
                      <span className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${uploadingFile ? 'bg-gray-300 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`} data-testid="btn-upload-image">
                        {uploadingFile ? 'Caricamento...' : 'Scegli Immagine'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">File caricati ({files.length})</h3>
                  {files.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nessun file caricato</p>
                  ) : (
                    files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg" data-testid={`file-item-${file.filename}`}>
                        <div>
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-sm text-gray-500">Tipo: {file.file_type} • Dimensione: {(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <div className="flex space-x-2">
                          <a href={`${BACKEND_URL}/uploads/${file.file_type === 'pdf' ? 'pdf' : 'images'}/${file.filename}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" data-testid={`btn-view-file-${file.filename}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFile(file.filename, file.file_type)} data-testid={`btn-delete-file-${file.filename}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
