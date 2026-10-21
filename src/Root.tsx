// Registre des compositions. Chaque vidéo/animation rendue par Remotion doit
// être déclarée ici via une balise <Composition>.
//
// Pour ajouter une nouvelle vidéo :
//   1. Créer un dossier dans src/compositions/<NomDeLaVideo>/
//   2. Y exporter un composant React
//   3. L'enregistrer ci-dessous avec un id unique
import './index.css';
import {Composition} from 'remotion';
import {HelloWorld} from './compositions/HelloWorld/HelloWorld';
import {RadarIntro} from './compositions/RadarIntro/RadarIntro';
import {MarqueeMotion} from './compositions/MarqueeMotion/MarqueeMotion';
import {VyraStyleFrames} from './compositions/VyraTeaser/StyleFrames';
import {VyraTeaser} from './compositions/VyraTeaser/VyraTeaser';
import {DURATION as VYRA_DURATION} from './compositions/VyraTeaser/edit';
import {VyraFeedPost} from './compositions/VyraTeaser/FeedPost';
import {VyraClub} from './compositions/VyraClub/VyraClub';
import {DURATION as VYRA_CLUB_DURATION} from './compositions/VyraClub/theme';

export const Root = () => {
  return (
    <>
      {/* === VYRA — « La Porte », teaser de lancement (30 s, Reels) === */}
      <Composition
        id="VyraTeaser"
        component={VyraTeaser}
        durationInFrames={VYRA_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* === VYRA — « La Porte », image de fil 4:5 (les portes du château) === */}
      <Composition
        id="VyraFeedPost"
        component={VyraFeedPost}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{}}
      />

      {/* === VYRA — « La Porte », images de style (f0 le seuil, f1 le drop, f2 la signature) === */}
      <Composition
        id="VyraTeaser-StyleFrames"
        component={VyraStyleFrames}
        durationInFrames={3}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* === VYRA — « Chaque table a une vue », vidéo pro pour les clubs (30 s, Reels, Lumen Club démo) === */}
      <Composition
        id="VyraClub"
        component={VyraClub}
        durationInFrames={VYRA_CLUB_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{title: 'Bonjour Remotion'}}
      />

      {/* === Radar Studio — Motion Intro (~20s) === */}
      <Composition
        id="RadarIntro"
        component={RadarIntro}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* === Radar Studio — Marquee Motion (40s · 8 blocs) === */}
      <Composition
        id="MarqueeMotion"
        component={MarqueeMotion}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
