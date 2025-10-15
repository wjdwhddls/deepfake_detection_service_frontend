// 프런트 전용 체험 감지기: 오디오 → 16k 모노 → 프레임 통계 → 휴리스틱 점수(0~100)
export async function analyzeAudioDemo(file) {
  if (!file) throw new Error('파일이 없습니다.');

  // 1) 디코드 & 16k 리샘플
  const buf = await file.arrayBuffer();
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ac.decodeAudioData(buf.slice(0));
  const srcSr = decoded.sampleRate;
  const ch0 = decoded.getChannelData(0);
  const lengthSec = ch0.length / srcSr;

  const targetSr = 16000;
  let mono;
  if (Math.abs(srcSr - targetSr) < 1e-3) {
    mono = ch0;
  } else {
    const oac = new OfflineAudioContext(1, Math.ceil(lengthSec * targetSr), targetSr);
    const srcBuf = oac.createBuffer(1, ch0.length, srcSr);
    srcBuf.copyToChannel(ch0, 0);
    const node = oac.createBufferSource();
    node.buffer = srcBuf;
    node.connect(oac.destination);
    node.start();
    const rendered = await oac.startRendering();
    mono = rendered.getChannelData(0);
  }

  // 2) 프레임 통계 (rms, zcr, 무성율)
  const FRAME = 1024;
  const HOP = 512;

  const rmsArr = [];
  const zcrArr = [];
  let silenceCnt = 0, totalFrames = 0;

  for (let i = 0; i + FRAME <= mono.length; i += HOP) {
    totalFrames++;
    let sumsq = 0, zc = 0, prev = mono[i];
    for (let k = 0; k < FRAME; k++) {
      const v = mono[i + k] || 0;
      sumsq += v * v;
      if ((prev >= 0 && v < 0) || (prev < 0 && v >= 0)) zc++;
      prev = v;
    }
    const rms = Math.sqrt(sumsq / FRAME);
    const zcr = zc / FRAME;
    rmsArr.push(rms);
    zcrArr.push(zcr);
    if (rms < 0.01) silenceCnt++;
  }

  const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const std = a => {
    const m = mean(a);
    return Math.sqrt(mean(a.map(v => (v - m) ** 2)));
  };

  const rmsMean = mean(rmsArr);
  const rmsStd = std(rmsArr);
  const zcrMean = mean(zcrArr);
  const silenceRatio = totalFrames ? silenceCnt / totalFrames : 0;

  // 3) 체험용 점수 (완전 휴리스틱)
  //  - 에너지 변동이 너무 작고(ZCR도 낮음) → 합성 의심 ↑
  //  - 무성/유성 비율이 극단적이어도 약간 가중
  let score = 0;
  if (rmsStd < 0.01) score += 35;
  if (zcrMean < 0.02) score += 35;
  if (silenceRatio < 0.02 || silenceRatio > 0.80) score += 10;
  if (lengthSec < 1.0) score -= 10; // 너무 짧으면 신뢰 낮음
  score = Math.max(0, Math.min(100, Math.round(score)));

  const label = score >= 50 ? '딥보이스 의심' : '정상 가능성 높음';

  const details = {
    durationSec: Number(lengthSec.toFixed(2)),
    frames: totalFrames,
    rmsMean: Number(rmsMean.toFixed(4)),
    rmsStd: Number(rmsStd.toFixed(4)),
    zcrMean: Number(zcrMean.toFixed(4)),
    silenceRatio: Number(silenceRatio.toFixed(3)),
    note: '이 점수는 데모용 휴리스틱으로, 실제 모델과 결과가 다를 수 있습니다.'
  };

  // AudioContext는 사용자 상호작용 없는 상태에선 일부 브라우저가 suspend할 수 있음
  try { ac.close(); } catch {}

  return { score, label, details };
}