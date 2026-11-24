// The dealt hero: collage (assets/layout/hero-collage.html). Text on span-5; on span-6 start-7 the
// product's leaderboard window on the painted ground (the page's one effect), cut by the frame's right
// and bottom edges, and one small result card over its lower-left corner (layout.js plays its steps).
const rows = [
  ["1", "S4", "support-agent v14", "Agent harness · 92%", "Scored", "is-done", "4m"],
  ["2", "S3", "support-agent v13", "Agent harness · 88%", "Scored", "is-done", "2h"],
  ["3", "RS", "rag-search v3", "Retrieval · 412 questions", "Queued", "", "1m"],
  ["4", "TU", "tool-use v7", "Tool use · 380 tasks", "Queued", "", "1m"],
  ["5", "PC", "policy-check v2", "Red-team · 48%", "Regressed", "is-you", "9m"],
  ["3", "SM", "summariser v5", "Model-graded · 600 answers", "Queued", "", "now"],
];

const arrow = (
  <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
    <path className="m-arrow__stem" d="M1 6h8" />
    <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
  </svg>
);

export default function Hero() {
  return (
    <section className="hero hero--collage" data-enter="" aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text grid hero__grid">
          <div className="hero__text span-5">
            <h1 id="hero-h">Evaluation platform for LLMs and AI agents</h1>
            <p className="hero__lead">
              Run one test suite across every model and agent harness, score each answer and see which
              release regressed before it ships. Starts with 50+ ready-made benchmarks.
            </p>
            <div className="btn-row">
              <a className="btn btn--primary" href="#contact">Create an account{arrow}</a>
              <a className="btn btn--secondary" href="#features">See the features</a>
            </div>
            <p className="hero__proof">Works with any model vendor. Every run is versioned.</p>
          </div>
          <div
            className="hero__art span-6 start-7"
            data-fx="painterly-landscape"
            data-fx-seed="7"
            data-fx-palette='{"bg":"#a3b0b6","accent":"#c49a6c"}'
            data-fx-params='{"blur":1,"brush":0.35,"slope":0,"hillY":0.3,"horizon":0.62,"drift":0,"speed":0}'
            role="img"
            aria-label="The Eval Space leaderboard: support-agent v14 scores 92% on the agent harness, policy-check v2 has regressed to 48% on the red-team suite"
          >
            <div className="ly-piece ly-piece--main" aria-hidden="true">
              <div className="ui ui-panel ui-win" data-ui="window" data-open="Queued" data-work="Scoring" data-done="Scored" data-ui-still="">
                <div className="ui-win__bar">
                  <span className="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                  <span className="ui-win__crumb">Eval Space <i>/</i> <b>Leaderboard</b></span>
                  <span className="ui-spacer"></span>
                  <span className="ui-win__search" aria-hidden="true">
                    <svg className="ui-icon" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
                    <span className="ui-win__ph">Search</span><span className="ui-kbd">/</span>
                  </span>
                </div>
                <div className="ui-win__body">
                  <nav className="ui-win__side" aria-hidden="true">
                    <span className="ui-win__nav is-on"><svg className="ui-icon" viewBox="0 0 16 16"><path d="M3 13V8m5 5V3m5 10V6" /></svg>Scores<em>24</em></span>
                    <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>Queued<em>3</em></span>
                    <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><path d="M3 11l3-3 2.5 2.5L13 6" /></svg>Regressed<em>1</em></span>
                    <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><path d="m3.5 8.4 2.8 2.8 6.2-6.4" /></svg>Passed</span>
                    <span className="ui-win__label">Suites</span>
                    <span className="ui-win__nav"><span className="ui-win__hash">#</span>Agents</span>
                    <span className="ui-win__nav"><span className="ui-win__hash">#</span>Safety</span>
                  </nav>
                  <div className="ui-win__main">
                    <div className="ui-win__cols" aria-hidden="true"><span>Model</span><span>Suite and score</span><span>Status</span><span>Age</span></div>
                    <ul className="ui-win__rows">
                      {rows.map(([tone, ini, who, sub, st, cls, age]) => (
                        <li className="ui-win__row" data-row="" key={who}>
                          <span className="ui-avatar" data-tone={tone}>{ini}</span>
                          <span className="ui-win__who">{who}</span>
                          <span className="ui-win__sub">{sub}</span>
                          <span className={`ui-win__st ${cls}`.trim()} data-st="">{st}</span>
                          <span className="ui-win__age">{age}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="ly-piece ly-piece--note d-card" aria-hidden="true" data-ly-steps="700">
              <div className="d-card__row"><h5>Run 2481</h5><span className="d-chip" data-step="" data-step-at="3">Done</span></div>
              <div className="d-note__line" data-step=""><i>✓</i><span><b>1,240 tasks</b> scored on 4 models</span></div>
              <div className="d-note__line" data-step=""><i className="warn">!</i><span><b>3 regressions</b> against v13</span></div>
              <div className="d-note__line" data-step=""><i>✓</i><span>Report sent at <b>16:02</b></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
