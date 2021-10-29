import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
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
              private afs: AngularFirestore)

  {
    this.courseRef = afs.collection('course');
    this.courses = this.courseRef.valueChanges();
  }

  ngOnInit() {}

  addCourse() {
    this.courseRef.add({
      courseName: this.courseCon
    }).then(async resp => {
      this.courseRef.doc(resp.id).update({
        id: resp.id
      })
    }).catch(error => {
      console.log();
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
