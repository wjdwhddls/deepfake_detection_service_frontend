import React, { useEffect, useRef, useState } from 'react';
// QRCode 제거: 정적 이미지(너목보qr.jpeg) 사용
import './styles.css';

export const PALETTE = {
  g1:'#20B2F3', g2:'#5E73F7', g3:'#0F1730',
  white:'#FFFFFF', btnBlue:'#2F84FF'
};

// 🔻 Play Store 주소 제거, 외부 다운로드 링크 사용 안 함
// const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.deepvoice';
const GITHUB_RELEASE_URL = 'https://github.com/wjdwhddls/deepfake_detection_service_application/releases';
const DOWNLOAD_URL = '';// 비활성화 처리

const LOGO_SRC = './src/assets/너목보로고.png';
const QR_IMG_SRC = './public/너목보qr.jpeg'; // ✅ 사용자가 제공한 QR 이미지
const Gradient = ({children}) => <span className="grad">{children}</span>;

/* ================= 공통: QR 모달 ================= */
function QRModal({ open, onClose }){
  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : prev || '';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if(!open) return null;
  return (
    <div className="qrModal" role="dialog" aria-modal="true" aria-label="앱 설치 QR">
      <div className="qrModal__backdrop" onClick={onClose} />
      <div className="qrModal__sheet" role="document">
        <button className="qrModal__close" aria-label="닫기" onClick={onClose}>×</button>
        <div className="qrModal__body">
          <img src={QR_IMG_SRC} alt="DeepVoice 설치 QR" className="qrModal__img"/>
          <p className="qrModal__hint">휴대폰 카메라로 스캔해 설치 페이지로 이동하세요.</p>
        </div>
      </div>
    </div>
  );
}

/* ================= NAV ================= */
function Nav({ onOpenQR }){
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : prev || '';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  const close = () => setOpen(false);

  const handleOpenQR = () => { onOpenQR?.(); close(); };

  return (
    <header className="nav" role="banner">
      <div className="navInner">
        <a href="/" className="brand brandLogo" aria-label="너목보 홈" onClick={close}>
          <img src={LOGO_SRC} alt="너목보 로고" />
          <span className="srOnly">DeepVoice</span>
        </a>

        <nav className="menu" aria-label="주 메뉴">
          <a href="#showcase">Product</a>
          <a href="#features">Features</a>
          <a href="#try">Demo</a>
          {/* 🔻 외부 링크 대신 모달 열기 */}
          <button className="btnNav" type="button" onClick={handleOpenQR}>Get the app</button>
        </nav>

        <button
          className="menuToggle"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={()=>setOpen(v=>!v)}
        >
          <span className="bar" /><span className="bar" /><span className="bar" />
        </button>
      </div>

      <div id="mobile-menu" className={`mobileSheet ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        <nav className="mobileMenu" onClick={close}>
          <a href="#showcase">Product</a>
          <a href="#features">Features</a>
          <a href="#try">Demo</a>
          {/* 🔻 모바일 메뉴에서도 모달 열기 */}
          <button className="btnNav wide" type="button" onClick={handleOpenQR}>Get the app</button>
        </nav>
      </div>
    </header>
  );
}

/* =============== INTRO HERO =============== */
function IntroHero(){
  // ⛔️ QRCode.toCanvas 제거, 정적 이미지로 교체
  const goNext = () => document.getElementById('showcase')?.scrollIntoView({ behavior:'smooth' });
  const bars = (n) => [...Array(n)].map((_,i)=><span key={i} style={{'--i': i}} />);

  return (
    <section className="introHero fullBleed">
      <div className="heroHead">
        <h1 className="heroTitle">DeepVoice <Gradient>Detection</Gradient></h1>
        <p className="heroSub">보이스피싱을 한 발 먼저. 온디바이스 AI로 안전하게.</p>
      </div>

      <div className="ctaStack">
        <div className="eqUnder" aria-hidden="true">
          <div className="eqLine back">{bars(36)}</div>
          <div className="eqLine front">{bars(28)}</div>
        </div>

        {/* ✅ QR 이미지로 교체 */}
        <div className="qrCenter qrHero">
          <img src={QR_IMG_SRC} alt="DeepVoice 설치 QR" className="qrImage"/>
          {/* 🔻 하단 버튼 비활성화(링크 제거) */}
          <button className="storeBadge" type="button" disabled aria-disabled="true">앱 받기</button>
        </div>

        <div className="moreDock">
          <button className="btnMoreFancy" onClick={goNext} aria-label="다음 섹션으로 이동">
            더보기 <span className="chev">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* =============== SHOWCASE (좌우 투명 로고 포함) =============== */
function ShowcaseSticky(){
  const ref = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);

  const [prog, setProg] = useState(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const deltaX = useRef(0);

  const SCREENS = [
    { type: 'img', src: '/mainscreen.png',   label: '홈' },
    { type: 'img', src: '/resultscreen.png', label: '분석 결과' },
    { type: 'img', src: '/livedetect.png',   label: '보호 설정' },
  ];

  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const update = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const total = el.offsetHeight - vh;
      const scrolled = Math.min(total, Math.max(0, -r.top));
      const p = total>0 ? scrolled/total : 0;
      const clamped = Math.max(0, Math.min(1, p));
      el.style.setProperty('--p', String(clamped));
      setProg(clamped);

      if (clamped >= 0.98) document.body.classList.add('after-showcase');
      else if (window.scrollY < 12) document.body.classList.remove('after-showcase');
    };
    update();
    addEventListener('scroll', update, {passive:true});
    addEventListener('resize', update);
    return ()=>{ removeEventListener('scroll', update); removeEventListener('resize', update); };
  },[]);

  const canSwipe = prog >= 0.28 && prog < 0.98;
  const snapTo = (i) => {
    const N = SCREENS.length;
    const next = Math.max(0, Math.min(N-1, i));
    setIndex(next);
    if (trackRef.current){
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(.2,.7,.2,1)';
      trackRef.current.style.transform = `translateX(${-100 * next}%)`;
    }
  };

  const onPointerDown = (e) => {
    if(!canSwipe) return;
    setDragging(true);
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = x; deltaX.current = 0;
    if (trackRef.current){ trackRef.current.style.transition = 'none'; }
  };
  const onPointerMove = (e) => {
    if(!dragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const dx = x - startX.current; deltaX.current = dx;
    const vw = viewportRef.current?.clientWidth || 1;
    const pct = (-100 * index) + (dx / vw) * 100;
    if (trackRef.current){ trackRef.current.style.transform = `translateX(${pct}%)`; }
  };
  const onPointerUp = () => {
    if(!dragging) return; setDragging(false);
    const vw = viewportRef.current?.clientWidth || 1;
    const moved = Math.abs(deltaX.current) > vw * 0.18;
    const dir = deltaX.current < 0 ? 1 : -1;
    if (moved) snapTo(index + dir); else snapTo(index);
  };
  useEffect(()=>{
    const up = () => onPointerUp();
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up, {passive:true});
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  },[dragging, index]);

  return (
    <section id="showcase" ref={ref} className="showcaseSticky fullBleed reveal">
      <div className="stickyWrap">
        <h2 className="tagline">DeepVoice로부터 보호하세요</h2>

        <div className="phoneStage">
          {/* 좌/우 투명 로고 */}
          <img className="stageLogo stageLogoL" src={LOGO_SRC} alt="" aria-hidden="true" />
          <img className="stageLogo stageLogoR" src={LOGO_SRC} alt="" aria-hidden="true" />

          <div className="phoneSlim phoneScroll realistic-phone">
            <div className="island" aria-hidden="true"/>
            <div
              className={`phoneViewport ${canSwipe ? '' : 'swipe-disabled'}`}
              ref={viewportRef}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
            >
              <div
                ref={trackRef}
                className={`slidesTrack ${dragging ? 'dragging' : ''}`}
                style={{ transform:`translateX(${-100*index}%)` }}
              >
                {SCREENS.map((s, i)=>(
                  <div className="slide" key={i}>
                    {s.type==='img'
                      ? <img className="slideImg contain" src={s.src} alt={s.label || `screen ${i+1}`} />
                      : <div className="slideFake"><div className="fakeTitle">{s.label}</div></div>
                    }
                  </div>
                ))}
              </div>

              {canSwipe && (
                <>
                  <button type="button" className="edgeNav left" aria-label="이전 화면" onClick={()=>snapTo(index-1)}>‹</button>
                  <button type="button" className="edgeNav right" aria-label="다음 화면" onClick={()=>snapTo(index+1)}>›</button>
                </>
              )}

              <div className={`swipeHint ${canSwipe ? 'show' : ''}`}>좌우로 넘겨 보세요</div>
              <div className="dots">
                {SCREENS.map((_,i)=>(
                  <button key={i} aria-label={`화면 ${i+1}`} className={`dot ${i===index ? 'on' : ''}`} onClick={()=>snapTo(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== FEATURES (기존 디자인) =============== */
function Features(){
  return (
    <section id="features" className="features band band-features reveal gate-after-showcase">
      <div className="sectionHeader center reveal-up" style={{'--d':'0ms'}}>
        <p className="eyebrow">On-device deepvoice defense</p>
        <h2>
          <Gradient>녹음 파일</Gradient>과 <Gradient>통화</Gradient>에서<br/>
          DeepVoice를 바로 잡아냅니다
        </h2>
        <p className="muted">업로드한 녹음 파일과 통화 음성을 기기 내부에서 분석해 의심되면 즉시 경고합니다.</p>
      </div>

      <div className="grid">
        <div className="card feature reveal-up" style={{'--d':'80ms'}}>
          <div className="featureIcon big" aria-hidden="true">📤</div>
          <h3>녹음 파일 업로드 분석</h3>
          <p>녹음된 통화/보이스 파일을 업로드하면<br/>사기 패턴을 분석 후 <br/>1차 피해를 사전 예방합니다.</p>
          <ul className="bullets">
            <li>간편 업로드 & 즉시 분석</li>
            <li>위험도 리포트와 대응 가이드</li>
          </ul>
        </div>

        <div className="card feature reveal-up" style={{'--d':'160ms'}}>
          <div className="featureIcon big" aria-hidden="true">📞</div>
          <h3>통화 중 실시간 경고</h3>
          <p>통화 중 의심되는 목소리를 감지하면 <br/>화면 위 오버레이로 즉시 알려<br/>안전한 대응을 돕습니다.</p>
          <ul className="bullets">
            <li>저지연 경고</li>
            <li>원탭 종료/차단</li>
          </ul>
        </div>

        <div className="card feature reveal-up" style={{'--d':'240ms'}}>
          <div className="featureIcon big" aria-hidden="true">🔐</div>
          <h3>100% 온디바이스</h3>
          <p>모든 분석이 기기 안에서 이뤄져 <br/>개인정보가 외부로 전송·저장되지 않습니다.<br/>오프라인에서도 동작합니다.</p>
          <ul className="bullets">
            <li>서버 전송 없음</li>
            <li>개인정보 외부 유출 위험 최소화</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* === TRY DEMO — v2 (UI 전용) === */
function TrySection(){
  const [state,setState] = useState('idle'); // idle | picking | analyzing | done | error
  const [file,setFile]   = useState(null);
  const [score,setScore] = useState(0);
  const [history,setHistory] = useState([]);

  const realPct = Math.max(0, 100 - score);
  const tier = score>=70 ? 'high' : score>=40 ? 'med' : 'low';
  const tierText = tier==='high' ? '위험' : tier==='med' ? '주의' : '안전';
  const label = score>=50 ? '가짜 음성' : '정상 음성';

  async function onAnalyze(){
    if(!file) return;
    setState('analyzing');
    await new Promise(r=>setTimeout(r,800));
    const s = Math.floor(5 + Math.random()*95);
    setScore(s);
    setHistory(h => [{time:new Date().toLocaleTimeString(), score:s}, ...h].slice(0,6));
    setState('done');
  }

  return (
    <section id="try" className="try2 band band-try reveal">
      <div className="sectionHeader center reveal-up" style={{'--d':'0ms'}}>
        <h2>휴대폰으로 간단히 <span className="grad">체험</span>해보세요</h2>
        <p className="muted small">* 실제 제품 모델과 다른 데모 UI입니다.</p>
      </div>

      <div className="tryGrid tryGrid--tight">
        <div className="tryPhoneCol reveal-up" style={{'--d':'80ms'}}>
          <div className="phoneFrame black demo" style={{ width:'min(360px, 92vw)', aspectRatio:'9 / 19.5' }}>
            <div className="demo-screen dv-screen">
              {state==='idle' && (
                <div className="dv-home">
                  <div className="dv-hero">
                    <h3>DeepVoice Detection</h3>
                    <p>음성 위·변조를 한 눈에 확인하세요</p>
                  </div>

                  <div className="dv-upload">
                    <label className="dv-fileBtn">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={e=>{
                          const f = e.target.files?.[0] || null;
                          setFile(f); setState(f ? 'picking' : 'idle');
                        }}
                      />
                      <span>오디오 선택</span>
                    </label>

                    <button
                      className="dv-detectBtn"
                      disabled={!file}
                      onClick={onAnalyze}
                    >
                      DETECT
                    </button>

                    {file && (
                      <p className="dv-fileHint">
                        선택됨: <b>{file.name}</b>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {state==='picking' && (
                <div className="dv-home">
                  <div className="dv-hero">
                    <h3>파일 준비됨</h3>
                    <p>아래 버튼을 눌러 분석을 시작하세요.</p>
                  </div>

                  <div className="dv-upload">
                    <button className="dv-detectBtn" onClick={onAnalyze}>DETECT</button>
                    <button className="dv-ghostBtn" onClick={()=>{ setFile(null); setState('idle') }}>취소</button>
                  </div>
                </div>
              )}

              {state==='analyzing' && (
                <div className="dv-loading">
                  <div className="spinner" />
                  <p>분석 중…</p>
                </div>
              )}

              {state==='done' && (
                <div className={`dv-resultCard dv-${tier}`}>
                  <div className="dv-head">
                    <span className={`dv-badge dv-${tier}`}>{tierText}</span>
                    <span className="dv-headNote">{score}% fake</span>
                  </div>

                  <div className="dv-gauge">
                    <div className="dv-gaugeCenter">
                      <div className="dv-gaugeLabel">가짜(위·변조) 확률</div>
                      <div className="dv-gaugePct">{score}%</div>
                    </div>
                  </div>

                  <div className="dv-stats">
                    <div className="dv-tile">
                      <span className="dv-tLabel">분류 결과</span>
                      <strong className="dv-tValue">{label}</strong>
                    </div>
                    <div className="dv-tile">
                      <span className="dv-tLabel">Real 확률</span>
                      <strong className="dv-tValue">{realPct}%</strong>
                    </div>
                  </div>

                  <ul className="dv-steps">
                    <li><b>1</b> 즉시 통화 종료 및 번호 차단</li>
                    <li><b>2</b> 112 또는 1392(사기피해 신고센터) 신고</li>
                    <li><b>3</b> 송금·비밀번호 즉시 변경 등 긴급 조치</li>
                  </ul>

                  <div className="dv-btnRow">
                    <button className="dv-ghostBtn" onClick={()=>{ setFile(null); setState('idle') }}>다시</button>
                    <label className="dv-fileBtn alt">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={e=>{
                          const f = e.target.files?.[0] || null;
                          setFile(f); setState(f ? 'picking' : 'idle');
                        }}
                      />
                      <span>다른 파일 분석</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 카드 */}
        <div className="resultPanel reveal-up" style={{'--d':'160ms'}}>
          <div className="panelCard big">
            <h3>탐지 결과</h3>
            <div className="riskRow">
              <span className="riskBadge">위험도 <b>{tier==='high'?'높음':tier==='med'?'중간':'낮음'}</b></span>
              <span className="score">{score}% fake</span>
            </div>
            <p className="muted">모델 스코어가 높을수록 딥보이스 가능성이 큽니다.</p>
          </div>

          <div className="panelCard">
            <h4>최근 테스트</h4>
            {history.length===0 ? <p className="muted small">기록 없음</p> :
              <ul className="logList">{history.map((h,i)=><li key={i}><span>{h.time}</span><b>{h.score}%</b></li>)}</ul>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App(){
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(()=>{
    document.body.classList.remove('in-showcase','after-showcase');
    const io = new IntersectionObserver((es)=>es.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('reveal-in');
    }),{threshold:.2});
    document.querySelectorAll('.reveal, .panelCard, .reveal-up').forEach(el=> io.observe(el));
    return ()=> {
      io.disconnect();
      document.body.classList.remove('in-showcase','after-showcase');
    };
  },[]);

  return (
    <>
      <Nav onOpenQR={()=>setQrOpen(true)}/>
      <main className="page">
        <IntroHero/>
        <ShowcaseSticky/>
        <Features/>
        <TrySection/>
        <footer className="footer"><p>© {new Date().getFullYear()} DeepVoice Detection · All rights reserved.</p></footer>
      </main>
      {/* ✅ 전역 QR 모달 */}
      <QRModal open={qrOpen} onClose={()=>setQrOpen(false)} />
    </>
  );
}
