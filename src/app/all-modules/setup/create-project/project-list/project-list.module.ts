import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateProjectComponent } from '../create-project.component';
import { ProjectRoutingModule } from './project-list-routing.module';
import { ProjectListComponent } from './project-list.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    CreateProjectComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    ProjectRoutingModule,
  ],
})
export class ProjectListModule { }
