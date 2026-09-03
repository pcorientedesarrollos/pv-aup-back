import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { PosCliente } from '../pos/entities/pos-cliente.entity';
import { PosVenta } from '../pos/entities/pos-venta.entity';
import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  const makeRepoMock = () => ({
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue(null),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(PosCliente), useValue: makeRepoMock() },
        { provide: getRepositoryToken(PosVenta), useValue: makeRepoMock() },
        { provide: getRepositoryToken(PosVentaDetalle), useValue: makeRepoMock() },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
