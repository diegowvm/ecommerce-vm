import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Store, 
  Mail, 
  CreditCard, 
  Truck, 
  Shield, 
  Bell, 
  Users,
  Globe,
  Database,
  Palette,
  Save,
  Download,
  Upload,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: "KickZone",
    storeDescription: "Sua loja de tênis esportivos",
    storeEmail: "contato@kickzone.com",
    storePhone: "(11) 99999-9999",
    storeAddress: "Rua das Flores, 123 - São Paulo, SP",
    storeLogo: "",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockNotifications: true,
    newUserNotifications: true,
    
    // Payment Settings
    pixEnabled: true,
    creditCardEnabled: true,
    debitCardEnabled: true,
    boletoEnabled: false,
    paymentGateway: "stripe",
    
    // Shipping Settings
    freeShippingLimit: 199.90,
    defaultShippingCost: 15.90,
    expressShippingCost: 29.90,
    shippingCalculation: "automatic",
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    loginAttempts: 5,
    
    // SEO Settings
    metaTitle: "KickZone - Tênis Esportivos",
    metaDescription: "A melhor seleção de tênis esportivos para você",
    metaKeywords: "tênis, esportes, running, basketball",
    
    // Advanced Settings
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true,
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'kickzone-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Configurações exportadas com sucesso!");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...settings, ...importedSettings });
        toast.success("Configurações importadas com sucesso!");
      } catch (error) {
        toast.error("Erro ao importar configurações. Verifique o arquivo.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Configure as preferências do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="store">
            <Store className="w-4 h-4 mr-2" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="w-4 h-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="w-4 h-4 mr-2" />
            Entrega
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Database className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Loja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nome da Loja</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">E-mail</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Telefone</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeLogo">Logo (URL)</Label>
                  <Input
                    id="storeLogo"
                    value={settings.storeLogo}
                    onChange={(e) => setSettings({...settings, storeLogo: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Descrição</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.storeDescription}
                  onChange={(e) => setSettings({...settings, storeDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Endereço</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações gerais por e-mail
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, emailNotifications: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações urgentes por SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, smsNotifications: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novos Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novos pedidos
                  </p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, orderNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Estoque Baixo</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas quando produtos estão com estoque baixo
                  </p>
                </div>
                <Switch
                  checked={settings.lowStockNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, lowStockNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novos Usuários</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novos cadastros
                  </p>
                </div>
                <Switch
                  checked={settings.newUserNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, newUserNotifications: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>PIX</Label>
                      <p className="text-sm text-muted-foreground">
                        Pagamento instantâneo
                      </p>
                    </div>
                    <Switch
                      checked={settings.pixEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, pixEnabled: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cartão de Crédito</Label>
                      <p className="text-sm text-muted-foreground">
                        Visa, MasterCard, Elo
                      </p>
                    </div>
                    <Switch
                      checked={settings.creditCardEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, creditCardEnabled: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cartão de Débito</Label>
                      <p className="text-sm text-muted-foreground">
                        Débito à vista
                      </p>
                    </div>
                    <Switch
                      checked={settings.debitCardEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, debitCardEnabled: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Boleto Bancário</Label>
                      <p className="text-sm text-muted-foreground">
                        Pagamento via boleto
                      </p>
                    </div>
                    <Switch
                      checked={settings.boletoEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, boletoEnabled: checked})
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Gateway de Pagamento</Label>
                    <select
                      value={settings.paymentGateway}
                      onChange={(e) => setSettings({...settings, paymentGateway: e.target.value})}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="pagseguro">PagSeguro</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingLimit">Frete Grátis a partir de (R$)</Label>
                  <Input
                    id="freeShippingLimit"
                    type="number"
                    step="0.01"
                    value={settings.freeShippingLimit}
                    onChange={(e) => setSettings({...settings, freeShippingLimit: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultShippingCost">Custo do Frete Padrão (R$)</Label>
                  <Input
                    id="defaultShippingCost"
                    type="number"
                    step="0.01"
                    value={settings.defaultShippingCost}
                    onChange={(e) => setSettings({...settings, defaultShippingCost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expressShippingCost">Frete Expresso (R$)</Label>
                  <Input
                    id="expressShippingCost"
                    type="number"
                    step="0.01"
                    value={settings.expressShippingCost}
                    onChange={(e) => setSettings({...settings, expressShippingCost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cálculo de Frete</Label>
                  <select
                    value={settings.shippingCalculation}
                    onChange={(e) => setSettings({...settings, shippingCalculation: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="automatic">Automático (Correios)</option>
                    <option value="manual">Manual</option>
                    <option value="table">Tabela de Preços</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicionar camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, twoFactorAuth: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Tamanho Mínimo da Senha</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Máximo de Tentativas de Login</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.loginAttempts}
                    onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Título da Página (Meta Title)</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({...settings, metaTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Descrição da Página (Meta Description)</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({...settings, metaDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Palavras-chave (Meta Keywords)</Label>
                <Input
                  id="metaKeywords"
                  value={settings.metaKeywords}
                  onChange={(e) => setSettings({...settings, metaKeywords: e.target.value})}
                  placeholder="palavra1, palavra2, palavra3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Estas são configurações avançadas. Alterações incorretas podem afetar o funcionamento do sistema.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Desabilitar acesso público ao site
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, maintenanceMode: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar informações de debug
                  </p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, debugMode: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Melhorar performance com cache
                  </p>
                </div>
                <Switch
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, cacheEnabled: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compressão Habilitada</Label>
                  <p className="text-sm text-muted-foreground">
                    Comprimir recursos para melhor performance
                  </p>
                </div>
                <Switch
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, compressionEnabled: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;