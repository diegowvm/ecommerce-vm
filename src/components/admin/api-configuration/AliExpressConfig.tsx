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

interface AliExpressConfigProps {
  onConfigurationChange: () => void;
  currentStatus: string;
}

export function AliExpressConfig({ onConfigurationChange, currentStatus }: AliExpressConfigProps) {
  const [formData, setFormData] = useState({
    appKey: '',
    appSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { appKey, appSecret } = formData;
    
    if (!appKey || !appSecret) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos devem ser preenchidos",
        variant: "destructive"
      });
      return false;
    }

    // Validate App Key format (should be numeric)
    if (!/^\d+$/.test(appKey)) {
      toast({
        title: "App Key inválido",
        description: "O App Key do AliExpress deve conter apenas números",
        variant: "destructive"
      });
      return false;
    }

    // Validate App Secret format (should be alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(appSecret)) {
      toast({
        title: "App Secret inválido",
        description: "O App Secret deve conter apenas letras e números",
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
          marketplace: 'AliExpress',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Conexão testada com sucesso!",
          description: "As credenciais do AliExpress estão válidas",
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
      const { data, error } = await supabase.functions.invoke('save-marketplace-credentials', {
        body: {
          marketplace: 'AliExpress',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Configuração salva!",
          description: "As credenciais do AliExpress foram salvas com segurança",
        });
        
        setFormData({
          appKey: '',
          appSecret: ''
        });
        
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
                🏪 AliExpress API
                {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Configure suas credenciais do AliExpress Open Platform para sincronização automática
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
            Insira suas credenciais do AliExpress Open Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appKey">App Key *</Label>
              <Input
                id="appKey"
                type="text"
                placeholder="1234567890"
                value={formData.appKey}
                onChange={(e) => handleInputChange('appKey', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Chave da aplicação (apenas números)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSecret">App Secret *</Label>
              <div className="relative">
                <Input
                  id="appSecret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="abcdef123456"
                  value={formData.appSecret}
                  onChange={(e) => handleInputChange('appSecret', e.target.value)}
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
                Chave secreta da aplicação
              </p>
            </div>
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
            <p>1. Acesse o <a href="https://open.aliexpress.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AliExpress Open Platform</a></p>
            <p>2. Faça login com sua conta AliExpress</p>
            <p>3. Vá para "Console" → "Aplicações"</p>
            <p>4. Crie uma nova aplicação ou selecione uma existente</p>
            <p>5. Copie o App Key e App Secret da sua aplicação</p>
            <p>6. Certifique-se de que as APIs necessárias estão habilitadas</p>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>APIs necessárias:</strong> Product API, Order API, Logistics API
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}