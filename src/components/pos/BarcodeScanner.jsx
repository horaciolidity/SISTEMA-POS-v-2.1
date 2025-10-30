import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * Escáner de códigos de barras con cámara.
 * - Usa ZXing para detección en vivo.
 * - Compatible con cámara trasera (facingMode: 'environment').
 * - Si falla, permite ingresar el código manualmente.
 */
const BarcodeScanner = ({ onBarcodeDetected, onClose }) => {
  const videoRef = useRef(null);
  const [reader, setReader] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Inicializa cámara y lector
  useEffect(() => {
    const initScanner = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        setReader(codeReader);
        setIsScanning(true);

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (devices.length === 0) throw new Error('No se encontró cámara');

        const selectedDeviceId = devices[0].deviceId;

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scanned = result.getText();
              if (scanned) {
                onBarcodeDetected(scanned);
                toast({
                  title: 'Código detectado',
                  description: scanned,
                  duration: 2500,
                });
                handleClose(); // cierra tras detección exitosa
              }
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.warn(err);
            }
          }
        );
      } catch (err) {
        console.error(err);
        setError('No se pudo acceder a la cámara.');
        toast({
          title: 'Error de cámara',
          description:
            'No se pudo iniciar el escáner. Verifica permisos o selecciona manualmente.',
          variant: 'destructive',
        });
      }
    };

    initScanner();

    return () => {
      handleClose();
    };
  }, []);

  // Detiene cámara y limpia
  const handleClose = () => {
    try {
      if (reader) reader.reset();
      setIsScanning(false);
    } catch (_) {}
    if (onClose) onClose();
  };

  // Ingreso manual alternativo
  const handleManualInput = () => {
    const barcode = prompt('Ingresa el código de barras manualmente:');
    if (barcode && barcode.trim()) {
      onBarcodeDetected(barcode.trim());
      toast({
        title: 'Código ingresado',
        description: barcode.trim(),
      });
      handleClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Escáner de Código de Barras</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={handleManualInput} className="w-full">
                Ingresar código manualmente
              </Button>
            </div>
          ) : (
            <>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay de escaneo */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">
                        Escanea el código aquí
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Apunta el código de barras dentro del marco
                </p>
                <Button
                  variant="outline"
                  onClick={handleManualInput}
                  className="w-full"
                >
                  Ingresar código manualmente
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarcodeScanner;
