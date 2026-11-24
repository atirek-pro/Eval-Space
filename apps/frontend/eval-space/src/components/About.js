// The statement section and its dealt moment, liquid-type: the headline ripples like water where the
// pointer crosses it and settles back to crisp type (one SVG filter; plain type on touch, phones and
// under reduced motion). Why it moves: the company's one sentence is the thing to remember here.
export default function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-h">
      <div className="wrap">
        <div data-moment="liquid-type" data-moment-opts='{"strength": 1}'>
          <h2 id="about-h" className="mo-lt__type statement">One test suite, run the same way on every model</h2>
        </div>
        <div className="grid grid--top about__body">
          <p className="span-6 about__lead">
            Eval Space started because every team wrote its own scripts to test models, and nobody could
            compare the results. We built one place where models, agents and harnesses are tested the same
            way each time.
          </p>
          <ul className="span-6 start-7 about__facts">
            <li>Built by engineers who ship AI to production</li>
            <li>An open evaluation method you can repeat</li>
            <li>Works with any model and any vendor</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
