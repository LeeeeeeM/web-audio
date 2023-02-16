import { request } from './utils';
import Visualizer from './Visualizer';
import './global.less';

const audioCtx = new window.AudioContext();

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const time = document.getElementById('time') as HTMLInputElement;
const frequency = document.getElementById('frequency') as HTMLInputElement;
time.disabled = true;
frequency.disabled = true;

const startBtn = document.getElementById('start') as HTMLButtonElement;
const stopBtn = document.getElementById('stop') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause') as HTMLButtonElement;

startBtn.disabled = true;
stopBtn.disabled = true;
pauseBtn.disabled = true;

let source: AudioBufferSourceNode;

let sourceBuffer: AudioBuffer | null = null;

const getBuffer = async (
  url = 'https://scms-test-cdaa.obs.cn-east-3.myhuaweicloud.com/music_web/jiumengyichang.mp3'
) => {
  if (sourceBuffer) {
    return sourceBuffer;
  }
  return request({
    method: 'GET',
    url,
    responseType: 'arraybuffer',
  })
    .then(({ data }) => {
      return audioCtx.decodeAudioData(data);
    })
    .then(buffer => {
      sourceBuffer = buffer;
      return buffer;
    });
};

const composeSource = async () => {
  source = audioCtx.createBufferSource();
  const sourceBuffer = await getBuffer();
  source.buffer = sourceBuffer;
  return source;
};

const main = async () => {
  source = await composeSource();

  startBtn.disabled = false;
  stopBtn.disabled = true;
  pauseBtn.disabled = true;

  time.disabled = false;
  frequency.disabled = false;

  const visualizer = new Visualizer(audioCtx, canvas, source);

  time?.addEventListener('change', (e) => {
    visualizer.changeTimeDomain();
  });

  frequency?.addEventListener('change', (e) => {
    visualizer.changeFreDomain();
  });

  startBtn?.addEventListener('click', () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    pauseBtn.disabled = false;
    visualizer.start();
  });
  
  pauseBtn?.addEventListener('click', () => {
    startBtn.disabled = false;
    stopBtn.disabled = false;
    pauseBtn.disabled = true;
    visualizer.pause();
  });
  
  stopBtn?.addEventListener('click', () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    pauseBtn.disabled = true;
    visualizer.stop();
  });
};

main();


