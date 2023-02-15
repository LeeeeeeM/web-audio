export default class Visualizer {
  private audioContext: AudioContext;
//   private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private analyser: AnalyserNode;
  private paused: boolean;
  private frame: number;
  private frameData: Uint8Array;
//   private gainNode: GainNode;
  constructor(audioContext: AudioContext, canvas: HTMLCanvasElement) {
    this.audioContext = audioContext;
    // this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;

    this.analyser = audioContext.createAnalyser();
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.fftSize = Math.pow(2, 11);

    this.paused = false;
    this.frame = 0;
    this.frameData = new Uint8Array(this.analyser.fftSize);
  }

  connect(source: AudioBufferSourceNode) {
    const audioContext = this.audioContext;
    console.log(audioContext);
    // const distortion = audioContext.createWaveShaper();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.2;
    // const biquadFilter = audioContext.createBiquadFilter();
    // const convolver = audioContext.createConvolver();
  
    // const echoDelay = createEchoDelayEffect(audioCtx);

    source.connect(this.analyser);
    // distortion.connect(biquadFilter);
    // biquadFilter.connect(gainNode);
    // convolver.connect(gainNode);
    // echoDelay.placeBetween(gainNode, analyser);
    this.analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }

  disconnect(source: AudioBufferSourceNode) {
    source.disconnect();
    // 必须断开analyser，否则后续链接的gainNode也会继续放大声音
    this.analyser.disconnect();
  }

  draw() {
    if (!this.paused) {
      this.analyser.getByteTimeDomainData(this.frameData);
    //   console.log(this.frameData);
      this.render(this.canvasContext, this.frameData, this.analyser.fftSize);
    }
    this.frame = requestAnimationFrame(() => {
      this.draw();
    });
  }
  pause(source: AudioBufferSourceNode) {
    this.paused = true;
    cancelAnimationFrame(this.frame);
    this.disconnect(source);
  }
  start(source: AudioBufferSourceNode) {
    this.paused = false;
    this.draw();
    this.connect(source);
  }
  render(context: CanvasRenderingContext2D, data: Uint8Array, len: number) {
    context.fillStyle = "rgb(200, 200, 200)";
    context.fillRect(0, 0, this.width, this.height);

    context.lineWidth = 2;
    context.strokeStyle = "rgb(0, 0, 0)";

    context.beginPath();

    const sliceWidth = (this.width * 1.0) / len;
    let x = 0;

    for (let i = 0; i < len; i++) {
      let v = data[i] / 128.0;
      let y = (v * this.height) / 2;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.lineTo(this.width, this.height / 2);
    context.stroke();
  }
}
