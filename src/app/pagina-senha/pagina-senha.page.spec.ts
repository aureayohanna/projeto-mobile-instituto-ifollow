import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaSenhaPage } from './pagina-senha.page';

describe('PaginaSenhaPage', () => {
  let component: PaginaSenhaPage;
  let fixture: ComponentFixture<PaginaSenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginaSenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
