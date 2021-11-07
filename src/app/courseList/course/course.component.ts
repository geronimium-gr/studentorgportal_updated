import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AlertController, IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
})
export class CourseComponent implements OnInit {

  courseCon = "";
  courses: Observable<any[]>;
  courseRef: AngularFirestoreCollection;
  // courseName = "";



  constructor(private modalCtrl: ModalController,
              private afs: AngularFirestore,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController)

  {
    this.courseRef = this.afs.collection('course');
    this.courses = this.courseRef.valueChanges();
  }

  ngOnInit() {}

  async addCourse() {
    const loading = await this.loadingCtrl.create({
      message: 'Adding Course. Please Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.courseRef.add({
      courseName: this.courseCon
    }).then(async resp => {
      this.courseRef.doc(resp.id).update({
        id: resp.id
      });
      loading.dismiss();
    }).catch(error => {
      console.log(error.message);
      loading.dismiss();
    });

    this.courseCon = "";
  }

  async deleteCoursePrompt(slidingMember: IonItemSliding, id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Delete this course?',
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
            this.deleteCourse(slidingMember, id);
          }
        }
      ]
    });

    await alert.present();
  }//

  async deleteCourse(slidingMember: IonItemSliding, id: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Deleting Course. Please Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();


    this.courseRef.doc(id).delete().then(() => {
      loading.dismiss();
      this.toast('Deleted Successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });

    slidingMember.close();

  }

  async toast(message, status){
    const toast = await this.toastCtrl.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
