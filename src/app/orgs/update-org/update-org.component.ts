import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { LoadingController, NavParams, PopoverController } from '@ionic/angular';

import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-update-org',
  templateUrl: './update-org.component.html',
  styleUrls: ['./update-org.component.scss'],
})
export class UpdateOrgComponent implements OnInit {

  loadedOrg: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  constructor(private navParams: NavParams,
              private orgService: OrganizationService,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private popOverCtrl: PopoverController
              ) { }

  ngOnInit() {
    this.loadedOrg = this.navParams.get('editOrgId');
  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    const organizationName = form.value.orgName;
    const organizationDesc = form.value.orgDesc;

    this.updateOrg(organizationName, organizationDesc);
  }

  async updateOrg(name, description) {

    try {
      const file = this.selectedImage;
      const orgId = this.loadedOrg.orgId;

      const fullPathInStorage = await this.uploadImage(orgId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.orgService.updateOrganizationwithImage(orgId, name, description, downloadUrl);
      console.log("No image selected...");

      } catch (error) {
        this.orgService.updateOrganization(this.loadedOrg.orgId, name, description);
      }

  }

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
  }

  async uploadImage(uid, file): Promise<string> {
    const fileRef = this.storage.ref('orgImages').child(uid).child(file.name);

    if (!!file) {
      const result = await fileRef.put(file)

      return result.ref.fullPath;
    }
  }//

  onClose() {
    this.popOverCtrl.dismiss();
  }

}
