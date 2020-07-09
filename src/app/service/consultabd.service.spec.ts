import { TestBed } from '@angular/core/testing';

import { ConsultabdService } from './consultabd.service';

describe('ConsultabdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConsultabdService = TestBed.get(ConsultabdService);
    expect(service).toBeTruthy();
  });
});
