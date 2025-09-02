import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSize } from './admin-size';

describe('AdminSize', () => {
  let component: AdminSize;
  let fixture: ComponentFixture<AdminSize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSize]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSize);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
