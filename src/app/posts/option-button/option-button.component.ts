import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavParams, PopoverController } from '@ionic/angular';
import { EventzService } from '../../services/eventz.service';
import { PollsService } from '../../services/polls.service';
import { UpdateEventsComponent } from '../../eventz/update-events/update-events.component';
import { PostService } from '../../services/post.service';
import { UpdatePostComponent } from '../update-post/update-post.component';

@Component({
  selector: 'app-option-button',
  templateUrl: './option-button.component.html',
  styleUrls: ['./option-button.component.scss'],
})
export class OptionButtonComponent implements OnInit, OnDestroy {

  loadedPost: any;
  indicatorEvent: any;
  loadedOrg: any;

  constructor(private navParams: NavParams,
              private popoverCtrl: PopoverController,
              private alertCtrl: AlertController,
              private postService: PostService,
              private eventService: EventzService,
              private pollService: PollsService) { }

  //Editing Post
  ngOnInit() {
    this.loadedPost = this.navParams.get('editPostId');
    this.indicatorEvent = this.navParams.get('postInd');
    this.loadedOrg = this.navParams.get('orgIds');
    console.log(this.loadedPost);
    console.log(this.indicatorEvent + this.loadedOrg);
  }

  async editPostForm(ev: any) {

    this.closePopOver();

    const popover = await this.popoverCtrl.create({
      component: UpdatePostComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editPostId: this.loadedPost,
        editOrgIds: this.loadedOrg
      }
    });
    return await popover.present();
  }

  async deletePostForm() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this post?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            this.closePopOver();
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.postService.deletePost(this.loadedPost);
            this.closePopOver();
          }
        }
      ]
    });

    await alert.present();
  }//

  async editEventForm(ev: any) {
    this.closePopOver();

    const popover = await this.popoverCtrl.create({
      component: UpdateEventsComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editEventId: this.loadedPost,
      }
    });
    return await popover.present();
  }

  async deleteEventForm() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            this.closePopOver();
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.eventService.deleteEvent(this.loadedPost);
            this.closePopOver();
          }
        }
      ]
    });

    await alert.present();

  }

  async deletePoll() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this poll?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            this.closePopOver();
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.pollService.deletePoll(this.loadedPost);
            this.closePopOver();
          }
        }
      ]
    });

    await alert.present();
  }

  closePopOver(){
    this.popoverCtrl.dismiss();
  }//

  ngOnDestroy() {
    //console.log("Destroy");
  }

}
