import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page, CapitalizePipe } from './tab4.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab4PageRoutingModule } from './tab4-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab4PageRoutingModule
  ],
  declarations: [Tab4Page, CapitalizePipe]
})
export class Tab4PageModule {}
