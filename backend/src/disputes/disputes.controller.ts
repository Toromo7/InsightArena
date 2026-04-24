import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { BanGuard } from '../common/guards/ban.guard';
import { User } from '../users/entities/user.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';

@ApiTags('Disputes')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @UseGuards(BanGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Raise a dispute for a resolved market' })
  @ApiResponse({
    status: 201,
    description: 'Dispute created successfully',
    type: Dispute,
  })
  @ApiResponse({ status: 400, description: 'Dispute window has passed or market not resolved' })
  @ApiResponse({ status: 409, description: 'Dispute already raised for this market' })
  @ApiResponse({ status: 404, description: 'Market not found' })
  @ApiResponse({ status: 502, description: 'Soroban contract call failed' })
  async createDispute(
    @Body() createDisputeDto: CreateDisputeDto,
    @CurrentUser() user: User,
  ): Promise<Dispute> {
    return this.disputesService.create(createDisputeDto, user);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all disputes (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of disputes',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DisputeStatus })
  async listDisputes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: DisputeStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 20;
    
    return this.disputesService.findAll(pageNum, limitNum, status);
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dispute by ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Dispute details',
    type: Dispute,
  })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDispute(@Param('id', ParseUUIDPipe) id: string): Promise<Dispute> {
    return this.disputesService.findOne(id);
  }

  @Post(':id/resolve')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a dispute (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Dispute resolved successfully',
    type: Dispute,
  })
  @ApiResponse({ status: 400, description: 'Dispute is not pending' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  @ApiResponse({ status: 502, description: 'Soroban contract call failed' })
  async resolveDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resolveDisputeDto: ResolveDisputeDto,
    @CurrentUser() adminUser: User,
  ): Promise<Dispute> {
    return this.disputesService.resolve(id, resolveDisputeDto, adminUser);
  }

  @Get('market/:marketId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get disputes for a specific market' })
  @ApiResponse({
    status: 200,
    description: 'List of disputes for the market',
    type: [Dispute],
  })
  @ApiResponse({ status: 404, description: 'Market not found' })
  async getMarketDisputes(
    @Param('marketId', ParseUUIDPipe) marketId: string,
  ): Promise<Dispute[]> {
    return this.disputesService.findByMarket(marketId);
  }
}
