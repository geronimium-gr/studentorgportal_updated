import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, LoadingController, MenuController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditTrail } from '../../models/audit-trail';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.page.html',
  styleUrls: ['./audit-trail.page.scss'],
})
export class AuditTrailPage implements OnInit, OnDestroy {

  selectCategory = "userName";
  searchValue: string = "";

  auditList: AuditTrail[];
  auditSub: Subscription;

  rows = [];
  loadingRows = [];
  rowArray = [];
  columns;

  isLoading = false;


  constructor(private menu: MenuController,
              private afs: AngularFirestore,
              private auditService: AuditTrailService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController
    )
    {
      this.getData();
    }

  ngOnInit() {
    this.isLoading = true;
    this.auditSub = this.auditService.getAudits().subscribe(audits => {
      this.auditList = audits;
      this.isLoading = false;
    });
  }

  exportCSV() {
    //Author: Christian Ching
    this.rowArray.push(["Surname","Firstname", "SchoolID", "Email", "Action", "Timestamp"]);

    this.rows.forEach((u) => {
      this.rowArray.push([u.userSurname, u.userName, u.userSchoolId, u.userEmail, u.action, new Date(u.createdAt)]);
    });

    const csvData = this.rowArray.map((r) => r.join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + csvData;

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_${ new Date().getTime() }.csv`);
    document.body.appendChild(link);

    link.click();
  }

  async deleteData() {
    const alert = await this.alertCtrl.create({
      header: 'Are you absolutely sure?',
      cssClass: 'deleteAlert',
      subHeader: 'All records of the Audit Trail will be deleted.',
      message: `This action cannot be undone. This will permanently delete the
                records <br> <br>
                Please type <strong>your password</strong> to confirm.`,
      inputs: [
        {
          name: 'auditText',
          type: 'password',
          placeholder: 'Type password here...',
          attributes: {
            minLength: 6,
            inputmode: 'decimal'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Delete records',
          handler: async data => {
            const loading = await this.loadingCtrl.create({
              message: 'Wait...',
              spinner: 'crescent',
              showBackdrop: true
            });

            loading.present();

            const currentUser = firebase.auth().currentUser;

            const credentials = firebase.auth.EmailAuthProvider.credential(
              currentUser.email , data.auditText
            );

            currentUser.reauthenticateWithCredential(credentials)
              .then(success => {
                if (data.auditText.length < 6) {
                  loading.dismiss();
                  console.log('Fill Up Password');
                } else {
                  loading.dismiss();
                  console.log('Deleted.');
                  this.exportCSV();
                  this.deleteAllData();
                  this.toast('All records deleted.', 'success');
                }
              },
              error => {
                console.log(error);
                if (error.code === "auth/wrong-password") {
                  loading.dismiss();
                  this.alertController('Wrong Password', error.message);
                } else if (error.code === "auth/network-request-failed") {
                  loading.dismiss();
                  this.alertController('Network Error', error.message);
                } else {
                  loading.dismiss();
                  this.alertController('Error', error.message);
                }//if
              }).catch(error => {
                loading.dismiss();
                console.log(error);
              });
          }//async data
        }
      ]
    });

    await alert.present();
  }

  async alertController(header, message){
    let alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.deleteData();
          }
        }
       ]
    });
    alert.present();
  }//

  async toast(message, status){
    const toast = await this.toastCtrl.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }//

  async deleteAllData() {
    try {
      const batch = this.afs.firestore.batch();
      const userRef = firebase.firestore()
        .collection('audit')
        .get();
        (await userRef).forEach((element) => {
            batch.delete(element.ref);
        });
  
        return batch.commit();
    } catch (error) {
      console.log(error);
    }

  }

  getData() {
    this.afs.collection('audit', ref => ref.orderBy("createdAt", "desc")).valueChanges().subscribe((records) => {
      this.rows = records;
      this.loadingRows = records;
    });
  }

  initializeItems() {
    this.rows = this.loadingRows;
  }

  filterList(evt) {
    this.initializeItems();

    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.rows = this.rows.filter(results => {
      if (this.selectCategory === "userName") {
        if (results.userName && searchTerm) {
          if (results.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "userSurname") {
        if (results.userSurname && searchTerm) {
          if (results.userSurname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "userSchoolId") {
        if (results.userSchoolId && searchTerm) {
          if (results.userSchoolId.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "action") {
        if (results.action && searchTerm) {
          if (results.action.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      }
    });

  }

  openFirst(){
    this.menu.enable(true, 'm1');
  }

  ngOnDestroy() {
    if (this.auditSub) {
      this.auditSub.unsubscribe();
    }
  }

}
