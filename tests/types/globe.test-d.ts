import type { CameraState, GlobeCommand } from '../../src/map-contract/protocol.ts';

const camera: CameraState = { center: { lng: 0, lat: 0 }, zoom: 1, bearing: 0, pitch: 0 };
void camera;
// @ts-expect-error camera center requires explicit lng/lat
const wrongCenter: CameraState = { center: [0, 0], zoom: 1, bearing: 0, pitch: 0 };
void wrongCenter;
const wrongType: GlobeCommand = {
  version: 1,
  // @ts-expect-error unknown bridge commands are not part of the protocol
  type: 'eval',
  sessionId: 'test',
  requestId: 'x',
  payload: {},
};
void wrongType;
const wrongVersion: GlobeCommand = {
  // @ts-expect-error unsupported protocol version
  version: 2,
  type: 'camera.reset',
  sessionId: 'test',
  requestId: 'x',
  payload: {},
};
void wrongVersion;
