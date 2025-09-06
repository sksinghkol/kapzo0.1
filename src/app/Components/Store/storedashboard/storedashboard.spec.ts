import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Storedashboard } from './storedashboard';

describe('Storedashboard', () => {
  let component: Storedashboard;
  let fixture: ComponentFixture<Storedashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storedashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Storedashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
