import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedChartComponent } from './advanced-chart.component';

describe('AdvancedChartComponent', () => {
  let component: AdvancedChartComponent;
  let fixture: ComponentFixture<AdvancedChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
