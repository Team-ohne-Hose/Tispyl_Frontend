import { PlayerModel } from '../../../model/WsData';

export enum Resolution {
  res_8k,
  res_4k,
  res_2k,
  res_1k,
}

export interface Environment {
  name: string;
  resolution: Resolution;
  thumb: string;
  value: number;
}

export interface Figure {
  name: string;
  value: PlayerModel;
}

const figureList: Figure[] = [
  { name: 'Nuka Cola', value: PlayerModel.bcap_NukaCola },
  { name: 'Coca Cola', value: PlayerModel.bcap_CocaCola },
  { name: 'Developer', value: PlayerModel.bcap_Developer },
  { name: 'Jägermeister', value: PlayerModel.bcap_Jagermeister },
  { name: 'Murica', value: PlayerModel.bcap_Murica },
  { name: 'Hofbräu', value: PlayerModel.bcap_hb },
  { name: 'Soviet', value: PlayerModel.bcap_OurAnthem },
  { name: 'Schmucker', value: PlayerModel.bcap_Schmucker },
  { name: 'Anime', value: PlayerModel.bcap_Tiddies1 },
  { name: 'Cat', value: PlayerModel.bcap_cat },
  { name: 'Yoshi', value: PlayerModel.bcap_yoshi },
];

const environmentList: Environment[] = [
  { name: 'Ryfjallet (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-ryfjallet.jpg', value: 0 },
  {
    name: 'Maskonaive1 (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/mountain-maskonaive.jpg',
    value: 1,
  },
  {
    name: 'Maskonaive2 (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/mountain-maskonaive2.jpg',
    value: 2,
  },
  {
    name: 'Maskonaive3 (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/mountain-maskonaive3.jpg',
    value: 3,
  },
  { name: 'Nalovardo (1k)', resolution: Resolution.res_1k, thumb: '/cubemaps/thumbs/mountain-nalovardo.jpg', value: 4 },
  { name: 'Teide (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-teide.jpg', value: 5 },
  {
    name: 'ForbiddenCity (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/urban-forbiddenCity.jpg',
    value: 6,
  },
  { name: 'GamlaStan (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-gamlaStan.jpg', value: 7 },
  {
    name: 'Medborgarplatsen (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/urban-medborgarplatsen.jpg',
    value: 8,
  },
  { name: 'Roundabout (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-roundabout.jpg', value: 9 },
  {
    name: 'SaintLazarusChurch (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/urban-stLazarus.jpg',
    value: 10,
  },
  {
    name: 'SaintLazarusChurch2 (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/urban-stLazarus2.jpg',
    value: 11,
  },
  {
    name: 'SaintLazarusChurch3 (2k)',
    resolution: Resolution.res_2k,
    thumb: '/cubemaps/thumbs/urban-stLazarus3.jpg',
    value: 12,
  },
  {
    name: 'UnionSquare (1k)',
    resolution: Resolution.res_1k,
    thumb: '/cubemaps/thumbs/urban-unionSquare.jpg',
    value: 13,
  },
  { name: 'Bridge (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/bridge-bridge.jpg', value: 14 },
  { name: 'Bridge2 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/bridge-bridge2.jpg', value: 15 },
];

export { figureList, environmentList };
