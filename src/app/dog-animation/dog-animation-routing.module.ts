import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DogAnimationPage } from './dog-animation.page';

const routes: Routes = [
  {
    path: '',
    component: DogAnimationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DogAnimationPageRoutingModule {}
