import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { Dispute, DisputeStatus, DisputeResolution } from './entities/dispute.entity';
import { Market } from '../markets/entities/market.entity';
import { User } from '../users/entities/user.entity';
import { SorobanService } from '../soroban/soroban.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

describe('DisputesService', () => {
  let service: DisputesService;
  let disputesRepository: Repository<Dispute>;
  let marketsRepository: Repository<Market>;
  let sorobanService: SorobanService;

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
  } as User;

  const mockAdminUser: User = {
    id: 'admin-id',
    email: 'admin@example.com',
    username: 'admin',
  } as User;

  const mockMarket: Market = {
    id: 'market-id',
    on_chain_market_id: 'on-chain-market-id',
    title: 'Test Market',
    description: 'Test Description',
    category: 'test',
    outcome_options: ['yes', 'no'],
    end_time: new Date('2024-01-01'),
    resolution_time: new Date('2024-01-02'),
    is_resolved: true,
    resolved_outcome: 'yes',
    is_public: true,
    is_cancelled: false,
    is_featured: false,
    total_pool_stroops: '1000000',
    participant_count: 10,
    created_at: new Date('2024-01-01'),
  } as Market;

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
    const mockDisputesRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    };

    const mockMarketsRepository = {
      findOne: jest.fn(),
    };

    const mockSorobanService = {
      raiseDispute: jest.fn(),
      resolveDispute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        {
          provide: getRepositoryToken(Dispute),
          useValue: mockDisputesRepository,
        },
        {
          provide: getRepositoryToken(Market),
          useValue: mockMarketsRepository,
        },
        {
          provide: SorobanService,
          useValue: mockSorobanService,
        },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
    disputesRepository = module.get<Repository<Dispute>>(getRepositoryToken(Dispute));
    marketsRepository = module.get<Repository<Market>>(getRepositoryToken(Market));
    sorobanService = module.get<SorobanService>(SorobanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDisputeDto: CreateDisputeDto = {
      market_id: 'market-id',
      reason: 'Test dispute reason',
    };

    it('should successfully create a dispute', async () => {
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(mockMarket);
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(disputesRepository, 'create').mockReturnValue(mockDispute);
      jest.spyOn(disputesRepository, 'save').mockResolvedValue(mockDispute);
      jest.spyOn(sorobanService, 'raiseDispute').mockResolvedValue({
        dispute_id: 'on-chain-dispute-id',
        tx_hash: 'tx-hash',
      });

      const result = await service.create(createDisputeDto, mockUser);

      expect(marketsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'market-id' },
      });
      expect(disputesRepository.create).toHaveBeenCalledWith({
        market_id: 'market-id',
        disputant_id: 'user-id',
        reason: 'Test dispute reason',
        status: DisputeStatus.PENDING,
      });
      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException if market does not exist', async () => {
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDisputeDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if market is not resolved', async () => {
      const unresolvedMarket = { ...mockMarket, is_resolved: false };
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(unresolvedMarket);

      await expect(service.create(createDisputeDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if dispute window has passed', async () => {
      const oldMarket = {
        ...mockMarket,
        resolution_time: new Date('2023-01-01'), // More than 7 days ago
      };
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(oldMarket);

      await expect(service.create(createDisputeDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if dispute already exists', async () => {
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(mockMarket);
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(mockDispute);

      await expect(service.create(createDisputeDto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('resolve', () => {
    const resolveDisputeDto: ResolveDisputeDto = {
      resolution: DisputeResolution.UPHELD,
      admin_notes: 'Admin notes',
    };

    it('should successfully resolve a dispute', async () => {
      const disputeWithRelations = {
        ...mockDispute,
        market: mockMarket,
        disputant: mockUser,
      };

      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(disputeWithRelations);
      jest.spyOn(disputesRepository, 'save').mockResolvedValue(mockDispute);
      jest.spyOn(sorobanService, 'resolveDispute').mockResolvedValue({
        dispute_id: 'dispute-id',
        tx_hash: 'resolution-tx-hash',
      });

      const result = await service.resolve('dispute-id', resolveDisputeDto, mockAdminUser);

      expect(disputesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dispute-id' },
        relations: ['market', 'disputant'],
      });
      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException if dispute does not exist', async () => {
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.resolve('invalid-id', resolveDisputeDto, mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if dispute is not pending', async () => {
      const resolvedDispute = { ...mockDispute, status: DisputeStatus.RESOLVED };
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(resolvedDispute);

      await expect(
        service.resolve('dispute-id', resolveDisputeDto, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a dispute with relations', async () => {
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(mockDispute);

      const result = await service.findOne('dispute-id');

      expect(disputesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dispute-id' },
        relations: ['market', 'disputant', 'resolved_by'],
      });
      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException if dispute does not exist', async () => {
      jest.spyOn(disputesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkDisputeWindow', () => {
    it('should return true for market within dispute window', async () => {
      const recentMarket = {
        ...mockMarket,
        resolution_time: new Date(), // Just resolved
      };
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(recentMarket);

      const result = await service.checkDisputeWindow('market-id');

      expect(result).toBe(true);
    });

    it('should return false for market outside dispute window', async () => {
      const oldMarket = {
        ...mockMarket,
        resolution_time: new Date('2023-01-01'), // More than 7 days ago
      };
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(oldMarket);

      const result = await service.checkDisputeWindow('market-id');

      expect(result).toBe(false);
    });

    it('should return false for non-existent market', async () => {
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.checkDisputeWindow('invalid-id');

      expect(result).toBe(false);
    });

    it('should return false for unresolved market', async () => {
      const unresolvedMarket = { ...mockMarket, is_resolved: false };
      jest.spyOn(marketsRepository, 'findOne').mockResolvedValue(unresolvedMarket);

      const result = await service.checkDisputeWindow('market-id');

      expect(result).toBe(false);
    });
  });
});
