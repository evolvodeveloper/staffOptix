import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { NgxEchartsModule } from 'ngx-echarts';
import { HierarchyRoutingModule } from './hierarchy-routing.module';
import { HierarchyComponent } from './hierarchy.component';

@NgModule({
  declarations: [HierarchyComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }), 
    HierarchyRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class HierarchyModule {
}
