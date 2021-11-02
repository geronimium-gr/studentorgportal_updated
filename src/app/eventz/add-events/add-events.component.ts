import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, NavParams, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { EventzService } from '../../services/eventz.service';


@Component({
  selector: 'app-add-events',
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.scss'],
})
export class AddEventsComponent implements OnInit, OnDestroy {
  loadedOrg: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  formGroup: FormGroup;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  userId: any;
  user: any;
  userName: any;
  userSurname: any;
  userPhoto: any;

  eventSub: Subscription;

  constructor(
    private eventService: EventzService,
    private storage: AngularFireStorage,
    private loadingCtrl: LoadingController,
    private afs: AngularFirestore,
    private navParams: NavParams,
    private authService: AuthService,
    private popoverCtrl: PopoverController)
    {
      this.eventSub = this.authService.user$.subscribe(async user => {
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
      eventTitle: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      eventContent: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      startDate: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      endDate: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      startTime: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.loadedOrg = this.navParams.get('editOrgId');

  }

  async addEvent() {
    if (!this.formGroup.valid) {
      console.log("Fill up.");
      return;
    }

    const eventId = this.afs.createId();
    const title = this.formGroup.value.eventTitle;
    const content = this.formGroup.value.eventContent;
    const startDate = this.formGroup.value.startDate;
    const endDate = this.formGroup.value.endDate;
    const startTime = this.formGroup.value.startTime;

    if (!this.selectedImage) {
      const image = '';
      this.eventService.addEvents(eventId, title, content, image, this.userId, this.userName, this.userSurname, this.userPhoto, this.loadedOrg.orgId, startDate, endDate, startTime);
      this.formGroup.reset();
    } else if (this.selectedImage) {
      const file = this.selectedImage;

      const fullPathInStorage = await this.uploadImage(eventId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.eventService.addEvents(eventId, title, content, downloadUrl, this.userId, this.userName, this.userSurname, this.userPhoto, this.loadedOrg.orgId, startDate, endDate, startTime);
      this.formGroup.reset();

    } else {
      console.log("Error happens.")
    }
  }

  async uploadImage(uid, file): Promise<string> {
    const fileRef = this.storage.ref('eventImage').child(uid).child(file.name);

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

  datesValidator(){
    const startDate = new Date(this.formGroup.value.startDate);
    const endDate = new Date(this.formGroup.value.endDate);
    return endDate >= startDate;
  }

  onClose() {
    this.popoverCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

}
