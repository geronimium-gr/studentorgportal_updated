import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-user-image-picker',
  templateUrl: './user-image-picker.component.html',
  styleUrls: ['./user-image-picker.component.scss'],
})
export class UserImagePickerComponent implements OnInit {

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  constructor(private loadingCtrl: LoadingController) { }

  ngOnInit() {}

  onPickImage() {
    this.filePickerRef.nativeElement.click();
  }

  async onFileChosen(event: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Wait...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    try {
      this.selectedImage = event.target.files[0];

      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result.toString();
        this.selectedImageUri = dataUrl;
        this.imagePick.emit(this.selectedImage);
      };
      fr.readAsDataURL(this.selectedImage);
      loading.dismiss();
    } catch (error) {
      console.log("Image Selection Cancel");
      loading.dismiss();
    }
  }//

}
