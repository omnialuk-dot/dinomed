import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Mail, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const DinoContatti = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    messaggio: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submit - in produzione invierebbe al backend
    toast({
      title: "Messaggio inviato!",
      description: "Ti risponderemo il prima possibile.",
    });
    setFormData({ nome: '', email: '', messaggio: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contatti
          </h1>
          <p className="text-xl text-gray-600">
            Segnalaci errori, suggerimenti o richieste di simulazioni
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info contatti */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 mb-3">
                  Per segnalazioni, domande o suggerimenti:
                </p>
                <a 
                  href="mailto:info@dinomed.it" 
                  className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors"
                >
                  info@dinomed.it
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 border-lime-100 hover:border-lime-300 hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-lime-50 to-white">
                <CardTitle className="flex items-center space-x-2 text-lime-700">
                  <MessageCircle className="h-5 w-5" />
                  <span>Community Telegram</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 mb-4">
                  Unisciti alla community di studenti che si preparano al semestre filtro:
                </p>
                <a 
                  href="https://t.me/dinomed_community" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-700 hover:to-lime-600 text-white shadow-md">
                    Unisciti su Telegram
                  </Button>
                </a>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-blue-50 to-lime-50 rounded-lg border-2 border-blue-200 p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                Cosa puoi segnalarci
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Errori nelle simulazioni o nelle dispense</li>
                <li>• Suggerimenti su nuovi materiali da creare</li>
                <li>• Feedback sull'utilità delle risorse</li>
                <li>• Domande sul formato dell'esame</li>
              </ul>
            </div>
          </div>

          {/* Form contatto */}
          <div>
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-lime-50">
                <CardTitle>Invia un messaggio</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      placeholder="Il tuo nome"
                      className="w-full border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tua@email.it"
                      className="w-full border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="messaggio" className="block text-sm font-medium text-gray-700 mb-1">
                      Messaggio
                    </label>
                    <Textarea
                      id="messaggio"
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleChange}
                      required
                      placeholder="Scrivi qui il tuo messaggio..."
                      rows={6}
                      className="w-full border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    <span>Invia messaggio</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nota finale */}
        <div className="mt-12 text-center text-gray-600 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p>
            Risponderemo il prima possibile. DinoMed è gestito da studenti, quindi i tempi di risposta 
            potrebbero variare durante i periodi di esami. Grazie per la pazienza!
          </p>
        </div>
      </div>
    </div>
  );
};
