import { z } from 'zod';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const fornecedorFormSchema = z.object({
  razao_social: z.string().trim().min(1, 'Razao social e obrigatoria'),
  nome_fantasia: textoOpcional,
  cnpj: textoOpcional,
  telefone: textoOpcional,
  email: z.string().trim().email('Informe um email valido').optional().or(z.literal('')),
  observacoes: textoOpcional,
  ativo: z.boolean(),
});

export type FornecedorFormValues = z.infer<typeof fornecedorFormSchema>;
