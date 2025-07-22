
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="text-6xl font-bold text-muted-foreground mb-2">404</div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">
              Página no encontrada
            </h1>
            <p className="text-muted-foreground">
              La página que buscas no existe o ha sido movida.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver atrás
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
            
            <Button
              onClick={() => navigate('/talent/marketplace')}
              variant="secondary"
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Explorar oportunidades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
