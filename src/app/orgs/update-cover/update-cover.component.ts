import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { LoadingController, NavParams, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-update-cover',
  templateUrl: './update-cover.component.html',
  styleUrls: ['./update-cover.component.scss'],
})
export class UpdateCoverComponent implements OnInit, OnDestroy {

  user: any;
  coverPhotoSub: Subscription;
  loadedOrg: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  constructor(private popOverCtrl: PopoverController,
              private authService: AuthService,
              private navParams: NavParams,
              private orgService: OrganizationService,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController)

  {
    this.coverPhotoSub = this.authService.user$.subscribe(async user => {
      this.user = user;
  })
  }

  ngOnInit() {
    this.loadedOrg = this.navParams.get('editOrgId');
  }

  async updateOrgCover() {

    try {
      const file = this.selectedImage;
      const orgId = this.loadedOrg.orgId;

      const fullPathInStorage = await this.uploadImage(orgId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.orgService.updateCoverPhoto(orgId, downloadUrl);
      console.log("No image selected...");

      } catch (error) {
        console.log(error);
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

  ngOnDestroy() {
    if (!this.coverPhotoSub) {
      this.coverPhotoSub.unsubscribe();
    }
  }

}
