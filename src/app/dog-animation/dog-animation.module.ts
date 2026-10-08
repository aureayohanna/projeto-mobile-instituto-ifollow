import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DogAnimationPageRoutingModule } from './dog-animation-routing.module';

import { DogAnimationPage } from './dog-animation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DogAnimationPageRoutingModule
  ],
  declarations: [DogAnimationPage]
})
export class DogAnimationPageModule {}
