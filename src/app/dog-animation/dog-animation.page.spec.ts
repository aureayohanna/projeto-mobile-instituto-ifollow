import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DogAnimationPage } from './dog-animation.page';

describe('DogAnimationPage', () => {
  let component: DogAnimationPage;
  let fixture: ComponentFixture<DogAnimationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DogAnimationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
