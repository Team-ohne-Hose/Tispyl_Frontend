import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AvailableGtlfs, AvailableTextures, BackendCubeMap, BackendGltf, BackendTexture, FileService } from '../../services/file.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-console',
  templateUrl: './admin-console.component.html',
  styleUrls: ['./admin-console.component.css'],
})
export class AdminConsoleComponent implements OnInit {
  _env = environment.endpoint + 'assets/static/';

  uploadResponseText = 'nothing uploaded yet';
  uploadResponseTextGltf = 'nothing uploaded yet';
  uploadResponseTextCM = 'nothing uploaded yet';

  /** Textures */
  @ViewChild('textureFileInput')
  textureFileInput: ElementRef;

  textureFile: File;
  textureName: string;
  textureContribution: string;
  orphanedTextureFiles: string[] = [];
  missingAssetFiles: BackendTexture[] = [];
  availableTextures: BackendTexture[] = [];

  /** GLTFs */
  @ViewChild('gltfFileInput')
  gltfFileInput: ElementRef;

  gltfFile: File;
  gltfName: string;
  gltfContribution: string;
  orphanedGltfFiles: string[] = [];
  missingAssetFilesGltf: BackendGltf[] = [];
  availableGltfs: BackendGltf[] = [];

  /** CubeMap */
  cm_name: string;
  cm_xpositive_img: BackendTexture;
  cm_ypositive_img: BackendTexture;
  cm_zpositive_img: BackendTexture;
  cm_xnegative_img: BackendTexture;
  cm_ynegative_img: BackendTexture;
  cm_znegative_img: BackendTexture;
  availableCubeMaps: BackendCubeMap[] = [];

  constructor(private fileManagement: FileService) {}

  ngOnInit(): void {
    this.refreshAvailableTextures();
    this.refreshAvailableModels();
    this.refreshAvailableCubemaps();
  }

  onUploadTexture(): void {
    console.log(`Uploading: ${this.textureFile.name}`, this.textureFile);
    this.uploadResponseText = 'uploading ...';
    this.fileManagement.uploadTexture(this.textureFile, this.textureName, this.textureContribution).subscribe({
      next: ((resText) => {
        this.uploadResponseText = '\u2705 ' + resText;
        console.log(resText);
        this.refreshAvailableTextures();
        this.textureFile = undefined;
        this.textureName = undefined;
        this.textureContribution = undefined;
        this.textureFileInput.nativeElement.value = '';
      }).bind(this),
      error: ((err) => {
        console.log(err);
        const unescaped = err.error.errors.map((msg) => {
          return JSON.parse(msg);
        });
        err.error.errors = unescaped;
        console.error(JSON.stringify(err, null, 2));
        this.uploadResponseText = '⚠️ Failed to upload, please check console.';
      }).bind(this),
      complete() {
        console.log('Completed');
      },
    });
  }

  onFileChanged(inp: HTMLInputElement): void {
    this.textureFile = inp.files[0];
  }

  onUploadGltf(): void {
    console.log(`Uploading: ${this.gltfFile.name}`, this.gltfFile);
    this.uploadResponseTextGltf = 'uploading ...';
    this.fileManagement.uploadGltf(this.gltfFile, this.gltfName, this.gltfContribution).subscribe({
      next: ((resText) => {
        this.uploadResponseTextGltf = '\u2705 ' + resText;
        console.log(resText);
        this.refreshAvailableModels();
        this.gltfFile = undefined;
        this.gltfName = undefined;
        this.gltfContribution = undefined;
        this.gltfFileInput.nativeElement.value = '';
      }).bind(this),
      error: ((err) => {
        console.log(err);
        const unescaped = err.error.errors.map((msg) => {
          return JSON.parse(msg);
        });
        err.error.errors = unescaped;
        console.error(JSON.stringify(err, null, 2));
        this.uploadResponseTextGltf = '⚠️ Failed to upload, please check console.';
      }).bind(this),
      complete() {
        console.log('Completed');
      },
    });
  }

  onGltfFileChanged(inp: HTMLInputElement): void {
    this.gltfFile = inp.files[0];
  }

  setCubeMap() {
    if (
      this.cm_xpositive_img !== undefined &&
      this.cm_ypositive_img !== undefined &&
      this.cm_zpositive_img !== undefined &&
      this.cm_xnegative_img !== undefined &&
      this.cm_ynegative_img !== undefined &&
      this.cm_znegative_img !== undefined
    ) {
      const cm: BackendCubeMap = {
        name: this.cm_name,
        texture_pos_x: this.cm_xpositive_img,
        texture_pos_y: this.cm_ypositive_img,
        texture_pos_z: this.cm_zpositive_img,
        texture_neg_x: this.cm_xnegative_img,
        texture_neg_y: this.cm_ynegative_img,
        texture_neg_z: this.cm_znegative_img,
      };
      this.fileManagement.setCubeMap(cm).subscribe({
        next: ((resText) => {
          this.uploadResponseTextCM = '\u2705 ' + resText;
          console.log(resText);
          this.refreshAvailableCubemaps();
        }).bind(this),
        error: ((err) => {
          console.log(err);
          const unescaped = err.error.errors.map((msg) => {
            return JSON.parse(msg);
          });
          err.error.errors = unescaped;
          console.error(JSON.stringify(err, null, 2));
          this.uploadResponseTextCM = '⚠️ Failed to upload, please check console.';
        }).bind(this),
        complete() {
          console.log('Completed');
        },
      });
    }
  }

  refreshAvailableTextures(): void {
    this.fileManagement.getAvailableTextures().subscribe((avTextures: AvailableTextures) => {
      this.availableTextures = avTextures.verifiedTextures || [];
      this.orphanedTextureFiles = avTextures.orphanedAssetFiles || [];
      this.missingAssetFiles = avTextures.missingAssetFiles || [];
    });
  }

  refreshAvailableModels(): void {
    this.fileManagement.getAvailableGltfs().subscribe((avGltfs: AvailableGtlfs) => {
      console.log(avGltfs);
      this.availableGltfs = avGltfs.verifiedGltfs || [];
      this.orphanedGltfFiles = avGltfs.orphanedAssetFiles || [];
      this.missingAssetFilesGltf = avGltfs.missingAssetFiles || [];
    });
  }

  refreshAvailableCubemaps(): void {
    this.fileManagement.getAvailableCubeMaps().subscribe((cms) => {
      this.availableCubeMaps = cms;
    });
  }
}
