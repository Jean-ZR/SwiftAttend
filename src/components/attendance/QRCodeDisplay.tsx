
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

// import QRCode from 'qrcode.react'; // Uncomment if/when qrcode.react is installed

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
            ? "Scan this code or use the ID/URL to mark attendance." 
            : "Once started, this QR can be used for attendance."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div 
          data-ai-hint="QR code" 
          className="w-60 h-60 bg-muted flex flex-col items-center justify-center rounded-lg border border-dashed border-primary p-2 text-center"
          aria-label={`QR Code placeholder for attendance. Value: ${value}`}
        >
          {/* Placeholder for QR Code. Replace with actual QR component when ready. */}
          {/* Example with qrcode.react (uncomment when installed and imported): */}
          {/* value ? <QRCode value={value} size={224} level="H" /> : <p>Generating QR...</p> */}
          
          <p className="text-xs text-muted-foreground mb-2">
            (This is a placeholder for the QR Code image)
          </p>
          <p className="text-sm font-semibold text-foreground break-all">
            QR Value (URL): <br /> {value || "Generating URL..."}
          </p>
           <p className="text-xs text-muted-foreground mt-2">
            A library like 'qrcode.react' would render the actual QR image here.
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

        {onRefresh && !isActive && ( 
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code & QR
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

    