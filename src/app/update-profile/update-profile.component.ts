import { Component, OnDestroy, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { LoadingController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit, OnDestroy {

  userId: string;
  fname: string;
  sname: string;
  bio: string;
  user: any;

  profileEditSub: Subscription;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  currentImageUrl: string;


   constructor(private auth: AuthService,
              private storage: AngularFireStorage,
              private userService: UserService,
              private popOverCtrl: PopoverController,
              private loadingCtrl: LoadingController,
              public authService: AuthService) { }

  ngOnInit() {

    this.profileEditSub = this.auth.user$.subscribe(async user => {

      this.user = user;
      this.userId = user.userId;
      this.fname = user.userName;
      this.sname = user.userSurname;
      this.bio = user.bio;

      try {
        this.currentImageUrl = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });

  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    const user = form.value.fname;
    const bio = form.value.bio;
    const surname = form.value.sname;

    this.onUpdateUser(user, bio, surname);

  }//

  async onUpdateUser(name: string, bio: string, surname: string){

    if (!this.selectedImage) {
      this.userService.updateUserText(this.userId, name, surname, bio);
    } else if (this.selectedImage) {
      const file = this.selectedImage;

      const fullPathInStorage = await this.uploadImage(this.userId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.userService.updateUser(this.userId, name, surname, bio, downloadUrl);
    } else {
      console.log("Error happens");
    }
  }//

  async uploadImage(uid, file): Promise<string> {
    const fileRef = this.storage.ref('userImages').child(uid).child(file.name);

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
  }

  onClose() {
    this.popOverCtrl.dismiss();
  }

  ngOnDestroy(){
    if (this.profileEditSub) {
      this.profileEditSub.unsubscribe();
    }
  }//

}
