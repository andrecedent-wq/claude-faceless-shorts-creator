import React from 'react';
import { Gta6Clip } from './Gta6Clip';

export const compositionConfig = {
  id: 'Gta6ClipA',
  durationInSeconds: 40,
  fps: 30,
  width: 1080,
  height: 1920,
};

const Gta6ClipA: React.FC = () => <Gta6Clip src="projects/gta6/srcA.mp4" daysLeft={10} endLines={['NOV 19.', 'ARE YOU READY?']} />;

export default Gta6ClipA;
