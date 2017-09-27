import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts/ng2-charts';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        DashboardRoutingModule,
        ChartsModule,
        FormsModule
    ],
    declarations: [DashboardComponent]
})
export class DashboardModule { }
