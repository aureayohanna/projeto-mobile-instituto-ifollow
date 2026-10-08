import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab9Page } from './tab9.page';

describe('Tab9Page', () => {
  let component: Tab9Page;
  let fixture: ComponentFixture<Tab9Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tab9Page],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab9Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
