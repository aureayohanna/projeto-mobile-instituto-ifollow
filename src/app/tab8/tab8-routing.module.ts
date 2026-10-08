import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab8Page } from './tab8.page';

const routes: Routes = [
  {
    path: '',
    component: Tab8Page,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab8PageRoutingModule {}
