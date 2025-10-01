import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import './styles.css'

export const PALETTE = {
  g1:'#20B2F3', g2:'#5E73F7', g3:'#0F1730',
  white:'#FFFFFF', btnBlue:'#2F84FF'
}

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.deepvoice'
const GITHUB_RELEASE_URL = 'https://github.com/wjdwhddls/deepfake_detection_service_application/releases'
const DOWNLOAD_URL = PLAYSTORE_URL || GITHUB_RELEASE_URL

const LOGO_SRC = 'src/assets/logo_DeepVoice.png'

const Gradient = ({children}) => <span className="grad">{children}</span>

/* NAV */
function Nav(){
  return (
    <header className="nav">
      <div className="navInner">
        <a href="/" className="brand brandLogo" aria-label="너목보 홈">
          <img src={LOGO_SRC} alt="너목보 로고" />
          <span className="srOnly">DeepVoice</span>
        </a>

        <nav className="menu">
          <a href="#showcase">Product</a>
          <a href="#features">Features</a>
          <a href="#try">Demo</a>
          <a className="btnNav" href={DOWNLOAD_URL} target="_blank" rel="noreferrer">Get the app</a>
        </nav>
      </div>
    </header>
  )
}

/* INTRO HERO — 이퀄라이저를 QR~더보기 영역의 '배경'으로 배치 */
function IntroHero(){
  const qrRef = useRef(null)

  useEffect(()=>{
    if(qrRef.current) QRCode.toCanvas(qrRef.current, DOWNLOAD_URL, { width: 132 })
  },[])

  const goNext = () =>
    document.getElementById('showcase')?.scrollIntoView({ behavior:'smooth' })

  // 유틸: span 생성
  const bars = (n) => [...Array(n)].map((_,i)=><span key={i} style={{'--i': i}} />)

  return (
    <section className="introHero fullBleed">
      <div className="heroHead">
        <h1 className="heroTitle">
          DeepVoice <Gradient>Detection</Gradient>
        </h1>
        <p className="heroSub">보이스피싱을 한 발 먼저. 온디바이스 AI로 안전하게.</p>
      </div>

      {/* QR + 더보기를 한 스택으로 묶고, 그 '아래'에 EQ 배경을 깐다 */}
      <div className="ctaStack">
        {/* 🔊 BACKGROUND: 음성 이퀄라이저 */}
        <div className="eqUnder" aria-hidden="true">
          <div className="eqLine back">{bars(36)}</div>
          <div className="eqLine front">{bars(28)}</div>
        </div>

        <div className="qrCenter qrHero">
          <canvas ref={qrRef}/>
          <a className="storeBadge" href={DOWNLOAD_URL} target="_blank" rel="noreferrer">앱 받기</a>
        </div>

        <div className="moreDock">
          <button className="btnMoreFancy" onClick={goNext} aria-label="다음 섹션으로 이동">
            더보기 <span className="chev">↓</span>
          </button>
        </div>
      </div>
    </section>
  )
}

/* SHOWCASE — 진행도 + 캐러셀 + 좌우 클릭 */
function ShowcaseSticky(){
  const ref = useRef(null)
  const trackRef = useRef(null)
  const viewportRef = useRef(null)

  const [prog, setProg] = useState(0)

  const SCREENS = [
    { type: 'img', src: '/mockup.png', label: '홈' },
    { type: 'fake', label: '분석 결과' },
    { type: 'fake', label: '보호 설정' },
  ]
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const deltaX = useRef(0)

  useEffect(()=>{
    const el = ref.current; if(!el) return
    const update = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight
      const total = el.offsetHeight - vh
      const scrolled = Math.min(total, Math.max(0, -r.top))
      const p = total>0 ? scrolled/total : 0
      const clamped = Math.max(0, Math.min(1, p))
      el.style.setProperty('--p', String(clamped))
      setProg(clamped)

      if (clamped >= 0.98) document.body.classList.add('after-showcase')
      else if (window.scrollY < 12) document.body.classList.remove('after-showcase')
    }
    update()
    addEventListener('scroll', update, {passive:true})
    addEventListener('resize', update)
    return ()=>{ removeEventListener('scroll', update); removeEventListener('resize', update) }
  },[])

  const canSwipe = prog >= 0.28 && prog < 0.98

  const snapTo = (i) => {
    const N = SCREENS.length
    const next = Math.max(0, Math.min(N-1, i))
    setIndex(next)
    if (trackRef.current){
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(.2,.7,.2,1)'
      trackRef.current.style.transform = `translateX(${-100 * next}%)`
    }
  }

  const onPointerDown = (e) => {
    if(!canSwipe) return
    setDragging(true)
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    startX.current = x
    deltaX.current = 0
    if (trackRef.current){ trackRef.current.style.transition = 'none' }
  }
  const onPointerMove = (e) => {
    if(!dragging) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const dx = x - startX.current
    deltaX.current = dx
    const vw = viewportRef.current?.clientWidth || 1
    const pct = (-100 * index) + (dx / vw) * 100
    if (trackRef.current){ trackRef.current.style.transform = `translateX(${pct}%)` }
  }
  const onPointerUp = () => {
    if(!dragging) return
    setDragging(false)
    const vw = viewportRef.current?.clientWidth || 1
    const moved = Math.abs(deltaX.current) > vw * 0.18
    const dir = deltaX.current < 0 ? 1 : -1
    if (moved) snapTo(index + dir)
    else snapTo(index)
  }
  useEffect(()=>{
    const up = () => onPointerUp()
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up, {passive:true})
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  },[dragging, index])

  return (
    <section id="showcase" ref={ref} className="showcaseSticky fullBleed reveal">
      <div className="stickyWrap">
        <h2 className="tagline">DeepVoice로부터 보호하세요</h2>

        <div className="phoneStage">
          <img src={LOGO_SRC} alt="" aria-hidden="true" className="stageLogo stageLogoL" />
          <img src={LOGO_SRC} alt="" aria-hidden="true" className="stageLogo stageLogoR" />

          <div className="phoneSlim phoneScroll">
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
                      ? <img className="slideImg" src={s.src} alt={s.label || `screen ${i+1}`} />
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

            <div className="camHole" aria-hidden="true"/>
          </div>
        </div>
      </div>
    </section>
  )
}

/* FEATURES */
function Features(){
  return (
    <section id="features" className="features band band-features reveal gate-after-showcase">
      <div className="sectionHeader center reveal-up" style={{'--d':'0ms'}}>
        <p className="eyebrow">Real-time deepvoice defense</p>
        <h2>Spend less time <br/> managing <Gradient>voice risks</Gradient></h2>
        <p className="muted">통화/음성 데이터를 기기에서 분석하고, 의심 신호를 즉시 차단합니다.</p>
      </div>

      <div className="grid">
        <div className="card feature reveal-up" style={{'--d':'80ms'}}>
          <div className="featureIcon">🔒</div>
          <h3>실시간 보호</h3>
          <p>수상한 음성 감지 시 즉시 경고와 차단 가이드를 제공합니다.</p>
          <ul className="bullets"><li>위험도 스코어 & 알림</li><li>한 탭으로 종료/차단</li></ul>
        </div>
        <div className="card feature reveal-up" style={{'--d':'160ms'}}>
          <div className="featureIcon">🧠</div>
          <h3>프라이버시 우선</h3>
          <p>온디바이스 추론—개인정보는 기기 밖으로 나가지 않습니다.</p>
          <ul className="bullets"><li>서버 전송 없음</li><li>오프라인 동작</li></ul>
        </div>
        <div className="card feature reveal-up" style={{'--d':'240ms'}}>
          <div className="featureIcon">📈</div>
          <h3>반복 패턴 학습</h3>
          <p>보이스피싱 패턴을 지속 학습해 오탐을 줄이고 정확도를 향상합니다.</p>
          <ul className="bullets"><li>자동 업데이트 모델</li><li>저지연 추론(로컬)</li></ul>
        </div>
      </div>
    </section>
  )
}

/* TRY DEMO (동일) */
function TrySection(){
  const [state,setState] = useState('idle')
  const [score,setScore] = useState(0)
  const [history,setHistory] = useState([])

  async function mockDetect(){
    setState('analyzing')
    const s = Math.floor(5 + Math.random()*95)
    await new Promise(r=>setTimeout(r,1100))
    setScore(s); setState('done')
    setHistory(h => [{time:new Date().toLocaleTimeString(), score:s}, ...h].slice(0,5))
  }

  const riskText = score>=70 ? '높음' : score>=40 ? '중간' : '낮음'

  return (
    <section id="try" className="try2 band band-try reveal">
      <div className="sectionHeader center reveal-up" style={{'--d':'0ms'}}>
        <h2>휴대폰으로 간단히 <Gradient>체험</Gradient>해보세요</h2>
        <p className="muted">왼쪽 목업에서 탐지 버튼을 누르면 오른쪽 결과가 즉시 갱신됩니다.</p>
      </div>

      <div className="tryGrid">
        <div className="tryPhoneCol reveal-up" style={{'--d':'80ms'}}>
          <div className="phoneFrame black demo">
            <div className="notch"/>
            <div className="demo-screen">
              {state==='idle' && (
                <div className="demo-home">
                  <h3>DeepVoice Detection</h3>
                  <p className="muted">버튼을 눌러 테스트를 시작하세요</p>
                  <div className="row"><button className="cta" onClick={mockDetect}><span>🎤</span> DEMO DETECT</button></div>
                </div>
              )}
              {state==='analyzing' && (<div className="demo-analyzing"><div className="spinner"/><p>분석 중…</p></div>)}
              {state==='done' && (
                <div className="demo-result">
                  <div className="meter"><div className="fill" style={{'--p': score + '%'}}/><div className="center"><strong>{score}%</strong><span>fake</span></div></div>
                  <p className="resultText">{score>=50? '딥보이스 의심' : '정상 가능성 높음'}</p>
                  <div className="row"><button className="btn ghost" onClick={()=>setState('idle')}>다시</button></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="resultPanel reveal-up" style={{'--d':'160ms'}}>
          <div className="panelCard big">
            <h3>탐지 결과</h3>
            <div className="riskRow">
              <span className="riskBadge">위험도 <b>{riskText}</b></span>
              <span className="score">{score}% fake</span>
            </div>
            <p className="muted">모델 스코어가 높을수록 딥보이스 가능성이 큽니다. 통화 종료/차단을 권장합니다.</p>
          </div>

          <div className="panelCard">
            <h4>최근 테스트</h4>
            {history.length===0 ? <p className="muted small">기록 없음</p> :
              <ul className="logList">{history.map((h,i)=><li key={i}><span>{h.time}</span><b>{h.score}%</b></li>)}</ul>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App(){
  useEffect(()=>{
    const io = new IntersectionObserver((es)=>es.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('reveal-in')
    }),{threshold:.2})
    document.querySelectorAll('.reveal, .panelCard, .reveal-up').forEach(el=> io.observe(el))
    return ()=> io.disconnect()
  },[])

  return (
    <>
      <Nav/>
      <main className="page">
        <IntroHero/>
        <ShowcaseSticky/>
        <Features/>
        <TrySection/>
        <footer className="footer"><p>© {new Date().getFullYear()} DeepVoice Detection · All rights reserved.</p></footer>
      </main>
    </>
  )
}