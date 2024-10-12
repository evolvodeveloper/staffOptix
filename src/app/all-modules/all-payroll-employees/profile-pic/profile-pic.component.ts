import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-pic',
  templateUrl: './profile-pic.component.html',
  styleUrls: ['./profile-pic.component.scss']
})
export class ProfilePicComponent implements OnInit {
  image = false;
  emp: any = {
    fileName: null,
    fileType: null,
    image: null,
    imageByte: null,
  }
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProfilePicComponent>,
  ) { }
  ngOnInit() {
    if (this.data.employee?.fileType !== null && this.data.employee.image !== null) {
      this.emp.fileName = this.data.employee.fileName
      this.emp.fileType = this.data.employee.fileType
      this.emp.image = (this.data.employee.image)
      this.emp.imageByte = this.data.employee.imageByte
    }
    else {
      this.emp = {
        fileName: null,
        fileType: null,
        image: null,
        imageByte: null,
      }
    }
  }
  doAction(source) {
    if (source == 'save') {
      this.dialogRef.close({ event: this.emp });
    }
    else {
      this.emp = {
        fileName: this.data.employee.fileName,
        fileType: this.data.employee.fileType,
        image: (this.data.employee.image),
        imageByte: this.data.employee.imageByte
      }
    }
    this.dialogRef.close({ event: this.emp });


  }
  remove() {
    this.emp = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    }
    this.dialogRef.close({ event: this.emp })
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      const extension = event.target.files[0]?.type;
      this.emp.fileType = extension.replace('image/', '');
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.emp.image = event.target.result;
        const base64_data = this.emp.image.split(',')[1]

        this.emp.imageByte = base64_data

        //   this.emp.image.replace(
        //   /^data:image\/\w+;base64,/,
        //   ''
        // );
      };
      // }
    }

  }
}
