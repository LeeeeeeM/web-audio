import { request } from './utils';
import Visualizer from './Visualizer';
import './global.less';

const audioCtx = new window.AudioContext();

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const visualizer = new Visualizer(audioCtx, canvas);

let source: AudioBufferSourceNode;

let sourceBuffer: AudioBuffer | null = null;

let offset = 0;
let startOffset = 0;

const getMusiceBuffer = async (url = 'http://127.0.0.1:9997/jiumengyichang.mp3') => {
    if (sourceBuffer) {
        return sourceBuffer;
    }
    return request({
        method: 'GET',
        url,
        responseType: 'arraybuffer'
    }).then(({ data }) => {
        return audioCtx.decodeAudioData(data);
    }).then(buffer => {
        sourceBuffer = buffer;
        return buffer;
    });
}


const fetchMusicSource = async () => {
    source = audioCtx.createBufferSource();

    const sourceBuffer = await getMusiceBuffer();
    source.buffer = sourceBuffer;

    return source;
}

const startBtn = document.getElementById('start') as HTMLButtonElement;
const stopBtn = document.getElementById('stop') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause') as HTMLButtonElement;

startBtn.disabled = false;
stopBtn.disabled = true;
pauseBtn.disabled = true;

startBtn?.addEventListener('click', async () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    pauseBtn.disabled = false;
    const source = await fetchMusicSource();
    visualizer.start(source);
    // console.log(audioCtx.currentTime);
    startOffset = audioCtx.currentTime;
    source.start(0, offset);
});

pauseBtn?.addEventListener('click', () => {
    visualizer.pause();
    startBtn.disabled = false;
    stopBtn.disabled = false;
    pauseBtn.disabled = true;
    source.stop(0);
    source.disconnect();
    // 设置下次继续的位置
    offset = offset + audioCtx.currentTime - startOffset;
});

stopBtn?.addEventListener('click', () => {
    visualizer.pause();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    pauseBtn.disabled = true;
    source.stop(0);
    source.disconnect();
    // 设置下次继续的位置
    offset = 0; 
});


