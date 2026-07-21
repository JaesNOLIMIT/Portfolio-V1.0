# Jose Adrian Suriaga — Portfolio

A responsive static portfolio built from Jose Adrian Suriaga's resume. It has no framework, dependency installation, or build step.

## Project structure

```text
.
├── public
│   ├── index.html
│   └── assets
│       ├── documents
│       │   └── Resume_JoseAdrianSuriaga.pdf
│       ├── images
│       │   └── profile.jpg
│       └── js
│           └── constellation-background.js
├── vercel.json
└── README.md
```

## Preview locally

Run a simple local server from the repository root:

```powershell
python -m http.server 8000 --directory public
```

Then visit `http://localhost:8000`.

## Deploying to Vercel

Import the repository and keep the Vercel **Root Directory** set to the repository root. The checked-in `vercel.json` marks this as a framework-free static site, disables the build step, and serves only the contents of `public/`.

Use the following Vercel project settings:

- Framework Preset: **Other**
- Root Directory: blank (repository root)
- Build Command: blank
- Output Directory: `public`
- Install Command: blank
- Production Branch: `main`

Every push to `main` should create a deployment. No environment variables are required.

## Updating content

- Page content, inline styles, and interactions: `public/index.html`
- Profile picture and favicon: `public/assets/images/profile.jpg`
- Downloadable resume: `public/assets/documents/Resume_JoseAdrianSuriaga.pdf`
