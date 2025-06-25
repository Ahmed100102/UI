import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedDashboardComponent } from './advanced-dashboard.component';

describe('AdvancedDashboardComponent', () => {
  let component: AdvancedDashboardComponent;
  let fixture: ComponentFixture<AdvancedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
