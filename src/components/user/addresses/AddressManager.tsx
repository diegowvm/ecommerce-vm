import { useState } from 'react';
import { useAddresses, type Address, type AddressFormData } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressForm } from './AddressForm';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AddressManager() {
  const { addresses, loading, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleSubmit = async (data: AddressFormData) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await createAddress(data);
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando endereços...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          >
            Cancelar
          </Button>
        </div>
        
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Meus Endereços</h2>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Endereço
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum endereço cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione um endereço para facilitar suas compras futuras.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Endereço
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base">{address.label}</CardTitle>
                    {address.is_default && (
                      <Badge variant="default" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={address.is_default}
                      title={address.is_default ? "Já é o endereço padrão" : "Definir como padrão"}
                    >
                      {address.is_default ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir endereço?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O endereço será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p>
                    {address.address}, {address.number}
                    {address.complement && `, ${address.complement}`}
                  </p>
                  <p>
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                  <p>CEP: {address.cep}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}