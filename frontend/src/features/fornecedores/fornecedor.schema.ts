import { z } from 'zod';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const fornecedorFormSchema = z.object({
  razao_social: z.string().trim().min(1, 'Razao social e obrigatoria'),
  nome_fantasia: textoOpcional,
  cnpj: z
    .string()
    .trim()
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 digitos')
    .optional()
    .or(z.literal('')),
  telefone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve conter DDD e 11 digitos')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Informe um email valido').optional().or(z.literal('')),
  observacoes: textoOpcional,
  ativo: z.boolean(),
});

export type FornecedorFormValues = z.infer<typeof fornecedorFormSchema>;
