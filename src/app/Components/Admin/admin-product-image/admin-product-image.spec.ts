import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductImage } from './admin-product-image';

describe('AdminProductImage', () => {
  let component: AdminProductImage;
  let fixture: ComponentFixture<AdminProductImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
