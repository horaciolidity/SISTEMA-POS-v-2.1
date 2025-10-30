import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ========================================================
     ⚙️ Cargar sesión actual y asegurar admin base
  ======================================================== */
  useEffect(() => {
    // Recuperar sesión guardada
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Asegurar existencia del admin base
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const hasAdmin = users.some((u) => u.role === 'admin' && u.email === 'admin@pos.com');

    if (!hasAdmin) {
      const baseAdmin = {
        id: crypto.randomUUID(),
        email: 'admin@pos.com',
        password: 'Mn232323Mn',
        role: 'admin',
        display_name: 'Administrador',
      };
      const updatedUsers = [...users, baseAdmin];
      localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
      console.log('✅ Usuario administrador base creado (admin@pos.com / Mn232323Mn)');
    }

    setLoading(false);
  }, []);

  /* ========================================================
     🔐 Login
  ======================================================== */
  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');

    const found = users.find(
      (u) =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!found) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    const { password: _, ...userWithoutPassword } = found;
    localStorage.setItem('pos_user', JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    return { success: true, user: userWithoutPassword };
  };

  /* ========================================================
     🚪 Logout
  ======================================================== */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  /* ========================================================
     🔎 Verificar roles
  ======================================================== */
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (Array.isArray(requiredRole)) return requiredRole.includes(user.role);
    return user.role === requiredRole;
  };

  /* ========================================================
     🧩 Crear o actualizar usuario (solo admin)
     - No permite sobreescribir al admin base
  ======================================================== */
  const upsertUser = (email, display_name, password, role) => {
    if (email === 'admin@pos.com') {
      return { success: false, error: 'No puedes modificar el usuario administrador base' };
    }

    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const existing = users.find((u) => u.email === email);

    const updatedUser = {
      id: existing?.id || crypto.randomUUID(),
      email,
      password,
      display_name,
      role,
    };

    let newList;
    if (existing) {
      newList = users.map((u) => (u.email === email ? updatedUser : u));
    } else {
      newList = [...users, updatedUser];
    }

    localStorage.setItem('pos_users', JSON.stringify(newList));
    return { success: true };
  };

  /* ========================================================
     🧹 Eliminar usuario (solo admin)
     - El admin base no se puede eliminar
  ======================================================== */
  const deleteUser = (email) => {
    if (email === 'admin@pos.com') {
      return { success: false, error: 'No puedes eliminar el usuario administrador base' };
    }

    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const updated = users.filter((u) => u.email !== email);
    localStorage.setItem('pos_users', JSON.stringify(updated));
    return { success: true };
  };

  /* ========================================================
     📋 Obtener lista visible de usuarios (oculta admin base)
  ======================================================== */
  const getVisibleUsers = () => {
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    return users.filter((u) => u.email !== 'admin@pos.com');
  };

  /* ========================================================
     📦 Context value
  ======================================================== */
  const value = {
    user,
    login,
    logout,
    hasRole,
    upsertUser,
    deleteUser,
    getVisibleUsers,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
