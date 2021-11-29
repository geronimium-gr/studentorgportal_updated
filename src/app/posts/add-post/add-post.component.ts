import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavParams, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss'],
})
export class AddPostComponent implements OnInit, OnDestroy {

  loadedOrg: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  formGroup: FormGroup;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  userId: any;
  user: any;
  userName: any;
  userPhoto: any;
  userSurname: any;

  postSub: Subscription;

  checkOrg: boolean;

  constructor(private postService: PostService,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private afs: AngularFirestore,
              private navParams: NavParams,
              private authService: AuthService,
              private popoverCtrl: PopoverController,
              public auth: AuthService) {

    this.postSub = this.authService.user$.subscribe(async user => {
      this.user = user;
      this.userName = user.userName;
      this.userSurname = user.userSurname;
      this.userId = user.userId;
      try {
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });//

}

  ngOnInit() {
    this.formGroup = new FormGroup({
      postTitle: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      postContent: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.loadedOrg = this.navParams.get('editOrgId');

  }//

  async addPost() {
    if (!this.formGroup.valid) {
      console.log("Fill up.");
      return;
    }

    const postId = this.afs.createId();
    const title = this.formGroup.value.postTitle;
    const content = this.formGroup.value.postContent;

    if (!this.selectedImage) {
      const image = '';

      this.publicPost(postId, title, content, image, this.userId, this.userName, this.userSurname,this.userPhoto, this.loadedOrg.orgId);
      this.formGroup.reset();
    } else {
      const file = this.selectedImage;

      const fullPathInStorage = await this.uploadImage(postId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.publicPost(postId, title, content, downloadUrl, this.userId, this.userName, this.userSurname, this.userPhoto, this.loadedOrg.orgId);
      this.formGroup.reset();
    }

  }

  publicPost(id, title, content, image, userId, userName, surname, photoUrl, orgId) {
    if (this.checkOrg == true) {
      this.postService.addPosts(id, title, content, image, userId, userName, surname, photoUrl, "public");
      return;
    }

    this.postService.addPosts(id, title, content, image, userId, userName, surname, photoUrl, orgId);
  }

  async uploadImage(uid, file): Promise<string> {
    const fileRef = this.storage.ref('postImage').child(uid).child(file.name);

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

  onClose() {
    this.popoverCtrl.dismiss();
  }

  checkAllOrg() {
    if (this.checkOrg == true) {
      console.log("Checked");
    } else {
      console.log("Not Checked");
      console.log("Please LORD tulong, matapos sana namin to.");
    }
  }

  ngOnDestroy() {
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }

}
