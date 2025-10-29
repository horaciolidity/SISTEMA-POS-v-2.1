
import React from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const ReportsView = () => {
  const { toast } = useToast();

  const handleExport = (format) => {
    toast({
        title: "🚧 Exportar no implementado",
        description: `La exportación a ${format} estará disponible pronto.`
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-gray-600">Análisis de ventas y rendimiento</p>
        </div>
        <div className="flex space-x-2">
            <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> Rango de Fechas</Button>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filtros</Button>
        </div>
      </div>
      
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="cashiers">Cajeros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="pt-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Resumen de Ventas</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-16 w-16" />
                    <p className="ml-4">Gráfico de ventas aparecerá aquí.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="products" className="pt-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Reporte de Productos</CardTitle>
                     <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-16 w-16" />
                    <p className="ml-4">Reporte de productos más vendidos aparecerá aquí.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="customers" className="pt-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Reporte de Clientes</CardTitle>
                     <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-16 w-16" />
                    <p className="ml-4">Ranking de clientes aparecerá aquí.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="cashiers" className="pt-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Reporte por Cajero</CardTitle>
                     <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-16 w-16" />
                    <p className="ml-4">Reporte de ventas por cajero aparecerá aquí.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsView;
