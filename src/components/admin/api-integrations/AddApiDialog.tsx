import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiConnection {
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalProducts: number;
  successRate: number;
}

interface AddApiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (api: Omit<ApiConnection, 'id'>) => void;
}

interface Credentials {
  [key: string]: string;
}

export function AddApiDialog({ open, onOpenChange, onAdd }: AddApiDialogProps) {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState('');
  const [name, setName] = useState('');
  const [credentials, setCredentials] = useState<Credentials>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const platforms = [
    { value: 'MercadoLivre', label: 'MercadoLivre' },
    { value: 'Amazon', label: 'Amazon' },
    { value: 'AliExpress', label: 'AliExpress' }
  ];

  const getCredentialFields = (platform: string) => {
    switch (platform) {
      case 'MercadoLivre':
        return [
          { key: 'clientId', label: 'Client ID', type: 'password', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'redirectUri', label: 'Redirect URI', type: 'text', required: true }
        ];
      case 'Amazon':
        return [
          { key: 'clientId', label: 'LWA Client ID', type: 'password', required: true },
          { key: 'clientSecret', label: 'LWA Client Secret', type: 'password', required: true },
          { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
          { key: 'region', label: 'Região', type: 'text', required: true },
          { key: 'sellerId', label: 'Seller ID', type: 'text', required: true }
        ];
      case 'AliExpress':
        return [
          { key: 'appKey', label: 'App Key', type: 'password', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', required: true }
        ];
      default:
        return [];
    }
  };

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
    setCredentials({});
    setTestResult(null);
    
    // Auto-generate name
    const count = 1; // In real app, you'd count existing connections
    setName(`${value} ${count}`);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setTestResult({
          success: true,
          message: 'Conexão testada com sucesso!'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Falha na conexão. Verifique as credenciais.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && platform && name) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSave = () => {
    if (!testResult?.success) {
      toast({
        title: "Teste de Conexão Necessário",
        description: "Execute o teste de conexão antes de salvar",
        variant: "destructive",
      });
      return;
    }

    const newApi: Omit<ApiConnection, 'id'> = {
      name,
      platform,
      status: 'connected',
      lastSync: 'Nunca',
      totalProducts: 0,
      successRate: 0
    };

    onAdd(newApi);
    
    // Reset form
    setStep(1);
    setPlatform('');
    setName('');
    setCredentials({});
    setTestResult(null);
  };

  const credentialFields = getCredentialFields(platform);
  const allCredentialsFilled = credentialFields.every(field => 
    field.required ? credentials[field.key]?.trim() : true
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Adicionar Nova API' : 'Configurar Credenciais'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Selecione a plataforma e configure o nome da conexão'
              : 'Insira as credenciais da API e teste a conexão'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma</Label>
                <Select value={platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conexão</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: MercadoLivre Principal"
                />
                <p className="text-sm text-muted-foreground">
                  Nome para identificar esta conexão
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Credenciais para {platform}</h4>
                </div>

                {credentialFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={credentials[field.key] || ''}
                      onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                      placeholder={`Insira seu ${field.label}`}
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-3">
                  <Button
                    onClick={handleTestConnection}
                    disabled={!allCredentialsFilled || isTestingConnection}
                    className="w-full"
                    variant="outline"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isTestingConnection ? 'Testando Conexão...' : 'Testar Conexão'}
                  </Button>

                  {testResult && (
                    <Alert>
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {testResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          {step === 2 && (
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          
          {step === 1 ? (
            <Button 
              onClick={handleNext}
              disabled={!platform || !name}
            >
              Próximo
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              disabled={!testResult?.success}
            >
              Salvar Conexão
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}