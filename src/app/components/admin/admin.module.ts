import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLandingComponent } from './admin-landing/admin-landing.component';
import { AdminSidenavComponent } from './admin-sidenav/admin-sidenav.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileSizePipe } from 'src/app/helpers/file-size.pipe';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminFileGalleryComponent } from './admin-file-gallery/admin-file-gallery.component';

@NgModule({
  declarations: [
    AdminLandingComponent,
    AdminSidenavComponent,
    FileUploadComponent,
    AdminHeaderComponent,
    FileSizePipe,
    AdminDashboardComponent,
    AdminFileGalleryComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
     MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
     MatMenuModule,
     MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
  ]
})
export class AdminModule { }
