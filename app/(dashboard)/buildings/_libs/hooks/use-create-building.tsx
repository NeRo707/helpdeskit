import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateBuilding } from '@/hooks/use-buildings';

export function useCreateBuildingForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const createBuilding = useCreateBuilding();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBuilding.mutate(
      { name, address: address || null },
      {
        onSuccess: () => {
          toast.success('Building created successfully');
          setOpen(false);
          setName('');
          setAddress('');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to create building');
        },
      }
    );
  };

  return {
    open,
    setOpen,
    name,
    setName,
    address,
    setAddress,
    handleSubmit,
    isPending: createBuilding.isPending,
  };
}
