import { Test, TestingModule } from '@nestjs/testing';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { User } from '../users/entities/user.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

describe('DisputesController', () => {
  let controller: DisputesController;
  let service: DisputesService;

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
  } as User;

  const mockDispute: Dispute = {
    id: 'dispute-id',
    market_id: 'market-id',
    disputant_id: 'user-id',
    reason: 'Test dispute reason',
    status: DisputeStatus.PENDING,
    resolution: null,
    admin_notes: null,
    resolved_by_id: null,
    resolved_at: null,
    on_chain_dispute_id: null,
    on_chain_resolution_tx: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as Dispute;

  beforeEach(async () => {
    const mockDisputesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      resolve: jest.fn(),
      findByMarket: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputesController],
      providers: [
        {
          provide: DisputesService,
          useValue: mockDisputesService,
        },
      ],
    }).compile();

    controller = module.get<DisputesController>(DisputesController);
    service = module.get<DisputesService>(DisputesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDispute', () => {
    const createDisputeDto: CreateDisputeDto = {
      market_id: 'market-id',
      reason: 'Test dispute reason',
    };

    it('should create a dispute successfully', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockDispute);

      const result = await controller.createDispute(createDisputeDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createDisputeDto, mockUser);
      expect(result).toEqual(mockDispute);
    });
  });

  describe('listDisputes', () => {
    it('should return paginated disputes', async () => {
      const mockResponse = {
        disputes: [mockDispute],
        total: 1,
        page: 1,
        limit: 20,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.listDisputes('1', '20', DisputeStatus.PENDING);

      expect(service.findAll).toHaveBeenCalledWith(1, 20, DisputeStatus.PENDING);
      expect(result).toEqual(mockResponse);
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        disputes: [mockDispute],
        total: 1,
        page: 1,
        limit: 20,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.listDisputes();

      expect(service.findAll).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDispute', () => {
    it('should return a dispute by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDispute);

      const result = await controller.getDispute('dispute-id');

      expect(service.findOne).toHaveBeenCalledWith('dispute-id');
      expect(result).toEqual(mockDispute);
    });
  });

  describe('resolveDispute', () => {
    const resolveDisputeDto: ResolveDisputeDto = {
      resolution: 'upheld' as any,
      admin_notes: 'Admin notes',
    };

    it('should resolve a dispute successfully', async () => {
      jest.spyOn(service, 'resolve').mockResolvedValue(mockDispute);

      const result = await controller.resolveDispute('dispute-id', resolveDisputeDto, mockUser);

      expect(service.resolve).toHaveBeenCalledWith('dispute-id', resolveDisputeDto, mockUser);
      expect(result).toEqual(mockDispute);
    });
  });

  describe('getMarketDisputes', () => {
    it('should return disputes for a market', async () => {
      jest.spyOn(service, 'findByMarket').mockResolvedValue([mockDispute]);

      const result = await controller.getMarketDisputes('market-id');

      expect(service.findByMarket).toHaveBeenCalledWith('market-id');
      expect(result).toEqual([mockDispute]);
    });
  });
});
