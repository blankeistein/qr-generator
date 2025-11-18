"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import {
  Brush,
  Download,
  FileText,
  Files,
  Package,
  QrCode,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type QrConfig = {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: "L" | "M" | "Q" | "H";
  padding: number;
};

type Format = "png" | "jpeg" | "svg";

export default function QrGenerator() {
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [singleText, setSingleText] = useState("https://example.com");
  const [multiText, setMultiText] = useState(
    "https://google.com\nhttps://facebook.com\nhttps://twitter.com"
  );
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [format, setFormat] = useState<Format>("png");
  const [isDownloading, setIsDownloading] = useState(false);

  const [config, setConfig] = useState({
    size: 256,
    fgColor: "#000000",
    bgColor: "#ffffff",
    padding: 10,
  });
  
  const [inputValue, setInputValue] = useState(config.size.toString());


  const { toast } = useToast();
  const singleQrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = multiText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setQrCodes(lines);
  }, [multiText]);
  
  useEffect(() => {
    setInputValue(config.size.toString());
  }, [config.size]);

  const handleDownloadSingle = () => {
    if (!singleQrRef.current) return;

    // Create a temporary canvas for accurate rendering
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const qrCanvas = singleQrRef.current.querySelector("canvas");
    const qrSvg = singleQrRef.current.querySelector("svg");

    const sizeWithPadding = config.size + config.padding * 2;
    canvas.width = sizeWithPadding;
    canvas.height = sizeWithPadding;
    
    // Fill background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, sizeWithPadding, sizeWithPadding);
    
    if (format === 'svg' && qrSvg) {
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, config.padding, config.padding, config.size, config.size);
            const url = canvas.toDataURL(`image/png`); // Always download as png from canvas
            downloadUrl(url, `qrcode.png`);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } else if (qrCanvas) {
        ctx.drawImage(qrCanvas, config.padding, config.padding);
        const url = canvas.toDataURL(`image/${format === 'svg' ? 'png' : format}`);
        downloadUrl(url, `qrcode.${format === 'svg' ? 'png' : format}`);
    } else if (format !== 'svg') {
        // Fallback for when canvas isn't rendered yet (e.g. if single tab isn't active)
        const tempCanvas = document.createElement("canvas");
        new QRCodeCanvas({
            value: singleText,
            size: config.size,
            fgColor: config.fgColor,
            bgColor: "transparent",
            level: "Q",
        }, tempCanvas);
        
        ctx.drawImage(tempCanvas, config.padding, config.padding);

        const url = canvas.toDataURL(`image/${format === 'svg' ? 'png' : format}`);
        downloadUrl(url, `qrcode.${format === 'svg' ? 'png' : format}`);
    }
  };


  const downloadUrl = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadZip = useCallback(async () => {
    if (qrCodes.length === 0) {
      toast({
        title: "No QR Codes",
        description: "Please enter some data to generate QR codes.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Zipping it up!",
      description: `Preparing ${qrCodes.length} QR codes for download...`,
    });

    const zip = new JSZip();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        setIsDownloading(false);
        toast({ title: "Error", description: "Could not create canvas context.", variant: "destructive" });
        return;
    }

    for (let i = 0; i < qrCodes.length; i++) {
        const value = qrCodes[i];
        
        const sizeWithPadding = config.size + config.padding * 2;
        canvas.width = sizeWithPadding;
        canvas.height = sizeWithPadding;
        
        ctx.fillStyle = config.bgColor;
        ctx.fillRect(0, 0, sizeWithPadding, sizeWithPadding);
        
        // Use a temporary canvas to render each QR code
        const tempCanvas = document.createElement('canvas');
        new QRCodeCanvas({
            value: value,
            size: config.size,
            fgColor: config.fgColor,
            bgColor: "transparent",
            level: 'Q',
        }, tempCanvas);
        
        ctx.drawImage(tempCanvas, config.padding, config.padding);
        
        const dataUrl = canvas.toDataURL(`image/${format === 'svg' ? 'png' : format}`);
        const blob = await (await fetch(dataUrl)).blob();
        
        // Sanitize filename
        const safeFilename = value.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 20);
        zip.file(`qrcode_${i + 1}_${safeFilename}.${format === 'svg' ? 'png' : format}`, blob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      downloadUrl(url, "qrcodes.zip");
      setIsDownloading(false);
      toast({
        title: "Download complete!",
        description: "Your ZIP file has been downloaded.",
      });
    }).catch(err => {
        setIsDownloading(false);
        toast({
            title: "Uh oh! Something went wrong.",
            description: "Could not generate ZIP file. Please try again.",
            variant: "destructive",
        });
        console.error(err);
    });
}, [qrCodes, config, format, toast]);


  const QrComponent = format === "svg" ? QRCodeSVG : QRCodeCanvas;
  const qrProps = {
    value: singleText,
    size: config.size,
    fgColor: config.fgColor,
    bgColor: "transparent",
    level: "Q" as "L" | "M" | "Q" | "H",
  };
  
  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSizeInputBlur = () => {
    let newSize = parseInt(inputValue, 10);
    if (!isNaN(newSize)) {
      newSize = Math.max(64, Math.min(1024, newSize));
      setConfig({ ...config, size: newSize });
    } else {
      // Reset to current config size if input is invalid
      setInputValue(config.size.toString());
    }
  };


  const handlePaddingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
        setConfig({ ...config, padding: 0 });
    } else {
        let newPadding = parseInt(value, 10);
        if (!isNaN(newPadding)) {
            newPadding = Math.max(0, Math.min(40, newPadding));
            setConfig({ ...config, padding: newPadding });
        }
    }
  };


  const CustomizeContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="size-input">Size</Label>
          <div className="flex items-center gap-2">
            <Input
              id="size-input"
              type="number"
              value={inputValue}
              onChange={handleSizeInputChange}
              onBlur={handleSizeInputBlur}
              className="w-20 text-center"
              min={64}
              max={1024}
            />
            <span>px</span>
          </div>
        </div>
        <Slider
          value={[config.size]}
          onValueChange={(v) => setConfig({ ...config, size: v[0] })}
          min={64}
          max={1024}
          step={8}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="padding-input">Padding</Label>
            <div className="flex items-center gap-2">
                <Input
                id="padding-input"
                type="number"
                value={config.padding}
                onChange={handlePaddingInputChange}
                className="w-20 text-center"
                min={0}
                max={40}
                />
                <span>px</span>
            </div>
        </div>
        <Slider
          value={[config.padding]}
          onValueChange={(v) =>
            setConfig({ ...config, padding: v[0] })
          }
          min={0}
          max={40}
          step={1}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Foreground</Label>
          <Input
            type="color"
            value={config.fgColor}
            onChange={(e) =>
              setConfig({ ...config, fgColor: e.target.value })
            }
            className="p-1"
          />
        </div>
        <div className="space-y-2">
          <Label>Background</Label>
          <Input
            type="color"
            value={config.bgColor}
            onChange={(e) =>
              setConfig({ ...config, bgColor: e.target.value })
            }
            className="p-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image Format</Label>
        <Select
          value={format}
          onValueChange={(v) => setFormat(v as Format)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <Sheet>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-headline">
                <div className="flex items-center gap-2">
                  <QrCode className="text-primary" />
                  Your Data
                </div>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </CardTitle>
              <CardDescription>
                Enter text for single or multiple QR codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as "single" | "multi")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">
                    <FileText className="mr-2 h-4 w-4" /> Single
                  </TabsTrigger>
                  <TabsTrigger value="multi">
                    <Files className="mr-2 h-4 w-4" /> Multiple
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="mt-4">
                  <Label htmlFor="single-text">URL or Text</Label>
                  <Input
                    id="single-text"
                    value={singleText}
                    onChange={(e) => setSingleText(e.target.value)}
                    placeholder="https://your-link.com"
                  />
                </TabsContent>
                <TabsContent value="multi" className="mt-4">
                  <Label htmlFor="multi-text">
                    URLs or Text (one per line)
                  </Label>
                  <Textarea
                    id="multi-text"
                    value={multiText}
                    onChange={(e) => setMultiText(e.target.value)}
                    placeholder="https://link1.com&#10;https://link2.com"
                    rows={5}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Brush className="text-primary" />
                  Customize
                </CardTitle>
                <CardDescription>
                  Style your QR code to match your brand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomizeContent />
              </CardContent>
            </Card>
          </div>

          <SheetContent side="left" className="lg:hidden">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-headline">
                <Brush className="text-primary" />
                Customize
              </SheetTitle>
              <SheetDescription>
                Style your QR code to match your brand.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <CustomizeContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-headline">
              <div className="flex items-center gap-2">
                <Package className="text-primary" />
                Preview & Download
              </div>
              {mode === "single" ? (
                <Button onClick={handleDownloadSingle}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              ) : (
                <Button onClick={handleDownloadZip} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" /> Download All (.zip)
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {mode === "single"
                ? "Your generated QR code. Click download to save it."
                : `Generated ${qrCodes.length} QR codes. Click download to get them all in a ZIP file.`}
            </CardDescription>
          </CardHeader>
          <CardContent
            className="flex items-center justify-center p-6 bg-muted/30 rounded-b-lg"
            style={{ minHeight: "400px" }}
          >
            {mode === "single" ? (
              <div
                ref={singleQrRef}
                className="bg-card rounded-lg shadow-md transition-all duration-300"
                style={{ backgroundColor: config.bgColor, padding: `${config.padding}px` }}
              >
                <QrComponent {...qrProps} />
              </div>
            ) : (
              <div className="w-full h-96 overflow-y-auto">
                {qrCodes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
                    {qrCodes.map((code, index) => (
                      <div
                        key={index}
                        className="p-2 bg-card rounded-lg shadow-sm flex flex-col items-center gap-2"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <QRCodeSVG
                          value={code}
                          size={128}
                          fgColor={config.fgColor}
                          bgColor={config.bgColor}
                          level="Q"
                        />
                         <span className="text-xs text-muted-foreground truncate w-full text-center px-1">
                          {code}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <QrCode className="w-16 h-16 mb-4" />
                    <p>Your QR codes will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
