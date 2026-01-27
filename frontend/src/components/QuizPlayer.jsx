import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Clock, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Award } from 'lucide-react';

export const QuizPlayer = ({ quiz, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);

  // Timer
  useEffect(() => {
    if (!isCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.domande_list.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate results
    let correct = 0;
    const details = quiz.domande_list.map((domanda, index) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;

      if (domanda.tipo === 'crocetta') {
        isCorrect = userAnswer === domanda.rispostaCorretta;
      } else {
        // completamento
        const normalized = userAnswer?.toString().toLowerCase().trim();
        isCorrect = domanda.risposteAccettate?.some(acc => 
          acc.toLowerCase() === normalized
        ) || normalized === domanda.rispostaCorretta.toLowerCase();
      }

      if (isCorrect) correct++;

      return {
        domanda,
        userAnswer,
        isCorrect,
        index
      };
    });

    setResults({
      correct,
      total: quiz.domande_list.length,
      percentage: Math.round((correct / quiz.domande_list.length) * 100),
      details,
      timeElapsed
    });
    setIsCompleted(true);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setIsCompleted(false);
    setResults(null);
  };

  if (isCompleted && results) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        {/* Results Summary */}
        <Card className="border-2 border-blue-200 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-lime-50">
            <div className="text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-bounce" />
              <CardTitle className="text-3xl mb-2">Quiz Completato!</CardTitle>
              <div className="flex justify-center items-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{results.correct}/{results.total}</div>
                  <div className="text-sm text-gray-600">Risposte corrette</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-lime-600">{results.percentage}%</div>
                  <div className="text-sm text-gray-600">Punteggio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">{formatTime(results.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo impiegato</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Correzione dettagliata</h2>
          {results.details.map((detail, idx) => (
            <Card key={idx} className={`border-2 ${detail.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} transition-all hover:shadow-lg`}>
              <CardHeader>
                <div className="flex items-start space-x-3">
                  {detail.isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{detail.domanda.materia}</Badge>
                      <Badge className={detail.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {detail.isCorrect ? 'Corretta' : 'Sbagliata'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-3">
                      Domanda {idx + 1}: {detail.domanda.testo}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {detail.domanda.tipo === 'crocetta' ? (
                  <div className="space-y-2 mb-4">
                    {detail.domanda.opzioni.map((opzione, optIdx) => {
                      const isUserChoice = detail.userAnswer === optIdx;
                      const isCorrectAnswer = detail.domanda.rispostaCorretta === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isUserChoice
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isUserChoice && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                            <span className="font-medium">{String.fromCharCode(65 + optIdx)})</span>
                            <span>{opzione}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 mb-2">
                      <span className="text-sm text-gray-600">La tua risposta: </span>
                      <span className={`font-medium ${detail.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {detail.userAnswer || '(vuota)'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border-2 border-green-500 bg-green-50">
                      <span className="text-sm text-gray-600">Risposta corretta: </span>
                      <span className="font-medium text-green-700">{detail.domanda.rispostaCorretta}</span>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-700">Spiegazione:</strong> {detail.domanda.spiegazione}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transform hover:scale-105 transition-all"
            size="lg"
          >
            Rifai la demo
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md transform hover:scale-105 transition-all"
            size="lg"
          >
            Torna alle simulazioni
          </Button>
        </div>
      </div>
    );
  }

  const question = quiz.domande_list[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.domande_list.length) * 100;

  // Safety check
  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Caricamento domanda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz.titolo}</h2>
            <p className="text-sm text-gray-600">Domanda {currentQuestion + 1} di {quiz.domande_list.length}</p>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-700">{formatTime(timeElapsed)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-3 bg-gray-200" />
      </div>

      {/* Question Card */}
      <Card className="border-2 border-blue-200 shadow-xl mb-6 animate-slideIn">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-lime-50">
          <div className="flex items-center space-x-2 mb-3">
            <Badge className="bg-blue-600 text-white">{question.materia}</Badge>
            <Badge variant="outline">
              {question.tipo === 'crocetta' ? 'Scelta multipla' : 'Completamento'}
            </Badge>
          </div>
          <CardTitle className="text-xl">{question.testo}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {question.tipo === 'crocetta' ? (
            <div className="space-y-3">
              {question.opzioni.map((opzione, index) => {
                const isSelected = userAnswers[currentQuestion] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all transform hover:scale-102 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)})</span>
                      <span className="text-gray-900">{opzione}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Inserisci la tua risposta..."
                value={userAnswers[currentQuestion] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-blue-500 text-lg p-4"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Scrivi la risposta completa come richiesto dalla domanda
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
          className="transform hover:scale-105 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        {currentQuestion === quiz.domande_list.length - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-700 hover:to-lime-600 text-white shadow-lg transform hover:scale-105 transition-all"
            size="lg"
          >
            Consegna Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md transform hover:scale-105 transition-all"
          >
            Avanti
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
