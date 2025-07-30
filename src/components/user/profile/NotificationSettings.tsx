import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  newsletter: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    newsletter: false,
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('email_notifications, sms_notifications, marketing_emails, newsletter')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          marketing_emails: data.marketing_emails ?? false,
          newsletter: data.newsletter ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as preferências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Preferências de notificação salvas!",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Carregando preferências...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email_notifications" className="font-medium">
                  Notificações por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber emails sobre pedidos e atualizações importantes
                </p>
              </div>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(value) => updatePreference('email_notifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sms_notifications" className="font-medium">
                  Notificações por SMS
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber SMS sobre atualizações de pedidos
                </p>
              </div>
            </div>
            <Switch
              id="sms_notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={(value) => updatePreference('sms_notifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="marketing_emails" className="font-medium">
                  Emails Promocionais
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber ofertas especiais e promoções por email
                </p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onCheckedChange={(value) => updatePreference('marketing_emails', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="newsletter" className="font-medium">
                  Newsletter
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber nossa newsletter com novidades e dicas
                </p>
              </div>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={(value) => updatePreference('newsletter', value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}