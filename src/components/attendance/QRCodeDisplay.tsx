
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import QRCode from 'qrcode.react'; // Import the QR Code component

interface QRCodeDisplayProps {
  value: string; 
  sessionId: string; 
  onRefresh?: () => void;
  isActive?: boolean;
}

export function QRCodeDisplay({ value, sessionId, onRefresh, isActive }: QRCodeDisplayProps) {
  const { toast } = useToast();

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId)
      .then(() => {
        toast({ title: "Copiado!", description: "ID de sesión copiado al portapapeles." });
      })
      .catch(err => {
        toast({ title: "Copia Fallida", description: "No se pudo copiar el ID de sesión.", variant: "destructive" });
        console.error('Failed to copy Session ID: ', err);
      });
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        toast({ title: "Copiado!", description: "URL de asistencia copiada al portapapeles." });
      })
      .catch(err => {
        toast({ title: "Copia Fallida", description: "No se pudo copiar la URL.", variant: "destructive" });
        console.error('Failed to copy URL: ', err);
      });
  };


  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{isActive ? "Sesión Activa" : "Nueva Sesión"} Código QR</CardTitle>
        <CardDescription>
            {isActive 
            ? "Escanea este código o usa el ID/URL para marcar asistencia." 
            : "Una vez iniciada, este QR puede usarse para la asistencia."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div 
          className="w-60 h-60 bg-white flex flex-col items-center justify-center rounded-lg border border-dashed border-primary p-4" // Changed background to white
          aria-label={`QR Code for attendance. Value: ${value}`}
        >
          {value ? (
            <QRCode 
              value={value} 
              size={208} // Size of the QR code image
              level="H" // Error correction level
              bgColor="#FFFFFF" // Background color: white
              fgColor="#000000" // Foreground color: black
            />
          ) : (
            <p className="text-muted-foreground">Generando QR...</p>
          )}
        </div>
        
        <div className="w-full space-y-1">
          <Label htmlFor="sessionUrl">URL de Asistencia (para QR)</Label>
          <div className="flex items-center space-x-2">
            <Input id="sessionUrl" type="text" value={value} readOnly className="text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopyUrl} aria-label="Copiar URL de asistencia">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-full space-y-1">
          <Label htmlFor="sessionIdDisplay">ID de Sesión (para entrada manual)</Label>
          <div className="flex items-center space-x-2">
            <Input id="sessionIdDisplay" type="text" value={sessionId} readOnly className="text-center font-mono tracking-wider" />
            <Button variant="outline" size="icon" onClick={handleCopySessionId} aria-label="Copiar ID de sesión">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {onRefresh && !isActive && ( 
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generar Nuevo Código & QR
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
