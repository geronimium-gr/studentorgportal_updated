import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

//Firebase
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireStorageModule } from "@angular/fire/storage";


import { environment } from "../environments/environment.prod";

//Auth Service
import { AuthService } from "./services/auth.service";

//Auth Guard
import { AuthGuard } from "./guards/auth.guard";

//Popover and Modals
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { NewOrgComponent } from './orgs/new-org/new-org.component';
import { UpdateOrgComponent } from './orgs/update-org/update-org.component';
import { AddPostComponent } from './posts/add-post/add-post.component';
import { AddEventsComponent } from './eventz/add-events/add-events.component';
import { FilestorageComponent } from './files-storage/filestorage/filestorage.component';
import { UpdatePostComponent } from './posts/update-post/update-post.component';
import { OptionButtonComponent } from './posts/option-button/option-button.component';
import { UpdateEventsComponent } from './eventz/update-events/update-events.component';
import { FlagsModuleComponent } from './flags/flags-module/flags-module.component';
import { EventPendingComponent } from './event-pending/event-pending/event-pending.component';
import { CourseComponent } from './courseList/course/course.component';
import { ChatsComponent } from './chat/chats/chats.component';
import { NotificationComponent } from './notifs/notification/notification.component';
import { MembersListComponent } from './members/members-list/members-list.component';
import { ViewNotificationComponent } from './notifs/view-notification/view-notification.component';
import { AddPollComponent } from './polls/add-poll/add-poll.component';
import { EditMembersComponent } from './members/edit-members/edit-members.component';
import { UpdateCoverComponent } from './orgs/update-cover/update-cover.component';
import { AboutComponent } from './orgs/about/about.component';

//Shared Module
import { PickerModule } from './picker/picker.module';
import { CommentSectionComponent } from './comments/comment-section/comment-section.component';
import { AutosizeModule } from "ngx-autosize";


@NgModule({
  declarations: [
    AppComponent,
    UpdatePasswordComponent,
    UpdateProfileComponent,
    NewOrgComponent,
    UpdateOrgComponent,
    AddPostComponent,
    UpdatePostComponent,
    AddEventsComponent,
    UpdateEventsComponent,
    FilestorageComponent,
    OptionButtonComponent,
    CommentSectionComponent,
    CourseComponent,
    FlagsModuleComponent,
    EventPendingComponent,
    ChatsComponent,
    NotificationComponent,
    ViewNotificationComponent,
    MembersListComponent,
    AddPollComponent,
    EditMembersComponent,
    UpdateCoverComponent,
    AboutComponent
  ],
  entryComponents: [
    UpdatePasswordComponent,
    UpdateProfileComponent,
    NewOrgComponent,
    UpdateOrgComponent,
    AddPostComponent,
    UpdatePostComponent,
    AddEventsComponent,
    UpdateEventsComponent,
    FilestorageComponent,
    OptionButtonComponent,
    CommentSectionComponent,
    CourseComponent,
    FlagsModuleComponent,
    EventPendingComponent,
    ChatsComponent,
    NotificationComponent,
    ViewNotificationComponent,
    MembersListComponent,
    AddPollComponent,
    EditMembersComponent,
    UpdateCoverComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    PickerModule,
    AutosizeModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
