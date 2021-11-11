import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditTrail } from '../../models/audit-trail';

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
  columns;

  isLoading = false;


  constructor(private menu: MenuController,
              private afs: AngularFirestore,
              private auditService: AuditTrailService
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
