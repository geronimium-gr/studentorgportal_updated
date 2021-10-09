import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, LoadingController, PopoverController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventzService } from '../../services/eventz.service';

@Component({
  selector: 'app-update-events',
  templateUrl: './update-events.component.html',
  styleUrls: ['./update-events.component.scss'],
})
export class UpdateEventsComponent implements OnInit {

  loadedEvent: any;
  loadedEventDetails: any;

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  formGroup: FormGroup;

  selectedImage: File;
  selectedImageUri: any;
  usePicker = true;

  eventSub: Subscription;

  constructor(private navParams: NavParams,
              private eventsService: EventzService,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private popOverCtrl: PopoverController,
              private alertCtrl: AlertController) { }

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

    this.loadedEvent = this.navParams.get('editEventId');
    console.log(this.loadedEvent);
  }//

  ionViewWillEnter() {
    this.loadEventDetails();
  }

  async loadEventDetails() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.eventSub = this.eventsService.getEvent(this.loadedEvent).subscribe(async eventz => {

      try {
        this.loadedEventDetails = eventz;
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

  async updateEvent() {
    if (!this.formGroup.valid) {
      console.log("Fill up.");
      return;
    }

    const eventId = this.loadedEvent;
    const eventTitle = this.formGroup.value.eventTitle;
    const eventContent = this.formGroup.value.eventContent;
    const startDate = this.formGroup.value.startDate;
    const endDate = this.formGroup.value.endDate;
    const startTime = this.formGroup.value.startTime;

    if (!this.selectedImage) {

      this.eventsService.updateEventText(eventId, eventTitle, eventContent, startDate, endDate, startTime);
      this.formGroup.reset();

    } else if (this.selectedImage) {

      const file = this.selectedImage;

      const fullPathInStorage = await this.uploadImage(eventId, file);

      const downloadUrl = await this.storage
      .ref(fullPathInStorage)
      .getDownloadURL()
      .toPromise();

      this.eventsService.updateEvent(eventId, eventTitle, eventContent, downloadUrl, startDate, endDate, startTime);
      this.formGroup.reset();

    } else {
      console.log("Error Happens");
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
    const fileRef = this.storage.ref('eventImage').child(uid).child(file.name);

    if (!!file) {
      const result = await fileRef.put(file)

      return result.ref.fullPath;
    }
  }//

  onClose() {
    this.popOverCtrl.dismiss();
  }

  datesValidator(){
    const startDate = new Date(this.formGroup.value.startDate);
    const endDate = new Date(this.formGroup.value.endDate);
    return endDate >= startDate;
  }

}
