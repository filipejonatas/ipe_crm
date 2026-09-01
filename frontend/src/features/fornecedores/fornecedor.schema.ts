import { z } from 'zod';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const LIMITES_FORNECEDOR = {
  razaoSocial: 80,
  nomeFantasia: 40,
  email: 40,
} as const;

export const fornecedorFormSchema = z.object({
  razao_social: z
    .string()
    .trim()
    .min(1, 'Razão social é obrigatória')
    .max(LIMITES_FORNECEDOR.razaoSocial, 'Razão social deve ter no máximo 80 caracteres'),
  nome_fantasia: z
    .string()
    .trim()
    .max(LIMITES_FORNECEDOR.nomeFantasia, 'Nome fantasia deve ter no máximo 40 caracteres')
    .optional()
    .or(z.literal('')),
  cnpj: z
    .string()
    .trim()
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos')
    .optional()
    .or(z.literal('')),
  telefone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve conter DDD e 11 dígitos')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .max(LIMITES_FORNECEDOR.email, 'E-mail deve ter no máximo 40 caracteres')
    .email('Informe um e-mail válido')
    .optional()
    .or(z.literal('')),
  observacoes: textoOpcional,
  ativo: z.boolean(),
});

export type FornecedorFormValues = z.infer<typeof fornecedorFormSchema>;
