// Composition d'exemple — sert de modèle de référence pour les conventions du projet :
// useCurrentFrame, spring, interpolate, AbsoluteFill et classes Tailwind.
// À dupliquer puis adapter pour créer de nouvelles animations.
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Props = {
  title: string;
};

export const HelloWorld = ({title}: Props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Apparition par ressort (scale 0 -> 1).
  const scale = spring({
    frame,
    fps,
    config: {damping: 200},
  });

  // Fondu d'opacité sur les 20 premières frames.
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="bg-slate-900 items-center justify-center">
      <h1
        className="text-white text-8xl font-bold tracking-tight"
        style={{transform: `scale(${scale})`, opacity}}
      >
        {title}
      </h1>
    </AbsoluteFill>
  );
};
