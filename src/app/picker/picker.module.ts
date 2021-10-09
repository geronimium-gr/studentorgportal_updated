import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { IonicModule } from '@ionic/angular';

import { UserImagePickerComponent } from './user-image-picker/user-image-picker.component';


@NgModule({
    declarations: [UserImagePickerComponent],
    imports: [CommonModule, IonicModule],
    exports: [UserImagePickerComponent]
})
export class PickerModule {}
