import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavParams, LoadingController, PopoverController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss'],
})
export class UpdatePostComponent implements OnInit, OnDestroy {

  loadedPost: any;
  loadedPostDetails: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  formGroup: FormGroup;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  postSub: Subscription;

  constructor(private navParams: NavParams,
              private postService: PostService,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private popOverCtrl: PopoverController,
              private alertCtrl: AlertController) { }

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

    this.loadedPost = this.navParams.get('editPostId');
  }

  ionViewWillEnter() {
    this.loadPostDetails();
  }

  async loadPostDetails() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.postSub = this.postService.getPost(this.loadedPost).subscribe(async post => {

      try {
        this.loadedPostDetails = post;
        loading.dismiss();
      } catch (error) {
        console.log(error);
        loading.dismiss();
      }
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Error Occured!',
        message: 'Something went wrong. Try again.',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log("Close")
            }
          }
        ]
      });
      alert.present();
      // loading.dismiss();
    });
  }//

  async updatePost() {
    if (!this.formGroup.valid) {
      console.log("Fill up.");
      return;
    }

    const postId = this.loadedPost;
    const title = this.formGroup.value.postTitle;
    const content = this.formGroup.value.postContent;

    if (!this.selectedImage) {

      this.postService.updatePostsText(postId, title, content);
      this.formGroup.reset();

    } else if (this.selectedImage){
      const file = this.selectedImage;

      const fullPathInStorage = await this.uploadImage(postId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.postService.updatePosts(postId, title, content, downloadUrl);
      this.formGroup.reset();
    } else {
      console.log("Error happens");
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
    const fileRef = this.storage.ref('postImage').child(uid).child(file.name);

    if (!!file) {
      const result = await fileRef.put(file)

      return result.ref.fullPath;
    }
  }//

  onClose() {
    this.popOverCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }

}
