import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomErrorException } from 'src/filter/custom-error.exception';
import { TokenGuard } from 'src/common/guard/token.guard';
import { BoatAPIService } from './boat-api.service';
import { CreateBoatDto } from 'src/dto/boat-create.dto';
import { ModifyBoatDto } from 'src/dto/boat-modify.dto';
import { CustomLoggerService } from 'src/module/custom.logger';
import { WHERE } from 'src/common/const';

@ApiTags('BOAT API')
@Controller('api/boat')
export class BoatAPIController {
  constructor(
    private readonly boatAPIService: BoatAPIService,
    private readonly customLoggerService: CustomLoggerService,
  ) {}

  @UseGuards(TokenGuard)
  @Get('/v1/list')
  @ApiOperation({
    summary: '종이배 리스트 조회',
  })
  async getBoatList(@Query('userPk') userPk: string) {
    try {
      const boatList = await this.boatAPIService.getBoatList(userPk);
      return { statusCode: 200, data: { boatList } };
    } catch (error) {
      this.customLoggerService.error(
        WHERE['BOAT'],
        '/v1/list',
        '종이배 리스트 조회 실패',
        {
          userPk,
        },
      );
      throw new CustomErrorException('Request Failed', 400);
    }
  }

  @UseGuards(TokenGuard)
  @Get('/v1/list-filter')
  @ApiOperation({
    summary: '종이배 리스트 조회 - 필터링',
  })
  @ApiQuery({ name: 'filter1', required: false, description: 'filter5' })
  @ApiQuery({ name: 'filter2', required: false, description: 'filter5' })
  @ApiQuery({ name: 'filter3', required: false, description: 'filter5' })
  @ApiQuery({ name: 'filter4', required: false, description: 'filter5' })
  @ApiQuery({ name: 'filter5', required: false, description: 'filter5' })
  async getFilteredBoatList(
    @Query('userPk') userPk: string,
    @Query('filter1') filter1?: string,
    @Query('filter2') filter2?: string,
    @Query('filter3') filter3?: string,
    @Query('filter4') filter4?: string,
    @Query('filter5') filter5?: string,
  ) {
    try {
      const boatList = await this.boatAPIService.getFilteredBoatList(
        userPk,
        filter1,
        filter2,
        filter3,
        filter4,
        filter5,
      );
      return { statusCode: 200, data: { boatList } };
    } catch (error) {
      this.customLoggerService.error(
        WHERE['BOAT'],
        '/v1/list-filter',
        '종이배 리스트 조회 실패',
        {
          userPk,
          filter1,
          filter2,
          filter3,
          filter4,
          filter5,
        },
      );
      throw new CustomErrorException('Request Failed', 400);
    }
  }

  @UseGuards(TokenGuard)
  @Get('/v1/single')
  @ApiOperation({
    summary: '단일 종이배 조회',
  })
  async getSingleBoat(@Query('boatPk') boatPk: number) {
    try {
      const boat = await this.boatAPIService.getSingleBoat(boatPk);
      if (!boat) {
        return { statusCode: 404, message: 'Not Found' };
      }
      return { statusCode: 200, data: { boat } };
    } catch (error) {
      this.customLoggerService.error(
        WHERE['BOAT'],
        '/v1/single',
        '단일 종이배 조회 실패',
        {
          boatPk,
        },
      );
      throw new CustomErrorException('Request Failed', 400);
    }
  }

  @UseGuards(TokenGuard)
  @Post('/v1/create')
  @ApiOperation({
    summary: '종이배 생성',
  })
  async createBoat(@Body() dto: CreateBoatDto) {
    try {
      await this.boatAPIService.createBoat(dto);
      return { statusCode: 200, message: 'Create Boat Success' };
    } catch (error) {
      this.customLoggerService.error(
        WHERE['BOAT'],
        '/v1/create',
        '종이배 생성 실패',
        {
          ...dto,
        },
      );
      throw new CustomErrorException('Request Failed', 400);
    }
  }

  @UseGuards(TokenGuard)
  @Put('/v1/modify')
  @ApiOperation({
    summary: '종이배 수정',
  })
  async modifyBoat(@Body() dto: ModifyBoatDto) {
    try {
      await this.boatAPIService.modifyBoat(dto);
      return { statusCode: 200, message: 'Modify Boat Success' };
    } catch (error) {
      this.customLoggerService.error(
        WHERE['BOAT'],
        '/v1/modify',
        '종이배 수정 실패',
        {
          ...dto,
        },
      );
      throw new CustomErrorException('Request Failed', 400);
    }
  }
}
