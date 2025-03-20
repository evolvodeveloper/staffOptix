import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgxEchartsModule } from 'ngx-echarts';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { HierarchyRoutingModule } from './hierarchy-routing.module';
import { HierarchyComponent } from './hierarchy.component';

// import { CardModule } from 'primeng/card';


@NgModule({
  declarations: [HierarchyComponent],
  imports: [
    CommonModule,
    // PanelModule, ,
    OrganizationChartModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }), 
    HierarchyRoutingModule,
    // CardModule,
  ],

})
export class HierarchyModule {
 
}
