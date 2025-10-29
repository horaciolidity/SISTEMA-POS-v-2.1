
import React from 'react';
import { Settings, Users, Tag, Percent, Printer, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AdminView = () => {
    const { toast } = useToast();

    const adminOptions = [
        { title: "Usuarios y Roles", icon: Users },
        { title: "Categorías", icon: Tag },
        { title: "Tasas de IVA", icon: Percent },
        { title: "Impresoras", icon: Printer },
        { title: "Permisos y Seguridad", icon: Shield },
        { title: "Plantillas de Ticket", icon: Settings }
    ];

    const handleClick = (title) => {
        toast({
            title: `🚧 ${title}`,
            description: "Esta sección de administración no está implementada aún. ¡Puedes solicitarla en tu próximo prompt! 🚀",
        });
    };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-gray-600">Configuración general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminOptions.map((option, index) => {
            const Icon = option.icon;
            return (
                 <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                            <Icon className="h-6 w-6 text-purple-600" />
                            <span>{option.title}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">Gestiona {option.title.toLowerCase()} del sistema.</p>
                        <Button variant="outline" onClick={() => handleClick(option.title)}>
                            Gestionar
                        </Button>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
};

export default AdminView;
