import { Repository } from 'typeorm';
import { AuditoriaService } from '../src/modules/auditoria/auditoria.service';
import { AcaoAuditoria, LogAuditoria } from '../src/modules/auditoria/log-auditoria.entity';

type MockRepository = jest.Mocked<Pick<Repository<LogAuditoria>, 'create' | 'save' | 'findOne'>> & {
  createQueryBuilder: jest.Mock;
};

function criarLog(sobrescritas: Partial<LogAuditoria> = {}): LogAuditoria {
  return {
    id: 'log-1',
    entidade: 'fornecedor',
    entidade_id: 'fornecedor-1',
    acao: AcaoAuditoria.CRIACAO,
    dados_anteriores: null,
    dados_novos: { razao_social: 'Fornecedor' },
    usuario_id: 'usuario-1',
    usuario_nome: 'Admin',
    criado_em: new Date('2026-01-01T00:00:00.000Z'),
    ...sobrescritas,
  };
}

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn((log: Partial<LogAuditoria>) => criarLog(log)),
      save: jest.fn((log: LogAuditoria) => Promise.resolve(log)),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new AuditoriaService(repository as unknown as Repository<LogAuditoria>);
  });

  it('registrar salva log com todos os campos corretamente', async () => {
    await service.registrar({
      entidade: 'fornecedor',
      entidade_id: 'fornecedor-1',
      acao: AcaoAuditoria.CRIACAO,
      dados_anteriores: null,
      dados_novos: { razao_social: 'Fornecedor' },
      usuario_id: 'usuario-1',
      usuario_nome: 'Admin',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entidade: 'fornecedor',
        entidade_id: 'fornecedor-1',
        acao: AcaoAuditoria.CRIACAO,
        usuario_id: 'usuario-1',
        usuario_nome: 'Admin',
      }),
    );
    expect(repository.save).toHaveBeenCalled();
  });
});
