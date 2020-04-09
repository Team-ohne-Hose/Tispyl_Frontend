import {Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gif-viewer',
  templateUrl: './gif-viewer.component.html',
  styleUrls: ['./gif-viewer.component.css']
})
export class GifViewerComponent implements OnInit {

  constructor( private http: HttpClient) { }

  @Input() languageObjects: { };
  const contentUrl = 'https://media0.giphy.com/media/5JEWBLv0mZDYA/giphy.gif?cid=ecf05e472c0346bcd92707d0d34358bf7af0b328676f018b&rid=giphy.gif';

  const giphyURL = encodeURI('https://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=rainbow');//&rating=r');



  ngOnInit(): void {
    // this.getNewGif();
  }

  getNewGif(): void {
    /*$.getJSON(this.giphyURL, json => {
      console.log(json.data);
      // Set gif as bg image
      $('#gif-wrap').css({
        'background-image': 'url("' + json.data.image_original_url + '")'
      });
    };*/
    this.http.get(this.giphyURL).subscribe((val) => {
      console.log(val.data.url);
      this.contentUrl = val.data.image_original_url;
    });
  }

}
