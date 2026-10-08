import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaginaSenhaPageRoutingModule } from './pagina-senha-routing.module';

import { PaginaSenhaPage } from './pagina-senha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaginaSenhaPageRoutingModule
  ],
  declarations: [PaginaSenhaPage]
})
export class PaginaSenhaPageModule {}
