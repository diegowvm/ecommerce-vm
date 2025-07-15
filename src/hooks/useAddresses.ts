import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  full_name: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  is_default: boolean;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os endereços.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (addressData: AddressFormData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // If this is the default address, remove default from others
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('addresses')
        .insert([{
          ...addressData,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Endereço adicionado com sucesso!",
      });

      loadAddresses();
    } catch (error) {
      console.error('Error creating address:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o endereço.",
        variant: "destructive",
      });
    }
  };

  const updateAddress = async (id: string, addressData: AddressFormData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // If this is the default address, remove default from others
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Endereço atualizado com sucesso!",
      });

      loadAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o endereço.",
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Endereço removido com sucesso!",
      });

      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Endereço padrão atualizado!",
      });

      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Erro",
        description: "Não foi possível definir o endereço padrão.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  return {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loadAddresses,
  };
}