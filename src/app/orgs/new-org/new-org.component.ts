import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { LoadingController, PopoverController } from '@ionic/angular';

import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-new-org',
  templateUrl: './new-org.component.html',
  styleUrls: ['./new-org.component.scss'],
})
export class NewOrgComponent implements OnInit {

  orgName: any;
  orgDesc: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  currentImageUrl: string;

  selectType = "Academic"

  constructor(private orgService: OrganizationService,
              private aStorage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private afs: AngularFirestore,
              private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.addOrg(this.orgName, this.orgDesc);
  }

  async addOrg(name, description) {
    const orgId = this.afs.createId();

    const file = this.selectedImage;

    const fullPathInStorage = await this.uploadImage(orgId, file);

    const downloadUrl = await this.aStorage
    .ref(fullPathInStorage)
    .getDownloadURL()
    .toPromise();

    this.orgService.addOrganization(orgId, name, description, downloadUrl, this.selectType);
  }

  async uploadImage(uid, file): Promise<string> {
    const fileRef = this.aStorage.ref('orgImages').child(uid).child(file.name);

    if (!!file) {
      const result = await fileRef.put(file)

      return result.ref.fullPath;
    }
  }//

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
      };
      fr.readAsDataURL(this.selectedImage);
      loading.dismiss();
    } catch (error) {
      console.log("Image Selection Cancel");
      loading.dismiss();
    }
  }//

  selectedType(ev) {
    console.log(ev + this.selectType);
  }

  onClose() {
    this.popoverCtrl.dismiss();
  }
}
