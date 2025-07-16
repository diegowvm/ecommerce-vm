import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AmazonConfigProps {
  onConfigurationChange: () => void;
  currentStatus: string;
}

export function AmazonConfig({ onConfigurationChange, currentStatus }: AmazonConfigProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    region: '',
    sellerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();

  const amazonRegions = [
    { value: 'us-east-1', label: 'Estados Unidos (Norte América)' },
    { value: 'eu-west-1', label: 'Europa' },
    { value: 'us-west-2', label: 'Extremo Oriente' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { clientId, clientSecret, refreshToken, region, sellerId } = formData;
    
    if (!clientId || !clientSecret || !refreshToken || !region || !sellerId) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos devem ser preenchidos",
        variant: "destructive"
      });
      return false;
    }

    // Validate Client ID format
    if (!clientId.startsWith('amzn1.application-oa2-client.')) {
      toast({
        title: "Client ID inválido",
        description: "O Client ID da Amazon deve começar com 'amzn1.application-oa2-client.'",
        variant: "destructive"
      });
      return false;
    }

    // Validate Refresh Token format
    if (!refreshToken.startsWith('Atzr|')) {
      toast({
        title: "Refresh Token inválido",
        description: "O Refresh Token da Amazon deve começar com 'Atzr|'",
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
          marketplace: 'Amazon',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Conexão testada com sucesso!",
          description: "As credenciais da Amazon estão válidas",
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
          marketplace: 'Amazon',
          credentials: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Configuração salva!",
          description: "As credenciais da Amazon foram salvas com segurança",
        });
        
        setFormData({
          clientId: '',
          clientSecret: '',
          refreshToken: '',
          region: '',
          sellerId: ''
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
                📦 Amazon SP-API
                {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Configure suas credenciais da Amazon SP-API para sincronização automática
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
          <CardTitle>Credenciais da SP-API</CardTitle>
          <CardDescription>
            Insira suas credenciais do Amazon Seller Central
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">LWA Client ID *</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="amzn1.application-oa2-client.xxx"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                ID do cliente LWA (Login with Amazon)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">LWA Client Secret *</Label>
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
                Chave secreta do cliente LWA
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refreshToken">Refresh Token *</Label>
            <div className="relative">
              <Input
                id="refreshToken"
                type={showSecrets ? "text" : "password"}
                placeholder="Atzr|IwEBIxxx..."
                value={formData.refreshToken}
                onChange={(e) => handleInputChange('refreshToken', e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Token de atualização obtido durante autorização
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Região *</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {amazonRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Região onde sua conta de vendedor está registrada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellerId">Seller ID *</Label>
              <Input
                id="sellerId"
                type="text"
                placeholder="A1234567890123"
                value={formData.sellerId}
                onChange={(e) => handleInputChange('sellerId', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                ID do vendedor Amazon
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
            <p>1. Acesse o <a href="https://sellercentral.amazon.com/apps/manage" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Seller Central</a></p>
            <p>2. Vá para "Apps e Serviços" → "Gerenciar Apps"</p>
            <p>3. Clique em "Autorizar aplicação" e registre uma nova aplicação SP-API</p>
            <p>4. Copie o LWA Client ID e Client Secret</p>
            <p>5. Complete o processo de autorização para obter o Refresh Token</p>
            <p>6. Encontre seu Seller ID em "Configurações" → "Informações da conta"</p>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Importante:</strong> Você precisa ter uma conta de vendedor profissional ativa na Amazon
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}