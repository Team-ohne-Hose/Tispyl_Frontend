import { Component } from '@angular/core';
import { MailerService } from 'src/app/services/mailer.service';
import { AppToastService } from 'src/app/services/toast.service';

export class ContactMessage {
  email: string;
  msg: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  constructor(private mailerService: MailerService, private toastService: AppToastService) {}

  onClickSubmit(contactMessage: ContactMessage): void {
    this.mailerService.submitMail(contactMessage.email, contactMessage.msg).subscribe((re) => {
      if (re.success) {
        this.toastService.show('Init', '✅ Deine Nachricht wurde erfolgreich versendet.', 'bg-success text-light', 3000);
      } else {
        this.toastService.show('Init', '🙀 Da ist etwas schief gelaufen! ', 'bg-danger text-light', 3000);
      }
    });
  }
}
