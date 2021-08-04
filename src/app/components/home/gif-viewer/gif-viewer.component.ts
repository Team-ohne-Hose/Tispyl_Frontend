import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gif-viewer',
  templateUrl: './gif-viewer.component.html',
  styleUrls: ['./gif-viewer.component.css'],
})
export class GifViewerComponent implements OnInit {
  diamond = 'https://media1.giphy.com/media/l9UZwz7fhHzkJkAqJ7/giphy.gif';
  doggy =
    'https://media0.giphy.com/media/5JEWBLv0mZDYA/giphy.gif?cid=ecf05e472c0346bcd92707d0d34358bf7af0b328676f018b&rid=giphy.gif';

  contentUrl = this.diamond;
  giphyURL = encodeURI('https://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=rainbow'); // &rating=r');
  isloading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // this.getNewGif();
  }

  getNewGif(): void {
    this.http.get(this.giphyURL).subscribe((val) => {
      this.contentUrl = val['data'].image_original_url;
    });
  }
}
