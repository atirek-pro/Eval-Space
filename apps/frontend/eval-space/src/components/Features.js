// features-2x2 as two screens (.g2): row 1 the h2 and two cards, row 2 the next two. Dark page: each
// card keeps its box and runs its panel flush (x.ai's cards); the panels share one still ground
// (gradient-mesh), one seed each, on the lit palettes. The diagram's pulse is the group's one loop,
// so every fragment holds its finished picture and plays while the pointer rests on its card.
import Diagram from "@/components/Diagram";

const lanes = {
  layout: "lanes",
  alt: "One test suite runs on three models at once, and each gets its own score.",
  input: { label: "Suite", icon: "ui:list-checks", sub: "1,240 tasks" },
  core: { label: "Eval Space" },
  lanes: [
    { label: "Agent v14", icon: "ui:bot", done: true, sub: "92%" },
    { label: "Agent v13", icon: "ui:bot", done: true, sub: "88%" },
    { label: "Tools v7", icon: "ui:bot", done: true, sub: "81%" },
  ],
};

const box = (
  <span className="ui-check__box"><svg viewBox="0 0 16 16"><path d="m4.5 8.2 2.3 2.3 4.7-5" /></svg></span>
);

function Card({ title, text, fx, children }) {
  return (
    <article className="card card--row span-6 m-nolift">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="panel panel--flush" data-fx="gradient-mesh" {...fx}>
        {children}
      </div>
    </article>
  );
}

const sand = '{"bg":"#d9ccb7","surface":"#e9e0d2","ink":"#2a2622","accent":"#a8794a"}';
const sky = '{"bg":"#c6d3df","surface":"#d6e0e9","ink":"#25303a","accent":"#3f6a92"}';
const sage = '{"bg":"#cdd6c6","surface":"#dce3d6","ink":"#262d24","accent":"#6c8e63"}';
const still = '{"drift":0,"speed":0}';

export default function Features() {
  return (
    <section className="section g2" id="features" aria-labelledby="features-h">
      <div className="wrap">
        <div className="group">
          <div className="section-head">
            <h2 id="features-h">
              What Eval Space measures. <span className="muted">Accuracy, latency, cost and safety, per task.</span>
            </h2>
          </div>
          <div className="grid">
            <Card
              title="Compares models side by side"
              text="One suite runs on every model you list, with accuracy, latency and cost per task."
              fx={{ "data-fx-seed": "21", "data-fx-palette": sand, "data-fx-params": still }}
            >
              <Diagram spec={lanes} />
            </Card>
            <Card
              title="Tests agents end to end"
              text="Tool calls, retries and multi-step tasks run in a real harness, each step scored."
              fx={{ "data-fx-seed": "34", "data-fx-palette": sky, "data-fx-params": still }}
            >
              <div className="stage stage--fade-b">
                <div className="at-rise fit" style={{ "--fit-max": "340px", "--ax": "max(24px, 50% - 170px)", "--ay": "48px", "--ay-sm": "24px" }}>
                  <div className="ui ui-panel ui-checks" data-ui="checklist">
                    <div className="ui-checks__head">
                      <div className="ui-title">Task 118: refund an order</div>
                      <span className="ui-spacer"></span>
                      <div className="ui-meta" data-checks-count>2 of 5</div>
                    </div>
                    <div className="ui-checks__bar"><i data-checks-bar style={{ "--k": 0.4 }}></i></div>
                    <ul className="ui-checks__list">
                      <li className="ui-check is-done">{box}<span className="ui-check__label">Read order 4468</span></li>
                      <li className="ui-check is-done">{box}<span className="ui-check__label">Call the refunds tool</span></li>
                      <li className="ui-check">{box}<span className="ui-check__label">Check the amount is right</span></li>
                      <li className="ui-check">{box}<span className="ui-check__label">Write the reply</span></li>
                      <li className="ui-check">{box}<span className="ui-check__label">Close the ticket</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="grid">
          <Card
            title="Scores open-ended answers"
            text="Exact-match, heuristic and model-graded scoring combine into one score you can check."
            fx={{ "data-fx-seed": "47", "data-fx-palette": sage, "data-fx-params": still }}
          >
            <div className="stage stage--fade-b">
              <div className="at-right" style={{ "--ax": "32px", "--ay": "56px" }}>
                <div className="ui ui-panel ui-toggles" data-ui="toggles">
                  <div className="ui-head">
                    <svg className="ui-icon ui-toggles__ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13V8m5 5V3m5 10V6" /></svg>
                    <div className="ui-title">Scoring for summariser v5</div>
                    <span className="ui-spacer"></span>
                    <div className="ui-meta" data-tg-count>4 of 5 on</div>
                  </div>
                  <ul className="ui-toggles__list">
                    {[
                      ["Exact match on order IDs", "Fails the answer on any mismatch", true],
                      ["Model-graded rubric", "Five criteria, scored 1 to 5", true],
                      ["JSON schema check", "For answers sent to tools", true],
                      ["Human review below 0.6", "Sends weak scores to your team", false],
                      ["Count refusals as fails", "Unless the rubric allows them", true],
                    ].map(([label, sub, on]) => (
                      <li className="ui-tg" key={label}>
                        <span className="ui-tg__text"><span className="ui-tg__label">{label}</span><span className="ui-tg__sub">{sub}</span></span>
                        <button className={`ui-switch${on ? " is-on" : ""}`} type="button" role="switch" aria-checked={on} aria-label={label} tabIndex={-1}><i></i></button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
          <Card
            title="Catches regressions before release"
            text="Every run is versioned, so a drop shows against the last release."
            fx={{ "data-fx-seed": "58", "data-fx-palette": sand, "data-fx-params": still }}
          >
            <div className="stage stage--fade-b">
              <div className="at-corner" style={{ "--ax": "24px", "--ay": "40px" }}>
                <div className="ui ui-panel ui-stat" data-ui="stat" data-from="88" data-to="85" data-suffix="%" data-values="82,84,83,86,85,87,86,88,87,89,88,89,88,85" data-prev="80,82,81,83,84,85,84,86,85,86,87,88,88,88">
                  <div className="ui-stat__head">
                    <div className="ui-stat__top">
                      <span className="ui-stat__label">Pass rate, tool-use v7</span>
                      <span className="ui-stat__range">Last 14 runs<svg className="ui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 6.5 3.5 3.5 3.5-3.5" /></svg></span>
                    </div>
                    <div className="ui-stat__line">
                      <span className="ui-stat__num" data-stat-num>85%</span>
                      <span className="ui-chip ui-chip--plain ui-stat__delta"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2.5v7M3 6.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>3 pts</span>
                      <span className="ui-stat__sub">vs. tool-use v6</span>
                    </div>
                  </div>
                  <div className="ui-stat__chart">
                    <svg className="ui-stat__svg" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
                      <path className="ui-stat__grid" d="M0 30.5H400M0 60.5H400M0 90.5H400" />
                      <path className="ui-stat__cover" fillRule="evenodd" d="" />
                      <g className="ui-stat__bars">
                        {[22, 26, 24, 28, 27, 30, 29, 31, 30, 32, 33, 31, 34, 25].map((h, i) => (
                          <rect key={i} rx="3" x={(i * 29.14).toFixed(2)} y={(120 - h * 3).toFixed(2)} width="21.14" height={(h * 3).toFixed(2)} />
                        ))}
                      </g>
                    </svg>
                    <div className="ui-stat__axis" aria-hidden="true"><span>Run 2460</span><span>Run 2467</span><span>Today</span></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
