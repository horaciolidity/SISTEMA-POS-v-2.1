
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/pos" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "¡Bienvenido!",
          description: "Inicio de sesión exitoso",
          duration: 3000
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: result.error || "Credenciales inválidas",
          variant: "destructive",
          duration: 4000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@pos.com', password: 'admin123', role: 'Administrador' },
    { email: 'manager@pos.com', password: 'manager123', role: 'Gerente' },
    { email: 'cashier@pos.com', password: 'cashier123', role: 'Cajero' }
  ];

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Sistema POS</title>
        <meta name="description" content="Accede al sistema de punto de venta moderno" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
              >
                <ShoppingCart className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">Sistema POS</CardTitle>
              <CardDescription className="text-white/80">
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-white/80 text-center mb-3">Cuentas de demostración:</p>
                <div className="space-y-2">
                  {demoAccounts.map((account, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                      className="w-full text-left p-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
                    >
                      <div className="font-medium">{account.role}</div>
                      <div className="text-white/70">{account.email}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
