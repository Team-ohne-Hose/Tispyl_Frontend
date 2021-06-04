import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-show-attrib',
  templateUrl: './show-attrib.component.html',
  styleUrls: ['./show-attrib.component.css'],
})
export class ShowAttribComponent {
  constructor(private dialogRef: MatDialogRef<ShowAttribComponent, void>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  public closeMe(): void {
    this.dialogRef.close();
  }
}
