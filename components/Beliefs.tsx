import Statement from "./Statement";

/* Manifesto / About — offset statement + belief rows (Anveril closing pattern). */
const BELIEFS = [
  {
    title: "Evals before features",
    body: "An agent that worked once is a rumour. Every system we ship is measured against golden tasks, guardrails and cost budgets before it touches production.",
  },
  {
    title: "People stay in command",
    body: "Autonomy is earned. We design approval points, audit trails and observability so your team can see — and overrule — what every agent does.",
  },
  {
    title: "You keep the keys",
    body: "Your models, your data, your code. We leave behind documentation, playbooks and engineers who can run the system without us.",
  },
];

export default function Beliefs() {
  return (
    <section id="about" aria-label="What we believe" className="relative px-5 py-28 sm:px-7 lg:py-40">
      <div className="grid gap-12 lg:grid-cols-12">
        <p className="label text-muted lg:col-span-3">07 — What we believe</p>
        <div className="lg:col-span-7 lg:col-start-6">
          <Statement
            align="left"
            text="The next decade belongs to companies that delegate real work to software they can trust with it."
          />

          <dl className="mt-16 lg:mt-24">
            {BELIEFS.map((b) => (
              <div
                key={b.title}
                className="grid gap-3 border-t border-line py-7 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8"
              >
                <dt className="text-[15px] font-medium">{b.title}</dt>
                <dd className="text-[15px] leading-[1.55] text-muted">{b.body}</dd>
              </div>
            ))}
          </dl>
          <p className="label mt-6 text-muted">— The Pavernor team · Jakarta / Remote</p>
        </div>
      </div>
    </section>
  );
}
