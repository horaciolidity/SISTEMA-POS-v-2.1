import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  BarChart3,
  Package,
  DollarSign,
  AlertTriangle,
  Trash2,
  TrendingUp,
  RefreshCw,
  BarChart4,
  UserPlus,
  Edit3,
  Save,
} from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";

const AdminView = () => {
  const { toast } = useToast();
  const { getVisibleUsers, upsertUser, deleteUser } = useAuth();

  const [activeTab, setActiveTab] = useState("summary");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [cashMovs, setCashMovs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    email: "",
    display_name: "",
    password: "",
    role: "cashier",
  });
  const [editing, setEditing] = useState(false);

  /* === Cargar datos desde localStorage === */
  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("pos_products") || "[]"));
    setCustomers(JSON.parse(localStorage.getItem("pos_customers") || "[]"));
    setSales(JSON.parse(localStorage.getItem("pos_sales") || "[]"));
    setCashMovs(JSON.parse(localStorage.getItem("pos_cash_movements") || "[]"));
    refreshEmployees();
  }, []);

  const refreshEmployees = () => {
    const users = getVisibleUsers();
    setEmployees(users);
  };

  /* === Cálculos principales === */
  const totals = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock <= (p.min_stock || 5));

    const totalIncome = cashMovs
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + m.amount, 0);
    const totalExpense = cashMovs
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + m.amount, 0);

    const netCash = totalIncome - totalExpense;
    const today = dayjs().format("YYYY-MM-DD");
    const todaySales = sales.filter((s) => dayjs(s.closed_at).isSame(today, "day"));
    const dailyTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

    return {
      totalSales,
      totalCustomers,
      totalProducts,
      lowStock,
      totalIncome,
      totalExpense,
      netCash,
      dailyTotal,
    };
  }, [products, customers, sales, cashMovs]);

  /* === Limpiar datos === */
  const clearData = () => {
    if (!confirm("¿Seguro que deseas borrar todos los datos del sistema?")) return;
    ["pos_products", "pos_sales", "pos_customers", "pos_cash_movements"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setCashMovs([]);
    toast({
      title: "🧹 Datos eliminados",
      description: "Se limpiaron los registros del sistema",
      variant: "destructive",
    });
  };

  /* === Guardar o editar empleado === */
  const handleSaveEmployee = () => {
    if (!form.email || !form.password || !form.display_name) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos del formulario",
        variant: "destructive",
      });
      return;
    }

    const result = upsertUser(form.email, form.display_name, form.password, form.role);
    if (result.success) {
      toast({
        title: editing ? "Empleado actualizado" : "Empleado agregado",
        description: editing
          ? "Los datos del empleado fueron modificados"
          : "Nuevo empleado agregado correctamente",
      });
      setForm({ email: "", display_name: "", password: "", role: "cashier" });
      setEditing(false);
      refreshEmployees();
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo guardar el empleado",
        variant: "destructive",
      });
    }
  };

  /* === Editar empleado === */
  const handleEdit = (emp) => {
    setForm(emp);
    setEditing(true);
  };

  /* === Eliminar empleado === */
  const handleDelete = (email) => {
    if (!confirm("¿Seguro que deseas eliminar este empleado?")) return;
    const result = deleteUser(email);
    if (result.success) {
      toast({
        title: "Empleado eliminado",
        description: `El usuario ${email} fue eliminado`,
      });
      refreshEmployees();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  /* === Tabs === */
  const TabButton = ({ id, label, icon: Icon }) => (
    <Button
      variant={activeTab === id ? "default" : "outline"}
      className="flex items-center gap-2"
      onClick={() => setActiveTab(id)}
    >
      <Icon className="h-4 w-4" /> {label}
    </Button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* === Encabezado === */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Panel de Administración
        </h2>
        <div className="flex gap-2">
          <TabButton id="summary" label="Resumen" icon={BarChart3} />
          <TabButton id="analytics" label="Estadísticas" icon={BarChart4} />
          <TabButton id="employees" label="Empleados" icon={Users} />
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
        </div>
      </div>

      {/* === TAB: Resumen === */}
      {activeTab === "summary" && (
        <>
          {/* Métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <DollarSign className="text-green-500" />
                <CardTitle>Ventas Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totals.totalSales.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <Users className="text-blue-500" />
                <CardTitle>Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totals.totalCustomers}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <Package className="text-yellow-500" />
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {totals.totalProducts}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <BarChart3 className="text-purple-500" />
                <CardTitle>Ventas de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${totals.dailyTotal.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de stock bajo */}
          <Card className="dark:bg-gray-800/70">
            <CardHeader className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" />
              <CardTitle>Alertas de Stock Bajo ({totals.lowStock.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {totals.lowStock.length === 0 ? (
                <p className="text-gray-500">No hay productos con stock bajo.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                        <th>Producto</th>
                        <th>Stock</th>
                        <th>Mínimo</th>
                        <th>Categoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.lowStock.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                        >
                          <td>{p.name}</td>
                          <td className="text-red-600 font-medium">{p.stock}</td>
                          <td>{p.min_stock}</td>
                          <td>{p.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flujo de caja */}
          <Card className="dark:bg-gray-800/70">
            <CardHeader className="flex items-center gap-2">
              <TrendingUp className="text-indigo-500" />
              <CardTitle>Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Ingresos</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${totals.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Egresos</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${totals.totalExpense.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/60 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Efectivo Neto</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    ${totals.netCash.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones administrativas */}
          <Card className="border border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/30">
            <CardHeader className="flex items-center gap-2">
              <Trash2 className="text-red-600" />
              <CardTitle>Acciones Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Elimina todos los datos del sistema (productos, ventas, clientes y caja).
              </p>
              <Button variant="destructive" onClick={clearData} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Borrar Todo
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* === TAB: Estadísticas === */}
      {activeTab === "analytics" && <AdminDashboard />}

      {/* === TAB: Empleados === */}
      {activeTab === "employees" && (
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Users className="text-blue-500" />
            <CardTitle>Gestión de Empleados ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@empresa.com"
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Nueva contraseña"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2"
                >
                  <option value="cashier">Cajero</option>
                  <option value="manager">Gerente</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {editing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm({ email: "", display_name: "", password: "", role: "cashier" });
                    setEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button onClick={handleSaveEmployee} className="flex items-center gap-2">
                {editing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{" "}
                {editing ? "Guardar Cambios" : "Agregar Empleado"}
              </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-auto">
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-3 text-gray-500">
                        No hay empleados registrados.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr
                        key={emp.email}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      >
                        <td>{emp.display_name}</td>
                        <td>{emp.email}</td>
                        <td className="capitalize">{emp.role}</td>
                        <td className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => handleEdit(emp)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(emp.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminView;
