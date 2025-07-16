import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { X, Settings } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    saveCookiePreferences(preferences);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    saveCookiePreferences(onlyNecessary);
    setIsVisible(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
    }));

    // Aqui você implementaria a lógica para ativar/desativar cookies conforme as preferências
    if (prefs.analytics) {
      // Ativar Google Analytics ou similar
      console.log('Analytics cookies enabled');
    }
    
    if (prefs.marketing) {
      // Ativar cookies de marketing
      console.log('Marketing cookies enabled');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 shadow-lg border-border bg-background/95 backdrop-blur-sm md:left-auto md:right-4 md:max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              Utilizamos cookies
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais 
              para melhorar sua experiência e personalizar conteúdo. Você pode escolher quais 
              aceitar ou configurar suas preferências.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button 
                onClick={handleAcceptAll}
                size="sm"
                className="flex-1"
              >
                Aceitar todos
              </Button>
              <Button 
                onClick={handleRejectAll}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Só necessários
              </Button>
              <Button 
                onClick={() => setShowPreferences(true)}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de Cookies</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cookies Necessários</h4>
                <p className="text-sm text-muted-foreground">
                  Essenciais para o funcionamento do site
                </p>
              </div>
              <Switch 
                checked={preferences.necessary} 
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cookies de Análise</h4>
                <p className="text-sm text-muted-foreground">
                  Nos ajudam a entender como você usa o site
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cookies de Marketing</h4>
                <p className="text-sm text-muted-foreground">
                  Para personalizar anúncios e conteúdo
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-4">
                Ao aceitar cookies, você concorda com o armazenamento de cookies em seu dispositivo 
                conforme descrito em nossa{' '}
                <a href="/privacy-policy" className="underline hover:text-foreground">
                  Política de Privacidade
                </a>.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleAcceptSelected} className="flex-1">
                  Salvar preferências
                </Button>
                <Button 
                  onClick={() => setShowPreferences(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;