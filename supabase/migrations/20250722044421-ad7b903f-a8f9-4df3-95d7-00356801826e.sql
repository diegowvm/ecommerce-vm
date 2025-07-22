-- Estender tabela profiles com novos campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS document text,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- Criar tabela de logs de atividade de usuários
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de preferências de usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  newsletter boolean DEFAULT false,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language text DEFAULT 'pt-BR',
  currency text DEFAULT 'BRL',
  timezone text DEFAULT 'America/Sao_Paulo',
  privacy_level text DEFAULT 'normal' CHECK (privacy_level IN ('public', 'normal', 'private')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  action_url text,
  metadata jsonb DEFAULT '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Criar tabela de tags/categorias de usuários
CREATE TABLE IF NOT EXISTS public.user_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3b82f6',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de associação usuário-tags
CREATE TABLE IF NOT EXISTS public.user_tag_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.user_tags(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(user_id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

-- Criar tabela de comunicações administrativas
CREATE TABLE IF NOT EXISTS public.admin_communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES public.profiles(user_id),
  recipient_id uuid REFERENCES public.profiles(user_id),
  subject text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'email' CHECK (type IN ('email', 'sms', 'push', 'system')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  template_id text,
  metadata jsonb DEFAULT '{}',
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_communications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all activity logs" 
ON public.user_activity_logs 
FOR ALL 
USING (is_admin());

-- Políticas RLS para user_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all preferences" 
ON public.user_preferences 
FOR SELECT 
USING (is_admin());

-- Políticas RLS para notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (is_admin());

-- Políticas RLS para user_tags
CREATE POLICY "Admins can manage user tags" 
ON public.user_tags 
FOR ALL 
USING (is_admin());

CREATE POLICY "Everyone can view user tags" 
ON public.user_tags 
FOR SELECT 
USING (true);

-- Políticas RLS para user_tag_assignments
CREATE POLICY "Admins can manage user tag assignments" 
ON public.user_tag_assignments 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own tag assignments" 
ON public.user_tag_assignments 
FOR SELECT 
USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Políticas RLS para admin_communications
CREATE POLICY "Admins can manage communications" 
ON public.admin_communications 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view communications sent to them" 
ON public.admin_communications 
FOR SELECT 
USING (recipient_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tag_assignments_user_id ON public.user_tag_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_communications_recipient ON public.admin_communications(recipient_id);

-- Função para registrar atividade do usuário
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_action text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, action, description, metadata)
  VALUES (p_user_id, p_action, p_description, p_metadata);
END;
$$;

-- Função para atualizar último login
CREATE OR REPLACE FUNCTION public.update_user_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_login = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE user_id = NEW.id;
  
  -- Registrar atividade de login
  PERFORM public.log_user_activity(
    NEW.id,
    'login',
    'User logged in',
    jsonb_build_object('login_count', (SELECT login_count FROM public.profiles WHERE user_id = NEW.id))
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar último login automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_last_login();

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
  COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned_users,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d,
  AVG(login_count) as avg_login_count
FROM public.profiles;

-- Função para obter estatísticas de usuários
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE(
  total_users bigint,
  active_users bigint,
  suspended_users bigint,
  banned_users bigint,
  new_users_30d bigint,
  active_users_7d bigint,
  avg_login_count numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_statistics;
END;
$$;