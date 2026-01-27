import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Shield, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = login(formData.username, formData.password);
    
    setTimeout(() => {
      if (result.success) {
        toast({
          title: "Login effettuato!",
          description: "Benvenuto nell'Area Admin.",
        });
        navigate('/admin');
      } else {
        toast({
          title: "Errore di login",
          description: result.error || "Credenziali non valide.",
          variant: "destructive"
        });
      }
      setLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-lime-50 flex items-center justify-center py-12 px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <Card className="relative w-full max-w-md border-2 border-gray-200 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8" />
            <CardTitle className="text-2xl">Area Admin</CardTitle>
          </div>
          <p className="text-center text-blue-100 text-sm mt-2">Accesso riservato agli amministratori</p>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="admin"
                className="w-full border-2 border-gray-200 focus:border-blue-500"
                data-testid="login-input-username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-blue-600" />
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 focus:border-blue-500"
                data-testid="login-input-password"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              data-testid="login-submit-button"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 text-center">
              <strong>Demo credentials:</strong><br />
              Username: <code className="bg-white px-2 py-1 rounded">admin</code><br />
              Password: <code className="bg-white px-2 py-1 rounded">DinoMed2025!</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
