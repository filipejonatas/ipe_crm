import { z } from 'zod';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const LIMITES_VEICULO = {
  placa: 7,
  modelo: 20,
  marca: 20,
  ano: 4,
} as const;

export const veiculoFormSchema = z.object({
  placa: z
    .string()
    .trim()
    .length(LIMITES_VEICULO.placa, 'Placa deve conter exatamente 7 caracteres')
    .regex(/^[A-Za-z0-9]{7}$/, 'Placa deve conter somente letras e números'),
  modelo: z
    .string()
    .trim()
    .min(1, 'Modelo é obrigatório')
    .max(LIMITES_VEICULO.modelo, 'Modelo deve ter no máximo 20 caracteres'),
  marca: z
    .string()
    .trim()
    .min(1, 'Marca é obrigatória')
    .max(LIMITES_VEICULO.marca, 'Marca deve ter no máximo 20 caracteres'),
  ano: z.coerce
    .number()
    .int('Ano deve conter somente números')
    .min(1900, 'Ano deve ser igual ou posterior a 1900')
    .max(2100, 'Ano deve ser igual ou anterior a 2100')
    .optional()
    .or(z.literal('')),
  observacoes: textoOpcional,
  ativo: z.boolean(),
});

export type VeiculoFormValues = z.infer<typeof veiculoFormSchema>;
