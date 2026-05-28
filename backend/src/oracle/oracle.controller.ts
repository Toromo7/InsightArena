import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { OracleService } from './oracle.service';
import { OracleAuthGuard } from './guards/oracle-auth.guard';
import {
  ListPendingMatchesQueryDto,
  PaginatedPendingMatchesResponse,
} from './dto/list-pending-matches-query.dto';

@ApiTags('Oracle')
@Controller('oracle')
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Get('pending-matches')
  @UseGuards(OracleAuthGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get pending matches that need results submitted' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of matches needing results',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid API key' })
  async getPendingMatches(
    @Query() query: ListPendingMatchesQueryDto,
  ): Promise<PaginatedPendingMatchesResponse> {
    return this.oracleService.getPendingMatches(query);
  }
}
