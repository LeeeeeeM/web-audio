enum DOMAIN_ENUM {
  TIME = 'time',
  FREQUENCY = 'fre',
}

export default class Visualizer {
  private audioContext: AudioContext;
  private canvasContext: CanvasRenderingContext2D;
  private source: AudioBufferSourceNode;
  private width: number;
  private height: number;
  private analyser: AnalyserNode;
  private paused: boolean;
  private frame: number;
  private frameData: Uint8Array;
  private domain: DOMAIN_ENUM;

  // 设置下次继续的位置
  private offset: number;
  // 记录距离开始时的偏移量
  private startOffset: number;

  //   private gainNode: GainNode;
  constructor(audioContext: AudioContext, canvas: HTMLCanvasElement, source: AudioBufferSourceNode) {
    this.audioContext = audioContext;
    this.canvasContext = canvas.getContext('2d')!;
    this.source = source;
    this.width = canvas.width;
    this.height = canvas.height;

    this.analyser = audioContext.createAnalyser();
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.fftSize = Math.pow(2, 11);

    this.domain = DOMAIN_ENUM.TIME;

    this.paused = false;
    this.frame = 0;
    this.frameData = new Uint8Array(this.analyser.fftSize);

    this.offset = 0;
    this.startOffset = 0;
  }

  pause() {
    this.paused = true;
    cancelAnimationFrame(this.frame);
    this.disconnect();
    this.source.stop(0);
    // 设置暂停时的偏移量
    this.offset = this.offset + this.audioContext.currentTime - this.startOffset;
  }

  start() {
    this.paused = false;
    this.draw();
    this.connect();
    this.startOffset = this.audioContext.currentTime;
    this.source.start(0, this.offset);
  }

  stop() {
    this.paused = true;
    cancelAnimationFrame(this.frame);
    this.clearVisual();
    this.disconnect();
    this.source.stop(0);
    // 清空偏移量
    this.offset = 0;
  }

  clearVisual() {
    const context = this.canvasContext;
    context.fillStyle = 'rgb(200, 200, 200)';
    context.fillRect(0, 0, this.width, this.height);
  }

  changeFreDomain() {
    this.domain = DOMAIN_ENUM.FREQUENCY;
    this.analyser.fftSize = Math.pow(2, 8);
    // 奈奎斯特定律
    this.frameData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  changeTimeDomain() {
    this.domain = DOMAIN_ENUM.TIME;
    this.analyser.fftSize = Math.pow(2, 11);
    this.frameData = new Uint8Array(this.analyser.fftSize);
  }

  connect() {
    const audioContext = this.audioContext;

    const copyBuffer = this.source.buffer;
    const newSource = audioContext.createBufferSource();
    newSource.buffer = copyBuffer;
    this.source = newSource;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.2;

    // const distortion = audioContext.createWaveShaper();
    // const biquadFilter = audioContext.createBiquadFilter();
    // const convolver = audioContext.createConvolver();
    // const echoDelay = createEchoDelayEffect(audioCtx);
    // distortion.connect(biquadFilter);
    // biquadFilter.connect(gainNode);
    // convolver.connect(gainNode);
    // echoDelay.placeBetween(gainNode, analyser);

    this.source.connect(this.analyser);
    this.analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }

  disconnect() {
    this.source.disconnect();
    // 必须断开analyser，否则后续链接的gainNode也会继续放大声音
    this.analyser.disconnect();
  }

  draw() {
    if (!this.paused) {
      if (this.domain === DOMAIN_ENUM.TIME) {
        this.drawWave();
      } else {
        this.drawFre();
      }
    }
    this.frame = requestAnimationFrame(() => {
      this.draw();
    });
  }

  drawWave() {
    this.analyser.getByteTimeDomainData(this.frameData);
    this.renderWave(this.canvasContext, this.frameData, this.analyser.fftSize);
  }

  drawFre() {
    this.analyser.getByteFrequencyData(this.frameData);
    this.renderFre(this.canvasContext, this.frameData, this.analyser.frequencyBinCount);
  }

  renderFre(context: CanvasRenderingContext2D, data: Uint8Array, len: number) {
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillRect(0, 0, this.width, this.height);

    const barWidth = (this.width / len) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < len; i++) {
      barHeight = data[i];

      context.fillStyle = 'rgb(50,50,' + (barHeight + 100) + ')';
      context.fillRect(x, this.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
  }

  renderWave(context: CanvasRenderingContext2D, data: Uint8Array, len: number) {
    context.fillStyle = 'rgb(200, 200, 200)';
    context.fillRect(0, 0, this.width, this.height);

    context.lineWidth = 2;
    context.strokeStyle = 'rgb(0, 0, 0)';

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
