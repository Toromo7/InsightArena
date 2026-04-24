import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { Dispute } from './entities/dispute.entity';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';

@ApiTags('Admin - Disputes')
@Controller('admin/disputes')
export class AdminDisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post(':id/resolve')
  @Roles(Role.Admin)
  @UseGuards()
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
}
