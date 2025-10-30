'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Webcam, Users } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function FootfallPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [footfallCount, setFootfallCount] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: Stop the camera stream when the component unmounts
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleAnalyze = async () => {
    if (!videoRef.current || !mediaStreamRef.current) {
      toast({
        title: 'Camera not ready',
        description: 'Please wait for the camera to initialize.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setFootfallCount(0);

    // Simulate capturing a short clip or a snapshot for analysis
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/jpeg');

        // Placeholder for AI analysis call
        // In a real scenario, you would send `imageDataUri` to your AI flow.
        try {
            // This is where you would call your `analyze-video-for-footfall` flow
            // const result = await handleAnalyzeFootfall({ videoDataUri: ... });
            // For now, we simulate a result.
            await new Promise(resolve => setTimeout(resolve, 2000));
            const simulatedFootfall = Math.floor(Math.random() * 5); // Simulate 0 to 4 people
            setFootfallCount(simulatedFootfall);
            toast({
                title: 'Analysis Complete',
                description: `Detected ${simulatedFootfall} person(s) in the frame.`,
            });
        } catch (error) {
            toast({
                title: 'Analysis Failed',
                description: 'Could not analyze the video feed.',
                variant: 'destructive',
            });
        }

    } else {
         toast({
            title: 'Capture Failed',
            description: 'Could not capture a frame from the video feed.',
            variant: 'destructive',
        });
    }


    setIsLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">AI Footfall Tracker</CardTitle>
          <CardDescription>
            Simulate a live CCTV feed using your webcam to track store activity and count footfalls in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-md overflow-hidden border bg-muted">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Alert variant="destructive" className="w-auto">
                            <Webcam className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                     </div>
                 )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button onClick={handleAnalyze} disabled={isLoading || !hasCameraPermission} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Webcam className="mr-2 h-4 w-4" />}
                    Analyze Current View
                </Button>
                
                <Card className="p-4 w-full sm:w-auto flex items-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Detected Footfall</p>
                        <p className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : footfallCount}</p>
                    </div>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
