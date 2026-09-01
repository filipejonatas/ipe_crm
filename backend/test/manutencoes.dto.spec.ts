import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AtualizarManutencaoVeiculoDto } from '../src/modules/manutencoes/dto/atualizar-manutencao-veiculo.dto';
import { CriarManutencaoVeiculoDto } from '../src/modules/manutencoes/dto/criar-manutencao-veiculo.dto';
import { PecaManutencaoDto } from '../src/modules/manutencoes/dto/peca-manutencao.dto';

describe('DTOs de manutenção', () => {
  it.each([CriarManutencaoVeiculoDto, AtualizarManutencaoVeiculoDto])(
    '%p limita a quilometragem a 8 dígitos',
    async (Dto) => {
      const dto = plainToInstance(Dto, { quilometragem: 100_000_000 });
      const erros = await validate(dto, { skipMissingProperties: true });

      expect(erros.some((erro) => erro.property === 'quilometragem')).toBe(true);
    },
  );

  it.each([
    [2, false],
    [2.5, false],
    [2.55, true],
  ])('valida a quantidade %s com no máximo uma casa decimal', async (quantidade, invalida) => {
    const dto = plainToInstance(PecaManutencaoDto, {
      descricao_peca: 'Filtro',
      quantidade,
      preco_unitario: 10,
    });
    const erros = await validate(dto);

    expect(erros.some((erro) => erro.property === 'quantidade')).toBe(invalida);
  });
});
