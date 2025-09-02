import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductVariant } from './admin-product-variant';

describe('AdminProductVariant', () => {
  let component: AdminProductVariant;
  let fixture: ComponentFixture<AdminProductVariant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductVariant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductVariant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
