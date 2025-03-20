import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PreferencesRoutingModule } from './preferences-routing.module';
import { PreferencesComponent } from './preferences.component';


@NgModule({
  declarations: [PreferencesComponent],
  imports: [
    CommonModule, MatSlideToggleModule, FormsModule,
    PreferencesRoutingModule
  ]
})
export class PreferencesModule { }
