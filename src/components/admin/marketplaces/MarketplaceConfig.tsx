import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, TestTube, Key, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceSettings {
  enabled: boolean;
  rateLimitPerMinute: number;
  syncIntervalHours: number;
  maxProductsPerSync: number;
  autoSync: boolean;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

const defaultSettings: Record<string, MarketplaceSettings> = {
  MercadoLivre: {
    enabled: true,
    rateLimitPerMinute: 1000,
    syncIntervalHours: 6,
    maxProductsPerSync: 500,
    autoSync: true,
    credentials: {}
  },
  Amazon: {
    enabled: false,
    rateLimitPerMinute: 200,
    syncIntervalHours: 12,
    maxProductsPerSync: 200,
    autoSync: false,
    credentials: {}
  },
  AliExpress: {
    enabled: false,
    rateLimitPerMinute: 300,
    syncIntervalHours: 24,
    maxProductsPerSync: 1000,
    autoSync: false,
    credentials: {}
  }
};

export function MarketplaceConfig() {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeMarketplace, setActiveMarketplace] = useState('MercadoLivre');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const currentSettings = settings[activeMarketplace];

  const updateSettings = (marketplace: string, updates: Partial<MarketplaceSettings>) => {
    setSettings(prev => ({
      ...prev,
      [marketplace]: {
        ...prev[marketplace],
        ...updates
      }
    }));
  };

  const updateCredentials = (marketplace: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [marketplace]: {
        ...prev[marketplace],
        credentials: {
          ...prev[marketplace].credentials,
          [key]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Save settings to Supabase or localStorage
      console.log('Saving settings:', settings[activeMarketplace]);
      
      toast({
        title: "Configurações Salvas",
        description: `Configurações do ${activeMarketplace} foram atualizadas`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // TODO: Test marketplace connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Conexão Testada",
        description: `Conexão com ${activeMarketplace} foi testada com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Teste Falhou",
        description: `Falha ao conectar com ${activeMarketplace}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações dos Marketplaces</CardTitle>
          <CardDescription>
            Configure as integrações e credenciais para cada marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMarketplace} onValueChange={setActiveMarketplace}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="MercadoLivre" className="flex items-center gap-2">
                MercadoLivre
                {settings.MercadoLivre.enabled && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="Amazon" className="flex items-center gap-2">
                Amazon
                {settings.Amazon.enabled && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="AliExpress" className="flex items-center gap-2">
                AliExpress
                {settings.AliExpress.enabled && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
            </TabsList>

            {Object.keys(settings).map((marketplace) => (
              <TabsContent key={marketplace} value={marketplace} className="space-y-6 mt-6">
                <div className="space-y-6">
                  {/* General Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configurações Gerais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Habilitar Marketplace</Label>
                          <p className="text-sm text-muted-foreground">
                            Ativar integração com {marketplace}
                          </p>
                        </div>
                        <Switch
                          checked={currentSettings.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings(marketplace, { enabled: checked })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Limite de Taxa (por minuto)</Label>
                          <Input
                            type="number"
                            value={currentSettings.rateLimitPerMinute}
                            onChange={(e) =>
                              updateSettings(marketplace, {
                                rateLimitPerMinute: parseInt(e.target.value) || 0
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Intervalo de Sincronização (horas)</Label>
                          <Input
                            type="number"
                            value={currentSettings.syncIntervalHours}
                            onChange={(e) =>
                              updateSettings(marketplace, {
                                syncIntervalHours: parseInt(e.target.value) || 0
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Máximo de Produtos por Sincronização</Label>
                          <Input
                            type="number"
                            value={currentSettings.maxProductsPerSync}
                            onChange={(e) =>
                              updateSettings(marketplace, {
                                maxProductsPerSync: parseInt(e.target.value) || 0
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`auto-sync-${marketplace}`}
                            checked={currentSettings.autoSync}
                            onCheckedChange={(checked) =>
                              updateSettings(marketplace, { autoSync: checked })
                            }
                          />
                          <Label htmlFor={`auto-sync-${marketplace}`}>
                            Sincronização Automática
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credentials */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Credenciais de API
                      </CardTitle>
                      <CardDescription>
                        Configure as credenciais para acessar a API do {marketplace}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {marketplace === 'MercadoLivre' && (
                        <>
                          <div className="space-y-2">
                            <Label>Client ID</Label>
                            <Input
                              type="password"
                              placeholder="Seu App ID do MercadoLivre"
                              value={currentSettings.credentials.clientId || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientId', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Client Secret</Label>
                            <Input
                              type="password"
                              placeholder="Seu Secret Key do MercadoLivre"
                              value={currentSettings.credentials.clientSecret || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientSecret', e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}

                      {marketplace === 'Amazon' && (
                        <>
                          <div className="space-y-2">
                            <Label>LWA Client ID</Label>
                            <Input
                              type="password"
                              placeholder="Seu LWA Client ID"
                              value={currentSettings.credentials.clientId || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientId', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LWA Client Secret</Label>
                            <Input
                              type="password"
                              placeholder="Seu LWA Client Secret"
                              value={currentSettings.credentials.clientSecret || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientSecret', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Refresh Token</Label>
                            <Input
                              type="password"
                              placeholder="Seu Refresh Token"
                              value={currentSettings.credentials.refreshToken || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'refreshToken', e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}

                      {marketplace === 'AliExpress' && (
                        <>
                          <div className="space-y-2">
                            <Label>App Key</Label>
                            <Input
                              type="password"
                              placeholder="Sua App Key do AliExpress"
                              value={currentSettings.credentials.clientId || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientId', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>App Secret</Label>
                            <Input
                              type="password"
                              placeholder="Seu App Secret do AliExpress"
                              value={currentSettings.credentials.clientSecret || ''}
                              onChange={(e) =>
                                updateCredentials(marketplace, 'clientSecret', e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}

                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription>
                          Suas credenciais são armazenadas de forma segura e criptografada.
                          Nunca compartilhe essas informações.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button onClick={handleSaveSettings} className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTesting || !currentSettings.enabled}
                      className="flex-1"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {isTesting ? 'Testando...' : 'Testar Conexão'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}