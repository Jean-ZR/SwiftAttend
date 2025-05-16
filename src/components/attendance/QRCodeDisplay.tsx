
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import qrcode.react if you want to render actual QR codes
// import QRCode from 'qrcode.react'; 

interface QRCodeDisplayProps {
  value: string; // This will be the full URL or the session ID to display
  sessionId: string; // The actual session ID for display and copying
  onRefresh?: () => void;
  isActive?: boolean;
}

export function QRCodeDisplay({ value, sessionId, onRefresh, isActive }: QRCodeDisplayProps) {
  const { toast } = useToast();

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId)
      .then(() => {
        toast({ title: "Copied!", description: "Session ID copied to clipboard." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy Session ID.", variant: "destructive" });
        console.error('Failed to copy Session ID: ', err);
      });
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        toast({ title: "Copied!", description: "Attendance URL copied to clipboard." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy URL.", variant: "destructive" });
        console.error('Failed to copy URL: ', err);
      });
  };


  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{isActive ? "Active Session" : "New Session"} QR Code</CardTitle>
        <CardDescription>
            {isActive 
            ? "Students can scan this code or use the ID to mark attendance." 
            : "Once started, students can use this to mark attendance."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div 
          data-ai-hint="QR code" // For AI image generation hint
          className="w-60 h-60 bg-muted flex items-center justify-center rounded-lg border border-dashed border-primary p-2"
          aria-label={`QR Code for attendance. Value: ${value}`}
        >
          {/* Replace this with <QRCode value={value} size={224} level="H" /> if using qrcode.react */}
          <p className="text-center text-muted-foreground text-xs">
            (QR Code for: <br/> <strong className="text-foreground break-all">{value}</strong>)
            <br /> A library like 'qrcode.react' would render the actual QR image here.
          </p>
        </div>
        
        <div className="w-full space-y-1">
          <Label htmlFor="sessionUrl">Attendance URL (for QR)</Label>
          <div className="flex items-center space-x-2">
            <Input id="sessionUrl" type="text" value={value} readOnly className="text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopyUrl} aria-label="Copy attendance URL">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-full space-y-1">
          <Label htmlFor="sessionIdDisplay">Session ID (for manual entry)</Label>
          <div className="flex items-center space-x-2">
            <Input id="sessionIdDisplay" type="text" value={sessionId} readOnly className="text-center font-mono tracking-wider" />
            <Button variant="outline" size="icon" onClick={handleCopySessionId} aria-label="Copy session ID">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {onRefresh && !isActive && ( // Only allow refresh if session is not active
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code & QR
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

