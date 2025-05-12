"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  value: string;
  onRefresh?: () => void;
}

export function QRCodeDisplay({ value, onRefresh }: QRCodeDisplayProps) {
  const [qrValue, setQrValue] = useState(value);
  const { toast } = useToast();

  useEffect(() => {
    setQrValue(value);
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue)
      .then(() => {
        toast({ title: "Copied!", description: "QR code value copied to clipboard." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Attendance QR Code</CardTitle>
        <CardDescription>Students can scan this code or use the value below to mark attendance.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div 
          data-ai-hint="QR code"
          className="w-64 h-64 bg-muted flex items-center justify-center rounded-lg border border-dashed border-primary"
          aria-label={`QR Code for attendance. Value: ${qrValue}`}
        >
          <p className="text-center text-muted-foreground p-4">
            (QR Code Area) <br/>
            A library like 'qrcode.react' would render the actual QR image here for value: <strong className="text-foreground">{qrValue}</strong>
          </p>
        </div>
        
        <div className="w-full space-y-2">
          <p className="text-sm text-muted-foreground text-center">Or use this session code:</p>
          <div className="flex items-center space-x-2">
            <Input type="text" value={qrValue} readOnly className="text-center font-mono tracking-wider" />
            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy session code">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
