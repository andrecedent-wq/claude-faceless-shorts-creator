import React from 'react';
import { Gta6Clip } from './Gta6Clip';

export const compositionConfig = {
  id: 'Gta6ClipB',
  durationInSeconds: 63,
  fps: 30,
  width: 1080,
  height: 1920,
};

const Gta6ClipB: React.FC = () => <Gta6Clip src="projects/gta6/srcB.mp4" daysLeft={10} endLines={['PRE-LOAD NOV 12', 'LAUNCH NOV 19']} />;

export default Gta6ClipB;
