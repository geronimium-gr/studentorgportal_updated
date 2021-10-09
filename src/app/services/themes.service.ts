import { Injectable, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import * as Color from "color";

@Injectable({
  providedIn: 'root'
})
export class ThemesService implements OnInit {

  constructor(@Inject(DOCUMENT)
              private document: Document
              )
  {


  }

  ngOnInit() {

  }


}


