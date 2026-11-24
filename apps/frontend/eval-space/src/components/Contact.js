// contact: the page's split, the words on the left and the form on --g-alt on the right. system.js
// checks it on submit, puts each error under its field and posts to data-endpoint once the client's
// form address is set; until then the mailto: on .example is a stand-in and no success line is shown.
export default function Contact() {
  return (
    <section className="section" id="contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="grid grid--top">
          <div className="span-5 split__text">
            <h2 id="contact-h">Contact us</h2>
            <p className="split__lead">
              Want an account, a walkthrough or help with a suite? Tell us what you test and we will get back to you.
            </p>
            <p className="t-small muted">Remote-first team, working worldwide.</p>
          </div>
          <div className="span-6 start-7">
            <form
              className="form"
              action="mailto:hello@evalspace.example"
              method="post"
              encType="text/plain"
              data-endpoint=""
              data-sent="Your message is in. We reply within one business day."
              noValidate
            >
              <div className="field">
                <label htmlFor="f-name">Full name</label>
                <input id="f-name" name="name" type="text" autoComplete="name" required aria-describedby="f-name-err" />
                <p className="field__error" id="f-name-err" hidden>Write the name we should reply to.</p>
              </div>
              <div className="field">
                <label htmlFor="f-email">Work email</label>
                <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" required aria-describedby="f-email-err" />
                <p className="field__error" id="f-email-err" hidden>Write an email address with an @, like name@company.com.</p>
              </div>
              <div className="field field--full">
                <label htmlFor="f-topic">Topic</label>
                <select id="f-topic" name="topic" defaultValue="account">
                  <option value="account">Creating an account</option>
                  <option value="demo">A walkthrough</option>
                  <option value="pricing">Pricing and plans</option>
                  <option value="support">Technical support</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Something else</option>
                </select>
              </div>
              <div className="field field--full">
                <label htmlFor="f-message">Message</label>
                <textarea id="f-message" name="message" rows={8} required aria-describedby="f-message-err"></textarea>
                <p className="field__error" id="f-message-err" hidden>Write a line about the models or agents you test.</p>
              </div>
              <div className="btn-row"><button className="btn btn--primary" type="submit">Send message</button></div>
              <p className="form__status" role="status" data-form-status=""></p>
              <p className="t-small muted">We reply within one business day.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
