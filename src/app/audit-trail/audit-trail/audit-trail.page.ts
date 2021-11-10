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

  rows;
  columns;

  isLoading = false;

  // rows = [
  //   { name: 'Austin', gender: 'Male', company: 'Swimlane' },
  //   { name: 'Dany', gender: 'Male', company: 'KFC' },
  //   { name: 'Molly', gender: 'Female', company: 'Burger King' }
  // ];
  // columns = [{ prop: 'name' }, { name: 'Gender' }, { name: 'Company' }];

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
      // this.columns = [
      //   { prop: 'userSurname', name: 'Surname'},
      //   { prop: 'userName', name: 'First Name'},
      //   { prop: 'userSchoolId', name: 'School ID'}, 
      //   { prop: 'action', name: 'Action'},
      //   { prop: 'createdAt', name: 'Timestamp'}
      // ];
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
