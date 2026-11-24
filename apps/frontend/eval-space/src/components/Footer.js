// footer.closing: the close and the footer in one last screen. Row 1 the h2 and the main action;
// row 2 the footer-dark directory and legal row.
const columns = [
  ["Product", [["#features", "Features"], ["#blog", "Blog"]]],
  ["Company", [["#about", "About"], ["#contact", "Contact us"]]],
  ["Get started", [["/signup", "Create an account"]]],
];

export default function Footer() {
  return (
    <footer className="footer closing footer--dark ground-inverse" id="close" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">Test your next model before it ships</h2>
              <p className="t-lead">We reply within one business day.</p>
            </div>
            <a className="btn btn--primary" href="/signup">
              Create an account
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="closing__links">
          <div className="grid">
            <div className="span-6 stack-4">
              <a className="nav__logo" href="#top"><span className="mark" data-mark="ring" aria-hidden="true"></span>Eval Space</a>
              <p className="footer__lede">Evaluation for AI models and agent harnesses.</p>
            </div>
            {columns.map(([title, links]) => (
              <div className="span-2 footer__col" key={title}>
                <h3>{title}</h3>
                <ul>
                  {links.map(([href, label]) => (
                    <li key={label}><a href={href}>{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer__legal">
            <span>&copy; 2026 Eval Space</span>
            <div className="socials"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
