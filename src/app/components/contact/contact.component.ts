/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
import { MailerService } from 'src/app/services/mailer.service';
import { AppToastService } from 'src/app/services/toast.service';

export class ContactMessage {
  email: string;
  msg: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['../../../assets/css/styles.css', './contact.component.css'],
})
export class ContactComponent {
  constructor(private mailerService: MailerService, private toastService: AppToastService) {}

  onClickSubmit(contactMessage: ContactMessage) {
    const res = this.mailerService.submitMail(contactMessage.email, contactMessage.msg).subscribe((re) => {
      if (re.success)
        this.toastService.show(
          'Init',
          '✅ Deine Nachricht wurde erfolgreich versendet.',
          'bg-success text-light',
          3000
        );
      else this.toastService.show('Init', '🙀 Da ist etwas schief gelaufen! ', 'bg-danger text-light', 3000);
    });
  }
}
