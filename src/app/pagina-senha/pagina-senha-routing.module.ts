import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaginaSenhaPage } from './pagina-senha.page';

const routes: Routes = [
  {
    path: '',
    component: PaginaSenhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaginaSenhaPageRoutingModule {}
