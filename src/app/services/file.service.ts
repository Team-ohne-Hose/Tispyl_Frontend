import { Injectable } from '@angular/core';
import { BasicUser } from './user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponse } from '../model/APIResponse';

export interface BackendTexture {
  name: string;
  asset_file: string;
  contribution: string;
}

export interface BackendGltf {
  name: string;
  asset_file: string;
  contribution: string;
}

export interface AvailableTextures {
  orphanedAssetFiles: string[];
  missingAssetFiles: BackendTexture[];
  verifiedTextures: BackendTexture[];
}
export interface AvailableGtlfs {
  orphanedAssetFiles: string[];
  missingAssetFiles: BackendGltf[];
  verifiedGltfs: BackendGltf[];
}

export interface BackendCubeMap {
  name: string;
  texture_pos_x: BackendTexture;
  texture_pos_y: BackendTexture;
  texture_pos_z: BackendTexture;
  texture_neg_x: BackendTexture;
  texture_neg_y: BackendTexture;
  texture_neg_z: BackendTexture;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  readonly profileEndpoint = environment.endpoint + 'profile';
  readonly textureEndpoint = environment.endpoint + 'assets/texture';
  readonly modelEndpoint = environment.endpoint + 'assets/gltf';
  readonly cubeMapEndpoint = environment.endpoint + 'assets/cubemap';

  constructor(private httpClient: HttpClient) {}

  uploadProfilePicture(file: File, user: BasicUser): Observable<BasicUser> {
    return this.uploadProfilePictureByLoginName(file, user.login_name);
  }

  uploadProfilePictureByLoginName(file: File, login_name: string): Observable<BasicUser> {
    const formData: FormData = new FormData();
    formData.append('img', file, file.name);
    formData.append('login_name', login_name);

    return this.httpClient.post<APIResponse<BasicUser>>(this.profileEndpoint, formData).pipe(map((apiResponse) => apiResponse.payload));
  }

  uploadTexture(file: File, name: string, contribution: string) {
    const formData: FormData = new FormData();
    formData.append('asset', file, file.name);
    formData.append('name', name);
    formData.append('contribution', contribution);

    return this.httpClient.put<APIResponse<string>>(this.textureEndpoint, formData).pipe(map((apiResponse) => apiResponse.payload));
  }

  getAvailableTextures(): Observable<AvailableTextures> {
    return this.httpClient.get<APIResponse<AvailableTextures>>(this.textureEndpoint).pipe(map((apiResponse) => apiResponse.payload));
  }

  uploadGltf(file: File, name: string, contribution: string) {
    const formData: FormData = new FormData();
    formData.append('asset', file, file.name);
    formData.append('name', name);
    formData.append('contribution', contribution);

    return this.httpClient.put<APIResponse<string>>(this.modelEndpoint, formData).pipe(map((apiResponse) => apiResponse.payload));
  }

  getAvailableGltfs(): Observable<AvailableGtlfs> {
    return this.httpClient.get<APIResponse<AvailableGtlfs>>(this.modelEndpoint).pipe(map((apiResponse) => apiResponse.payload));
  }

  removeProfilePicture(user: BasicUser): Observable<void> {
    return this.httpClient
      .delete<APIResponse<void>>(this.profileEndpoint + `?login_name=${user.login_name}`)
      .pipe(map((apiResponse) => apiResponse.payload));
  }

  setCubeMap(cm: BackendCubeMap) {
    return this.httpClient.post<APIResponse<string>>(this.cubeMapEndpoint, cm).pipe(map((apiResponse) => apiResponse.payload));
  }

  getAvailableCubeMaps(): Observable<BackendCubeMap[]> {
    return this.httpClient.get<APIResponse<BackendCubeMap[]>>(this.cubeMapEndpoint).pipe(map((apiResponse) => apiResponse.payload));
  }

  profilePictureSource(name: string, forceUpdate = false): string {
    if (forceUpdate) {
      return this.profileEndpoint + `?login_name=${name}&x_rng=${Math.random()}`;
    } else {
      return this.profileEndpoint + `?login_name=${name}`;
    }
  }
}
