import { z } from 'zod';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const veiculoFormSchema = z.object({
  placa: z.string().trim().min(1, 'Placa e obrigatoria'),
  modelo: z.string().trim().min(1, 'Modelo e obrigatorio'),
  marca: z.string().trim().min(1, 'Marca e obrigatoria'),
  ano: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal('')),
  observacoes: textoOpcional,
  ativo: z.boolean(),
});

export type VeiculoFormValues = z.infer<typeof veiculoFormSchema>;
