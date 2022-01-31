import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, OnDestroy {

  orgId: any;
  currentUser: any;
  userInfo: any;

  //Details
  orgDesc: any;
  orgLink: any;
  orgEmail: any;
  orgByLaw: any;

  orgSub: Subscription;

  //Opening TextBox
  openDesc: boolean = false;
  openLink: boolean = false;
  openEmail: boolean = false;
  openRule: boolean = false;

  //NgModel
  desc: any;
  link: any;
  email: any;
  rule: any;


  constructor(private orgService: OrganizationService,
              private modalCtrl: ModalController,
              private navParams: NavParams,
              private alertCtrl: AlertController,
              private router: Router) 
  
  { 
    this.orgId = this.navParams.get("orgId");
    this.currentUser = this.navParams.get("cUser");
    this.userInfo = this.navParams.get("userInfo");
  }

  ngOnInit() {
    this.orgSub = this.orgService.getOrganization(this.orgId).subscribe(async org => {

      try {
        this.orgDesc = org.description;
        this.orgLink = org.orgLink;
        this.orgEmail = org.orgEmail;
        this.orgByLaw = org.byLaw;
      } catch (error) {
        this.router.navigate(['/page-not-found']);
      }
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Error Occured!',
        message: 'Something went wrong. Try again.',
        buttons: [
          {
            text: 'Back to User Page',
            handler: () => {
              this.router.navigate(['/home']);
            }
          }
        ]
      });
      alert.present();
      // loading.dismiss();
    });
  }

  openDescText() {
    this.openDesc = true;
  }

  openLinkText() {
    this.openLink = true;
  }

  openEmailText() {
    this.openEmail = true;
  }

  openLawText() {
    this.openRule = true;
  }

  closeLinkText() {
    this.openLink = false;
  }

  closeEmailText() {
    this.openEmail = false;
  }

  closeLawText() {
    this.openRule = false;
  }

  closeDescText() {
    this.openDesc = false;
  }

  addDescription() {
    this.orgService.updateAbout(this.orgId, this.desc);
    this.closeDescText();
  }

  addLink() {
    this.orgService.updateAboutLink(this.orgId, this.link);
    this.closeLinkText();
  }

  addEmail() {
    this.orgService.updateAboutEmail(this.orgId, this.email);
    this.closeEmailText();
  }

  addLaw() {
    this.orgService.updateAboutLaw(this.orgId, this.rule);
    this.closeLawText();
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.orgSub) {
      this.orgSub.unsubscribe();
    }
  }

}
