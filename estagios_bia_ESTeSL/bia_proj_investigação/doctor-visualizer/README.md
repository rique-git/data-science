# Clinical Motion Dashboard

A Vercel-ready Next.js application for doctors to input patient measurements and immediately visualize:

- Joint comparison (Tornozelo, Joelho, Anca)
- Hip gait phases across the clinical cycle
- Progress indicator showing how much post-intervention data approaches the normal profile

The baseline values are preloaded from the notebook objective in `bia_proj_investigação/test.ipynb`.

## Run locally

Requirements:

- Node.js 18.17+ (recommended: Node 20 LTS)

1. Install dependencies:

   npm install

2. Start development mode:

   npm run dev

3. Open http://localhost:3000

## Deploy on Vercel

1. Push this folder to a Git repository.
2. In Vercel, click Add New Project.
3. Import the repository and set the root directory to:

   bia_proj_investigação/doctor-visualizer

4. Keep framework as Next.js and deploy.

No extra environment variables are required.
