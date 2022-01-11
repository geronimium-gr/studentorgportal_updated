import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MenuController, PopoverController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';

import { Organization } from '../models/organization.model';
import { NewOrgComponent } from '../orgs/new-org/new-org.component';
import { AuthService } from '../services/auth.service';
import { OrganizationService } from '../services/organization.service';

import firebase from 'firebase/app';
import 'firebase/firestore'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  organization: Organization[];
  orgSub: Subscription;
  isLoading = false;

  segmentModel = "Academic"

  user: any

  orgs: Observable<any[]>;
  orgRef: AngularFirestoreCollection;

 public organizationList = [];
 public orgInfo = [];

  constructor(private menu: MenuController,
              private popOverCtrl: PopoverController,
              private orgService: OrganizationService,
              private authService: AuthService,
              public auth: AuthService,
              private afs: AngularFirestore)

  {


  }

  ngOnInit() {
    this.orgSub = this.authService.user$.subscribe(async users => {
      this.user = users;
      this.organizationList = users.organizationId;

      this.orgInfo = [];
      this.organizationList?.forEach(uid => {
        const docRef = firebase.firestore().collection("organization").doc(uid);

        docRef.get().then((doc) => {
            if (doc.exists) {
              if (!this.orgInfo.some(e => e.orgId === doc.data().orgId)) {
                this.orgInfo.push({
                 orgId: doc.data().orgId,
                 orgName: doc.data().orgName,
                 description: doc.data().description,
                 imageUrl: doc.data().imageUrl,
                 userList: doc.data().userList
               });
              }

              this.orgInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
      });
    });

    this.orgService.filterData();

    this.orgRef = this.afs.collection('organization', ref => ref.orderBy("createdAt", "desc").where("orgType", "==", "Non-Academic"));
    this.orgs = this.orgRef.valueChanges();

    this.isLoading = true;
    this.orgSub = this.orgService.getOrganizations().subscribe(orgs => {
      this.organization = orgs;
      this.isLoading = false;
    });
  }

  ionViewWillEnter() {
    this.loadOrganizations();
  }

  loadOrganizations() {

  }

  openFirst(){
    this.menu.enable(true, 'm1');
  }

  segmentChanged() {
    console.log(this.segmentModel);
  }

  async openAddForm(ev: any) {
    const popOver = await this.popOverCtrl.create({
      component: NewOrgComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popOver.present();
  }

  ngOnDestroy() {
    if (this.orgSub) {
      this.orgSub.unsubscribe();
    }
  }

}
