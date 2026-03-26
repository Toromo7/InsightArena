import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1',
    stellar_address: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3XNRBF7XN',
    username: 'testuser',
  };

  const mockNotification: Partial<Notification> = {
    id: 'notif-uuid-1',
    user_id: 'user-uuid-1',
    type: NotificationType.System,
    title: 'Test',
    message: 'Test message',
    is_read: false,
    created_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            findAllForUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should return paginated notifications for the current user', async () => {
      const paginated = {
        data: [mockNotification],
        total: 1,
        page: 1,
        limit: 20,
      };
      const spy = jest.spyOn(service, 'findAllForUser').mockResolvedValue(
        paginated as {
          data: Notification[];
          total: number;
          page: number;
          limit: number;
        },
      );

      const result = await controller.getMyNotifications(
        mockUser as User,
        1,
        20,
      );

      expect(spy).toHaveBeenCalledWith('user-uuid-1', 1, 20);
      expect(result).toEqual(paginated);
    });
  });

  describe('markAsRead', () => {
    it('should call service markAsRead with id and userId', async () => {
      const spy = jest.spyOn(service, 'markAsRead').mockResolvedValue();

      await controller.markAsRead('notif-uuid-1', mockUser as User);

      expect(spy).toHaveBeenCalledWith('notif-uuid-1', 'user-uuid-1');
    });
  });

  describe('markAllAsRead', () => {
    it('should call service markAllAsRead with userId', async () => {
      const spy = jest.spyOn(service, 'markAllAsRead').mockResolvedValue();

      await controller.markAllAsRead(mockUser as User);

      expect(spy).toHaveBeenCalledWith('user-uuid-1');
    });
  });
});
