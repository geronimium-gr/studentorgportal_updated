import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavParams, PopoverController } from '@ionic/angular';
import { EventzService } from 'src/app/services/eventz.service';
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

  constructor(private navParams: NavParams,
              private popoverCtrl: PopoverController,
              private alertCtrl: AlertController,
              private postService: PostService,
              private eventService: EventzService) { }

  //Editing Post
  ngOnInit() {
    this.loadedPost = this.navParams.get('editPostId');
    this.indicatorEvent = this.navParams.get('postInd');
    console.log(this.loadedPost);
    console.log(this.indicatorEvent);
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
        editPostId: this.loadedPost
      }
    });
    return await popover.present();
  }

  async deletePostForm() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
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
      header: 'Confirm!',
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

  closePopOver(){
    this.popoverCtrl.dismiss();
  }//

  ngOnDestroy() {
    //console.log("Destroy");
  }

}
