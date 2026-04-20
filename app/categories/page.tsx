"use client";

import Link from "next/link";

const CATEGORIES = [
  {
    name: "Science & Nature",
    covers: "Biology, chemistry, physics, astronomy, genetics, ecology, geology, neuroscience",
    examples: ["Molecular Biology", "Astrophysics", "Evolutionary Biology", "Organic Chemistry"]
  },
  {
    name: "Tech & Engineering",
    covers: "Computer science, electrical engineering, mechanical, civil, bioengineering, AI/ML",
    examples: ["Machine Learning", "Computer Architecture", "Robotics", "Circuits"]
  },
  {
    name: "Math & Data",
    covers: "Pure math, statistics, data science, probability, numerical methods",
    examples: ["Abstract Algebra", "Data Science", "Probability Theory", "Real Analysis"]
  },
  {
    name: "Arts & Design",
    covers: "Literature, music, film, theater, visual art, architecture, design, dance",
    examples: ["Film History", "Music Composition", "Studio Art", "Architecture Studio"]
  },
  {
    name: "History & Culture",
    covers: "World and US history, ancient civilizations, anthropology, cultural studies, religion",
    examples: ["Ancient Rome", "Modern China", "Cultural Anthropology", "Diaspora Studies"]
  },
  {
    name: "Society & Politics",
    covers: "Political science, sociology, psychology, law, philosophy, ethics, policy, media",
    examples: ["Constitutional Law", "Social Movements", "Ethics", "International Relations"]
  },
  {
    name: "Business & Economics",
    covers: "Micro/macroeconomics, finance, accounting, entrepreneurship, marketing, strategy",
    examples: ["Game Theory", "Corporate Finance", "Entrepreneurship", "Labor Economics"]
  },
  {
    name: "Health & Environment",
    covers: "Public health, nutrition, climate, sustainability, ecology, urban planning, wellness",
    examples: ["Public Health", "Climate Change Policy", "Urban Planning", "Nutrition"]
  }
];

export default function CategoriesPage() {
  return (
    <>
      <style jsx global>{`
        :root{--navy:#002855;--gold:#fdb515;--gold-dim:#c98e00;--cream:#f8f5ef;--text:#1a1612;--muted:#6b6356;--border:rgba(0,40,85,0.14);--font-display:var(--font-fraunces),Georgia,serif;--font-body:var(--font-dm-sans),system-ui,sans-serif;--font-mono:var(--font-dm-mono),monospace;--radius-sm:6px;--radius-md:12px;--radius-pill:999px;}
        *{box-sizing:border-box}
        body{background:var(--cream);color:var(--text);font-family:var(--font-body);margin:0}
        .cat-root{min-height:100vh;display:flex;flex-direction:column}
        .cat-nav{display:flex;align-items:center;justify-content:space-between;padding:1.125rem 2.5rem;border-bottom:1px solid var(--border);background:var(--cream);position:sticky;top:0;z-index:10}
        .logo{display:flex;align-items:center;gap:.5rem;text-decoration:none}.logo-mark{width:32px;height:32px;background:var(--navy);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center}.logo-wordmark{font-weight:500;font-size:1rem;color:var(--navy);letter-spacing:-.01em}
        .back-link{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.06em;color:var(--muted);text-decoration:none;border:1px solid var(--border);border-radius:var(--radius-pill);padding:.3rem .85rem}
        .back-link:hover{color:var(--navy);border-color:rgba(0,40,85,.35)}
        .cat-main{flex:1;max-width:760px;width:100%;margin:0 auto;padding:3rem 2rem 6rem}
        .cat-eyebrow{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:1.25rem}
        .cat-title{font-family:var(--font-display);font-size:clamp(2.2rem,5vw,3rem);font-weight:300;line-height:1.1;color:var(--navy);letter-spacing:-.02em;margin-bottom:.75rem}
        .cat-subtitle{font-family:var(--font-display);font-size:clamp(1.1rem,2.5vw,1.35rem);font-weight:300;font-style:italic;color:var(--gold-dim);margin-bottom:1.5rem}
        .cat-desc{font-size:.95rem;line-height:1.75;color:var(--muted);max-width:580px;margin-bottom:3rem}
        .cat-table{width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden}
        .cat-table thead{background:var(--navy)}
        .cat-table thead th{font-family:var(--font-mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);padding:.85rem 1.25rem;text-align:left;font-weight:400}
        .cat-table tbody tr{border-top:1px solid var(--border)}
        .cat-table tbody tr:nth-child(even){background:rgba(0,40,85,.025)}
        .cat-table tbody td{padding:.95rem 1.25rem;vertical-align:top;font-size:.875rem;line-height:1.6;color:var(--text)}
        .cat-table td:first-child{font-family:var(--font-mono);font-size:.78rem;font-weight:400;color:var(--navy);white-space:nowrap}
        .cat-table td.covers{color:var(--muted)}
        .example-list{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem}
        .example-pill{font-family:var(--font-mono);font-size:.62rem;color:var(--muted);background:var(--cream);border:1px solid var(--border);border-radius:var(--radius-pill);padding:.18rem .55rem}
        .cat-footer{border-top:1px solid var(--border);padding:1.25rem 2.5rem;display:flex;justify-content:space-between;background:var(--cream)}
        .footer-note{font-family:var(--font-mono);font-size:.65rem;color:var(--muted)}
      `}</style>
      <div className="cat-root">
        <nav className="cat-nav">
          <Link href="/" className="logo">
            <div className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <text x="2" y="13" fontFamily="Georgia" fontSize="12" fontWeight="bold" fill="#FDB515">CH</text>
              </svg>
            </div>
            <span className="logo-wordmark">ClassHop</span>
          </Link>
          <Link href="/" className="back-link">← Back to discover</Link>
        </nav>

        <main className="cat-main">
          <p className="cat-eyebrow">Interest categories</p>
          <h1 className="cat-title">What are you curious about?</h1>
          <p className="cat-subtitle">Eight buckets. Thousands of classes.</p>
          <p className="cat-desc">
            Each interest tag maps to a cluster of related departments and topics at Berkeley.
            Use them on the discover page to narrow your search — or leave them blank to see everything happening right now.
          </p>

          <table className="cat-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Covers</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <tr key={cat.name}>
                  <td>{cat.name}</td>
                  <td className="covers">
                    {cat.covers}
                    <div className="example-list">
                      {cat.examples.map((ex) => (
                        <span key={ex} className="example-pill">{ex}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        <footer className="cat-footer">
          <span className="footer-note">ClassHop · UC Berkeley</span>
          <span className="footer-note">Tags are inferred — some courses may span multiple categories.</span>
        </footer>
      </div>
    </>
  );
}
