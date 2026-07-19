# Jose Adrian Suriaga — Portfolio

A responsive static portfolio built from Jose Adrian Suriaga's resume. It has no build step or framework dependency, so it can be deployed directly to GitHub Pages, Netlify, Vercel, or any static web host.

## Project structure

```text
.
├── index.html
├── vercel.json
├── assets
│   ├── css
│   │   └── styles.css
│   ├── documents
│   │   └── jose-adrian-suriaga-resume.pdf
│   └── js
│       └── main.js
└── README.md
```

## Preview locally

Open `index.html` directly, or run a simple local server from this folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to Vercel

Import the repository and keep the Vercel **Root Directory** set to the repository root. The checked-in `vercel.json` marks this as a framework-free static site, disables the build step, and serves files directly from the repository root.

Every push to the connected production branch will create a new deployment. No install command, environment variables, or output-folder override is required.

## Updating content

- Page content and links: `index.html`
- Colors, layout, and responsive styling: `assets/css/styles.css`
- Menu, sticky-header state, and active-section highlighting: `assets/js/main.js`
- Downloadable resume: `assets/documents/jose-adrian-suriaga-resume.pdf`
