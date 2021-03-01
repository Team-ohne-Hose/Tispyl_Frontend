import { Injectable } from "@angular/core";
import { JwtResponse } from "../model/JwtToken";

@Injectable({ providedIn: 'root' })
export class JwtTokenService {

    private JwtToken: string = null;

    // decode(t) {
    //     let token: JwtResponse = null;
    //     token.raw = t;
    //     token.header = JSON.parse(window.atob(t.split('.')[0]));
    //     token.payload = JSON.parse(window.atob(t.split('.')[1]));
    //     return (token)
    //   }

    setJwtToken(token: string): void {
        this.JwtToken = token;
    }

    getJwtToken(): string {
        return this.JwtToken
    }
}