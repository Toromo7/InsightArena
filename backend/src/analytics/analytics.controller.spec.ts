import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserTrendsDto } from './dto/user-trends.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: jest.Mocked<AnalyticsService>;

  const mockUserTrends: UserTrendsDto = {
    address: 'GABC123',
    accuracy_trend: [
      { timestamp: new Date(), value: 50 },
      { timestamp: new Date(), value: 60 },
    ],
    prediction_volume_trend: [
      { timestamp: new Date(), value: 1 },
      { timestamp: new Date(), value: 2 },
    ],
    profit_loss_trend: [
      { timestamp: new Date(), value: 0 },
      { timestamp: new Date(), value: 100000 },
    ],
    category_performance: [
      {
        category: 'Politics',
        accuracy_rate: 75,
        prediction_count: 10,
        profit_loss_stroops: '500000',
      },
    ],
    best_category: {
      category: 'Politics',
      accuracy_rate: 75,
      prediction_count: 10,
      profit_loss_stroops: '500000',
    },
    worst_category: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getUserTrends: jest.fn(),
            getMarketAnalytics: jest.fn(),
            getMarketHistory: jest.fn(),
            getDashboard: jest.fn(),
            getCategoryAnalytics: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserTrends', () => {
    it('should return user trends with default days parameter', async () => {
      service.getUserTrends.mockResolvedValue(mockUserTrends);

      const result = await controller.getUserTrends('GABC123');

      expect(result).toEqual(mockUserTrends);
      expect(service.getUserTrends).toHaveBeenCalledWith('GABC123', undefined);
    });

    it('should return user trends with custom days parameter', async () => {
      service.getUserTrends.mockResolvedValue(mockUserTrends);

      const result = await controller.getUserTrends('GABC123', 60);

      expect(result).toEqual(mockUserTrends);
      expect(service.getUserTrends).toHaveBeenCalledWith('GABC123', 60);
    });

    it('should throw 404 for unknown user address', async () => {
      service.getUserTrends.mockRejectedValue(new Error('User not found'));

      await expect(controller.getUserTrends('GUNKNOWN')).rejects.toThrow();
    });

    it('should return trends with one entry per day for requested period', async () => {
      const trendsWithDailyData: UserTrendsDto = {
        ...mockUserTrends,
        accuracy_trend: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
          value: 50 + i,
        })),
      };

      service.getUserTrends.mockResolvedValue(trendsWithDailyData);

      const result = await controller.getUserTrends('GABC123', 30);

      expect(result.accuracy_trend.length).toBe(30);
    });
  });

  describe('getCategoryAnalytics', () => {
    it('should return category analytics', async () => {
      const mockCategoryAnalytics = {
        categories: [
          {
            name: 'Politics',
            total_markets: 10,
            active_markets: 5,
            total_volume_stroops: '1000000',
            avg_participants: 20,
            trending: true,
          },
        ],
        generated_at: new Date(),
      };
      service.getCategoryAnalytics.mockResolvedValue(mockCategoryAnalytics);

      const result = await controller.getCategoryAnalytics();

      expect(result).toEqual(mockCategoryAnalytics);
      expect(service.getCategoryAnalytics).toHaveBeenCalled();
    });
  });
});
