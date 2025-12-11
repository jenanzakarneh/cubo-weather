import { Test, TestingModule } from '@nestjs/testing';
import { MockProviderService } from './mock-provider.service';

describe('MockProviderService', () => {
  let service: MockProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockProviderService],
    }).compile();

    service = module.get<MockProviderService>(MockProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
