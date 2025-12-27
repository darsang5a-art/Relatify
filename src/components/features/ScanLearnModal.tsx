import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Camera, Upload, X, Loader2, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ScanLearnModalProps {
  onExtractComplete: (text: string) => void;
  onClose: () => void;
}

export function ScanLearnModal({ onExtractComplete, onClose }: ScanLearnModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);

    try {
      // In V1.0, we'll use a mock OCR since real OCR requires additional APIs
      // Simulating extraction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockText = `Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells and involves the absorption of carbon dioxide and water, which are transformed into glucose and oxygen using sunlight as an energy source.`;
      
      setExtractedText(mockText);
      
      toast({
        title: 'Text Extracted',
        description: 'Review and edit the text, then click "Explain This" to continue.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (extractedText.trim()) {
      onExtractComplete(extractedText.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">Scan & Learn</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!preview ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Upload or take a photo of your textbook, notes, or any learning material.</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-32 flex flex-col gap-2 border-2 border-dashed hover:border-primary"
              >
                <Upload className="w-8 h-8" />
                <span>Upload Image</span>
              </Button>

              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e: any) => handleFileSelect(e);
                  input.click();
                }}
                variant="outline"
                className="h-32 flex flex-col gap-2 border-2 border-dashed hover:border-primary"
              >
                <Camera className="w-8 h-8" />
                <span>Take Photo</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-purple-100">
              <img src={preview} alt="Scanned" className="w-full h-auto" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImage(null);
                  setPreview('');
                  setExtractedText('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!extractedText ? (
              <Button onClick={handleExtract} disabled={loading} className="w-full gradient-primary gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Text...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Extract Text
                  </>
                )}
              </Button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Extracted Text (you can edit)</label>
                  <Textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setExtractedText('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Re-extract
                  </Button>
                  <Button onClick={handleComplete} className="flex-1 gradient-primary gap-2">
                    <Check className="w-4 h-4" />
                    Explain This
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
