
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const BarcodeScanner = ({ onBarcodeDetected, onClose }) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara');
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
        duration: 4000
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const barcode = prompt('Ingresa el código de barras manualmente:');
    if (barcode && barcode.trim()) {
      onBarcodeDetected(barcode.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Escáner de Código de Barras</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={handleManualInput} className="w-full">
                Ingresar código manualmente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">
                      Enfoca el código de barras aquí
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Posiciona el código de barras dentro del marco
                </p>
                <Button
                  variant="outline"
                  onClick={handleManualInput}
                  className="w-full"
                >
                  Ingresar código manualmente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarcodeScanner;
