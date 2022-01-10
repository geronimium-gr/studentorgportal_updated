import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavParams, PopoverController } from '@ionic/angular';
import { PollsService } from '../../services/polls.service';

@Component({
  selector: 'app-add-poll',
  templateUrl: './add-poll.component.html',
  styleUrls: ['./add-poll.component.scss'],
})
export class AddPollComponent implements OnInit {

  pollOpt: any[];
  formGroup: FormGroup;
  orgId: any;
  currentUser: any;
  userInfo: any;

  constructor(private popoverCtrl: PopoverController,
              private afs: AngularFirestore,
              private pollService: PollsService,
              private navParams: NavParams)
  {
    this.orgId = this.navParams.get("orgId");
    this.currentUser = this.navParams.get("cUser");
    this.userInfo = this.navParams.get("userInfo");

  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      pollTitle: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      pollContent: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      pollOptA: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      pollOptB: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      pollOptC: new FormControl(null, {
        updateOn: 'change'
      }),
      pollOptD: new FormControl(null, {
        updateOn: 'change'
      })
    });
  }

  addPoll() {
    if (!this.formGroup.valid) {
      console.log("Fill up.");
      return;
    }

    const pollId = this.afs.createId();
    const title = this.formGroup.value.pollTitle;
    const content = this.formGroup.value.pollContent;
    const pollA = this.formGroup.value.pollOptA;
    const pollB = this.formGroup.value.pollOptB;
    const pollC = this.formGroup.value.pollOptC;
    const pollD = this.formGroup.value.pollOptD;


    this.pollService.addPoll(pollId, title, content, pollA, pollB, pollC, pollD, this.currentUser, this.userInfo.userName, this.userInfo.userSurname, this.userInfo.userPhoto, this.orgId)
  }

  onClose() {
    this.popoverCtrl.dismiss();
  }

}
