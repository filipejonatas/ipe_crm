export type Perfil = 'admin' | 'compras' | 'oficina' | 'administrativo' | 'gerente';

export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
}

export interface RespostaErro {
  statusCode: number;
  codigo: string;
  mensagem: string;
  detalhes?: unknown;
}
