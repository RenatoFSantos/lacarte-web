import { environment } from 'src/environments/environment';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';

export class FileManager {
  name: string;
  extension: string;
  base64Data: string;
}

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss']
})
export class InputFileComponent implements OnInit, OnChanges {

  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() select = new EventEmitter();
  @Input() image: string = '';
  @Input() label: string = 'Clique para selecionar uma imagem!';

  fileCurrent: FileManager = new FileManager();
  file: any;
  localChange: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    if (!this.localChange) {
      const image = changes.image.currentValue;
      this.populatePreLoadImage(image);
    }
  }

  selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  populatePreLoadImage(image: string): void {
    if (image) {
      const ext = image.split('.');
      const isBase64 = image.indexOf('base64') > -1;
      if (isBase64) {
        this.setPictureFromCamera(image)
      } else {
        this.fileCurrent.extension = ext[1];
        this.fileCurrent.name = image;
        this.fileCurrent.base64Data = `${environment.apiPath}/storage/${image}`;
      }
    }
  }

  handleFileSelect(evt: any): void {
    const files = evt.target.files;
    const file = files[0];

    if (files && file) {
      this.localChange = true;
      this.fileCurrent.name = file.name;
      const ext = file.name.split('.');
      this.fileCurrent.extension = ext[1];

      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    } else {
      this.fileCurrent = new FileManager();
    }

  }

  _handleReaderLoaded(readerEvt: any): void {
    const binaryString = readerEvt.target.result;
    const base64TextString = btoa(binaryString); // Convert base64 in string
    this.fileCurrent.base64Data = `data:image/${this.fileCurrent.extension};base64,${base64TextString}`;
    this.select.emit(this.fileCurrent);
  }

  setPictureFromCamera(picture: string): void {
    this.fileCurrent.name = new Date().getTime().toString();
    this.fileCurrent.extension = 'jpeg';
    this.fileCurrent.base64Data = picture;
  }
}
