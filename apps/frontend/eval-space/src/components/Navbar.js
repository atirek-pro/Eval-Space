// nav: one fixed, opaque bar on the page's .wrap with the four sections and the main action. On a phone
// system.js turns the bar into a full-screen sheet and flips aria-expanded on the toggle.
const links = [
  ["#features", "Features"],
  ["#about", "About"],
  ["#blog", "Blog"],
  ["#contact", "Contact us"],
];

export default function Navbar() {
  return (
    <header className="nav">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">Skip to content</a>
        <a className="nav__logo" href="#top">
          <span className="mark" data-mark="ring" aria-hidden="true"></span>Eval Space
        </a>
        <nav className="nav__links" aria-label="Main">
          {links.map(([href, label]) => (
            <div className="nav__item" key={href}><a className="nav__link" href={href}>{label}</a></div>
          ))}
        </nav>
        <div className="nav__actions">
          <a className="btn btn--primary" href="#contact">Create an account</a>
        </div>
        <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
