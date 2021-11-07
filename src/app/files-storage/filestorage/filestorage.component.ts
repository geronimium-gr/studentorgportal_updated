import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { NgForm } from '@angular/forms';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-filestorage',
  templateUrl: './filestorage.component.html',
  styleUrls: ['./filestorage.component.scss'],
})
export class FilestorageComponent implements OnInit, OnDestroy {

  loadedOrgId: any;
  loadedOrgName: any;
  loadedUserId: any;

  fileSize: any;
  fileType;
  name: any

  files: Observable<any[]>;
  filesRef: AngularFirestoreCollection;
  fileName = "";

  selectedFile: any;

  newFile: any;

  loadingCmp: HTMLIonLoadingElement;

  constructor(private modal: ModalController,
              private navParams: NavParams,
              private afs: AngularFirestore,
              private storage: AngularFireStorage,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private alertCtrl: AlertController) {

    this.loadedOrgId = this.navParams.get('fileByOrgs');
    this.loadedOrgName = this.navParams.get('orgName');
    this.loadedUserId = this.navParams.get('userId');
    console.log(this.loadedOrgId + "-" + this.loadedUserId);

    this.filesRef = afs.collection('files', ref => ref.orderBy("createdAt", "desc").where("orgId", "==", this.loadedOrgId));
    this.files = this.filesRef.valueChanges();

  }

  ngOnInit() {}

  async addFile(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const id = this.afs.createId();

    const uploadTask: UploadTaskSnapshot = await this.uploadFile(this.selectedFile);
    const fileUrl = await uploadTask.ref.getDownloadURL();

    this.filesRef.doc(id).set({
      'id': id,
      'downloadUrl': fileUrl,
      'title': this.newFile,
      'orgId': this.loadedOrgId,
      'userId': this.loadedUserId,
      'fileName': this.fileName,
      'fileSize': this.fileSize,
      'fileType': this.fileType,
      'createdAt': Date.now()
    }).then(() => {
      this.toast('Uploaded Successfully', 'success');
      form.resetForm();
    }).catch(error => {
      this.toast(error.message, 'danger');
    });
  }


  onFileChosen(event: any) {

    this.selectedFile = event.target.files;

    var size = event.target.files[0].size;
    this.fileSize = Math.round(size/1024);

    this.name = event.target.files[0].name;

    this.fileType = this.name.split('.').pop();
    console.log(this.fileSize + "\n" + this.fileType);

  }

  async uploadFile(fileList): Promise<any> {
    if (fileList && fileList.length) {
      try {
        await this.presentLoading();
        const file = fileList[0];

        this.fileName = new Date().getTime() + "_" + file.name;

        const fileRefe = this.storage.ref(`files/${this.fileName}`);
        const task = this.storage.upload(`files/${this.fileName}`, file);

        console.log(this.fileName);


        task.percentageChanges().subscribe(resp => {
          this.loadingCmp.style.setProperty('--percent-uploaded', `${resp.toFixed()}%`);
          console.log(resp);
        });

        return task.snapshotChanges().pipe(
          finalize(() => this.loadingCmp.dismiss())
        ).toPromise();
      } catch (error) {
        console.log(error);
        this.loadingCmp.dismiss();
        this.toast('Something went wrong!', 'danger');
      }
    } else {
      this.toast('Select file first!', 'danger');
      return null;
    }
  }

  async presentLoading() {
    this.loadingCmp = await this.loadingCtrl.create({
      'message': "Uploading, please wait...",
      'cssClass': "loading-progress"
    });
    return this.loadingCmp.present();
  }

  openLink(slidingMember: IonItemSliding, url: any) {
    console.log(url);
    window.open(url);

    slidingMember.close();
  }

  async deleteFilePrompt(slidingMember: IonItemSliding, file: any, id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Delete this file?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.deleteFile(slidingMember, file, id);
          }
        }
      ]
    });

    await alert.present();
  }//

  async deleteFile(slidingMember: IonItemSliding, file: any, id: any) {

    const loading = await this.loadingCtrl.create({
      message: 'Deleting File. Please Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.storage.ref(`files/${file}`).delete();

    this.filesRef.doc(id).delete().then(() => {
      loading.dismiss();
      this.toast('Deleted Successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });

    slidingMember.close();
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }

  ngOnDestroy() {
  }

}
