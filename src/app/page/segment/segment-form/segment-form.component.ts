
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SegmentModel } from '../shared/segment.model';
import { UserModel } from '../../user/shared/user.model';
import { SegmentService } from '../shared/segment.service';
import { UserService } from '../../user/shared/user.service';

@Component({
  selector: 'app-segment-form',
  templateUrl: './segment-form.component.html',
  styleUrls: ['./segment-form.component.scss']
})
export class SegmentFormComponent implements OnInit {

  formResource: FormGroup;
  segment: SegmentModel = new SegmentModel();
  userLogged: UserModel = new UserModel();
  pageTitle = '';


  constructor(
    private segmentService: SegmentService,
    private userService: UserService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.active.params.subscribe(p => {
      this.getId(p['id']);
      this.createForm();
    })
  }

  async getId(uid: string): Promise<void> {
    if (uid === 'new' || typeof uid === 'undefined') {
      this.pageTitle = 'Novo Segmento';
      this.segment = new SegmentModel();
    } else {
      const result = await this.segmentService.getById(uid);
      this.segment = result.data as SegmentModel;
      this.formResource.patchValue(this.segment);
      this.pageTitle = `Segmento: ${this.segment.segmNmSegment}`;
      await this.getUserLogged();
    }
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  private createForm() {
    this.formResource = this.fb.group({
      segmNmSegment: ['', [Validators.required]],
    })
  }

  async save(): Promise<void> {
    try {
      this.segment.segmNmSegment = this.formResource.get('segmNmSegment')?.value;
      const result = await this.segmentService.save(this.segment);
      if (result.success) {
        this.router.navigateByUrl('segments');
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

}
