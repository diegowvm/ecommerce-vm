import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MercadoLivreConfigProps {
  onConfigurationChange: () => void;
  currentStatus: string;
}

export function MercadoLivreConfig({ onConfigurationChange, currentStatus }: MercadoLivreConfigProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { clientId, clientSecret, redirectUri } = formData;
    
    if (!clientId || !clientSecret || !redirectUri) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos devem ser preenchidos",
        variant: "destructive"
      });
      return false;
    }

    // Validate Client ID format (should be numeric)
    if (!/^\d+$/.test(clientId)) {
      toast({
        title: "Client ID inválido",
        description: "O Client ID do MercadoLivre deve conter apenas números",
        variant: "destructive"
      });
      return false;
    }

    // Validate redirect URI format
    if (!redirectUri.startsWith('http')) {
      toast({
        title: "Redirect URI inválido",
        description: "A URI de redirecionamento deve começar com http:// ou https://",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const testConnection = async () => {
    if (!validateForm()) return;

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-marketplace-api', {
        body: {
          marketplace: 'MercadoLivre',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Conexão testada com sucesso!",
          description: "As credenciais do MercadoLivre estão válidas",
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido no teste de conexão');
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast({
        title: "Erro no teste de conexão",
        description: error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Save to Supabase Secrets via Edge Function
      const { data, error } = await supabase.functions.invoke('save-marketplace-credentials', {
        body: {
          marketplace: 'MercadoLivre',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Configuração salva!",
          description: "As credenciais do MercadoLivre foram salvas com segurança",
        });
        
        // Clear form
        setFormData({
          clientId: '',
          clientSecret: '',
          redirectUri: ''
        });
        
        // Refresh parent component
        onConfigurationChange();
      } else {
        throw new Error(data.error || 'Erro ao salvar configuração');
      }
    } catch (error: any) {
      console.error('Save configuration error:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isConnected = currentStatus === 'connected';

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🛒 MercadoLivre API
                {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Configure suas credenciais do MercadoLivre para sincronização automática
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                {isConnected ? 'Conectado' : 'Não configurado'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciais da API</CardTitle>
          <CardDescription>
            Insira suas credenciais do MercadoLivre Developer Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="1234567890"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                ID numérico da sua aplicação
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="abcdef123456..."
                  value={formData.clientSecret}
                  onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Chave secreta da sua aplicação
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectUri">Redirect URI *</Label>
            <Input
              id="redirectUri"
              type="url"
              placeholder="https://seusite.com/callback"
              value={formData.redirectUri}
              onChange={(e) => handleInputChange('redirectUri', e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              URL de callback configurada na sua aplicação
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={testConnection}
              variant="outline"
              disabled={loading || testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
            
            <Button
              onClick={saveConfiguration}
              disabled={loading || testing}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Configuração'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Como obter essas credenciais?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>1. Acesse o <a href="https://developers.mercadolivre.com.br/devcenter" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Developer Console do MercadoLivre</a></p>
            <p>2. Crie uma nova aplicação ou selecione uma existente</p>
            <p>3. Na seção "Credenciais", copie o Client ID e Client Secret</p>
            <p>4. Configure uma URL de callback em "Redirect URIs"</p>
            <p>5. Certifique-se de que sua aplicação tem as permissões necessárias</p>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Permissões necessárias:</strong> read, write, offline_access
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}