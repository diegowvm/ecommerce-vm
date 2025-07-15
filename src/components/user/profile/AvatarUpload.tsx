import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, userInitials, onAvatarUpdate }: AvatarUploadProps) {
  const { uploadImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file).then((url) => {
      if (url) {
        onAvatarUpdate(url);
        setPreviewUrl(null);
      }
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage 
            src={displayUrl || undefined} 
            alt="Avatar do usuário" 
            className="object-cover"
          />
          <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-md group-hover:scale-110 transition-transform"
          onClick={triggerFileSelect}
          disabled={uploading}
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileSelect}
        disabled={uploading}
        className="flex items-center space-x-2"
      >
        <Upload className="h-4 w-4" />
        <span>
          {uploading ? 'Enviando...' : 'Alterar Foto'}
        </span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <p className="text-sm text-muted-foreground">
          Fazendo upload da imagem...
        </p>
      )}
    </div>
  );
}