import { TestBed } from '@angular/core/testing';

import { CancerClassifier } from './cancer-classifier.service';

describe('CancerClassifier', () => {
  let service: CancerClassifier;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CancerClassifier);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
