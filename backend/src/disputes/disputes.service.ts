import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Dispute, DisputeStatus, DisputeResolution } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { Market } from '../markets/entities/market.entity';
import { User } from '../users/entities/user.entity';
import { SorobanService } from '../soroban/soroban.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private disputesRepository: Repository<Dispute>,
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
    private sorobanService: SorobanService,
  ) {}

  async create(createDisputeDto: CreateDisputeDto, user: User): Promise<Dispute> {
    const { market_id, reason } = createDisputeDto;

    // Check if market exists and is resolved
    const market = await this.marketsRepository.findOne({
      where: { id: market_id },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    if (!market.is_resolved) {
      throw new BadRequestException('Disputes can only be raised for resolved markets');
    }

    // Check if dispute window has passed (7 days after resolution)
    const disputeWindowEnd = new Date(market.resolution_time);
    disputeWindowEnd.setDate(disputeWindowEnd.getDate() + 7);
    
    if (new Date() > disputeWindowEnd) {
      throw new BadRequestException('Dispute window has passed');
    }

    // Check if dispute already exists for this market
    const existingDispute = await this.disputesRepository.findOne({
      where: { market_id, status: DisputeStatus.PENDING },
    });

    if (existingDispute) {
      throw new ConflictException('Dispute already raised for this market');
    }

    // Create dispute
    const dispute = this.disputesRepository.create({
      market_id,
      disputant_id: user.id,
      reason,
      status: DisputeStatus.PENDING,
    });

    const savedDispute = await this.disputesRepository.save(dispute);

    // Record dispute on-chain
    try {
      const onChainResult = await this.sorobanService.raiseDispute(
        market.on_chain_market_id,
        reason,
      );
      
      // Update dispute with on-chain ID
      savedDispute.on_chain_dispute_id = onChainResult.dispute_id;
      await this.disputesRepository.save(savedDispute);
    } catch (error) {
      // Log error but don't fail the dispute creation
      console.error('Failed to record dispute on-chain:', error);
    }

    return this.findOne(savedDispute.id);
  }

  async resolve(
    id: string,
    resolveDisputeDto: ResolveDisputeDto,
    adminUser: User,
  ): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({
      where: { id },
      relations: ['market', 'disputant'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.PENDING) {
      throw new BadRequestException('Dispute is not pending');
    }

    const { resolution, admin_notes } = resolveDisputeDto;

    // Update dispute
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = resolution;
    dispute.admin_notes = admin_notes || null;
    dispute.resolved_by_id = adminUser.id;
    dispute.resolved_at = new Date();

    const savedDispute = await this.disputesRepository.save(dispute);

    // Record resolution on-chain
    try {
      const onChainResult = await this.sorobanService.resolveDispute(
        dispute.market.on_chain_market_id,
        dispute.on_chain_dispute_id,
        resolution,
      );
      
      // Update dispute with on-chain transaction
      savedDispute.on_chain_resolution_tx = onChainResult.tx_hash;
      await this.disputesRepository.save(savedDispute);
    } catch (error) {
      // Log error but don't fail the dispute resolution
      console.error('Failed to record dispute resolution on-chain:', error);
    }

    // If dispute is upheld (overturn original outcome), update market
    if (resolution === DisputeResolution.UPHELD) {
      await this.handleOverturnedMarket(dispute.market);
    }

    return this.findOne(id);
  }

  async findOne(id: string): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({
      where: { id },
      relations: ['market', 'disputant', 'resolved_by'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findByMarket(marketId: string): Promise<Dispute[]> {
    return this.disputesRepository.find({
      where: { market_id },
      relations: ['disputant', 'resolved_by'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: DisputeStatus,
  ): Promise<{ disputes: Dispute[]; total: number; page: number; limit: number }> {
    const where = status ? { status } : {};
    
    const [disputes, total] = await this.disputesRepository.findAndCount({
      where,
      relations: ['market', 'disputant', 'resolved_by'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      disputes,
      total,
      page,
      limit,
    };
  }

  private async handleOverturnedMarket(market: Market): Promise<void> {
    // For upheld disputes, we might need to handle refunds or other logic
    // This is a placeholder for any additional business logic needed
    // when a market outcome is overturned
    console.log(`Market ${market.id} outcome overturned due to upheld dispute`);
  }

  async checkDisputeWindow(marketId: string): Promise<boolean> {
    const market = await this.marketsRepository.findOne({
      where: { id: marketId },
    });

    if (!market || !market.is_resolved) {
      return false;
    }

    const disputeWindowEnd = new Date(market.resolution_time);
    disputeWindowEnd.setDate(disputeWindowEnd.getDate() + 7);
    
    return new Date() <= disputeWindowEnd;
  }
}
