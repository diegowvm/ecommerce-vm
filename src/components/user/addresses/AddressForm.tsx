import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Address, AddressFormData } from '@/hooks/useAddresses';

const addressSchema = z.object({
  label: z.string().min(1, 'Label é obrigatório'),
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido'),
  is_default: z.boolean(),
});

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || 'Casa',
      full_name: initialData?.full_name || '',
      address: initialData?.address || '',
      number: initialData?.number || '',
      complement: initialData?.complement || '',
      neighborhood: initialData?.neighborhood || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      cep: initialData?.cep || '',
      is_default: initialData?.is_default || false,
    },
  });

  const isDefault = watch('is_default');
  const selectedState = watch('state');

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    return formatted;
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue('cep', formatted);
  };

  const onFormSubmit = async (data: AddressFormData) => {
    setSubmitting(true);
    try {
      // Remove formatting from CEP
      const cleanedData = {
        ...data,
        cep: data.cep.replace(/\D/g, ''),
      };
      await onSubmit(cleanedData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Endereço</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">Label do Endereço</Label>
              <Select
                value={watch('label')}
                onValueChange={(value) => setValue('label', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Trabalho">Trabalho</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.label && (
                <p className="text-sm text-destructive mt-1">{errors.label.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Nome do destinatário"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, avenida, etc."
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                {...register('number')}
                placeholder="Número"
              />
              {errors.number && (
                <p className="text-sm text-destructive mt-1">{errors.number.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="complement">Complemento (Opcional)</Label>
            <Input
              id="complement"
              {...register('complement')}
              placeholder="Apartamento, bloco, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                {...register('neighborhood')}
                placeholder="Bairro"
              />
              {errors.neighborhood && (
                <p className="text-sm text-destructive mt-1">{errors.neighborhood.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Cidade"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Select
                value={selectedState}
                onValueChange={(value) => setValue('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register('cep')}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.cep && (
                <p className="text-sm text-destructive mt-1">{errors.cep.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setValue('is_default', checked)}
            />
            <Label htmlFor="is_default">Definir como endereço padrão</Label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Salvando...' : 'Salvar Endereço'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}