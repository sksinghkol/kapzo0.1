import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Storemenu } from './storemenu';

describe('Storemenu', () => {
  let component: Storemenu;
  let fixture: ComponentFixture<Storemenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storemenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Storemenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
