import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Eye, EyeOff, Sun, Moon } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  /* ============================================
     ⚙️ Inicializar usuario admin base si no existe
  ============================================ */
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const hasAdmin = storedUsers.some((u) => u.role === 'admin');

    if (!hasAdmin) {
      const defaultAdmin = {
        email: 'admin@pos.com',
        password: 'Mn232323Mn', // Contraseña base
        display_name: 'Administrador',
        role: 'admin',
      };
      const updated = [...storedUsers, defaultAdmin];
      localStorage.setItem('pos_users', JSON.stringify(updated));
      console.log('✅ Usuario administrador base creado (admin@pos.com / Mn232323Mn)');
    }
  }, []);

  // 🔁 Si ya está logueado, redirige automáticamente
  if (user) return <Navigate to="/pos" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email.trim(), password.trim());

      if (result.success) {
        toast({
          title: 'Bienvenido 👋',
          description: `Inicio de sesión exitoso como ${result.user?.role}`,
          duration: 3000,
        });
      } else {
        toast({
          title: 'Error de autenticación',
          description: result.error || 'Credenciales inválidas',
          variant: 'destructive',
          duration: 4000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un problema al iniciar sesión.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Sistema POS</title>
        <meta name="description" content="Accede al sistema de punto de venta moderno" />
      </Helmet>

      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
          theme === 'dark'
            ? 'bg-gray-900 text-gray-100'
            : 'gradient-bg text-gray-900'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-white/20 dark:border-gray-700 dark:bg-gray-800/80">
            <CardHeader className="text-center relative">
              {/* Botón de cambio de tema */}
              <button
                onClick={toggleTheme}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Cambiar tema"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-white/20 dark:bg-purple-700/40 rounded-full flex items-center justify-center mb-4"
              >
                <ShoppingCart className="h-8 w-8 text-white" />
              </motion.div>

              <CardTitle className="text-2xl font-bold text-white dark:text-gray-100">
                Sistema POS
              </CardTitle>
              <CardDescription className="text-white/80 dark:text-gray-400">
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white dark:text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 dark:bg-gray-700 dark:placeholder:text-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white dark:text-gray-200">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10 dark:bg-gray-700 dark:placeholder:text-gray-300 dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold dark:bg-purple-600 dark:hover:bg-purple-700 dark:text-white"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Mensaje informativo */}
              <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700 text-center text-sm text-white/70 dark:text-gray-400">
                <p>
                  <strong>Administrador base:</strong> admin@pos.com / Mn232323Mn
                </p>
                <p>Podrás cambiar esta contraseña desde tu panel de administración.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
