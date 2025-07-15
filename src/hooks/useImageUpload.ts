import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, folder: string = 'avatars'): Promise<string | null> => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo selecionado.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(folder)
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}