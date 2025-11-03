# GitHub Actions + Vercel Deployment Setup Guide

This guide will help you set up automatic testing and deployment to Vercel using GitHub Actions.

## 🚀 Quick Start

### Step 1: Create a Vercel Account & Project

1. Go to [vercel.com](https://vercel.com) and sign up (free tier is fine)
2. Click "Add New Project"
3. **Import this GitHub repository** (anudelman/weather)
4. Vercel will auto-detect it's a static site
5. Click "Deploy" (this creates the project)

### Step 2: Get Your Vercel Token

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions - Weather App`
4. Set scope: Full Account
5. Copy the token (you'll only see it once!)

### Step 3: Get Your Vercel Project IDs

Run these commands in your terminal (install Vercel CLI first):

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
cd /path/to/weather
vercel link

# This creates a .vercel directory with project.json
# Open .vercel/project.json to see your IDs
cat .vercel/project.json
```

You'll see something like:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### Step 4: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/anudelman/weather
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | Your token from Step 2 | Vercel Account Settings |
| `VERCEL_ORG_ID` | `team_xxxxx` | `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `prj_xxxxx` | `.vercel/project.json` |

### Step 5: Update Deployment Workflow (if needed)

If you want to use the ORG_ID and PROJECT_ID in the workflow, update `.github/workflows/deploy.yml`:

Add these to the environment section:
```yaml
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Step 6: Test the Setup

1. Push a commit to `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the workflows run:
   - ✅ CI workflow should run tests
   - ✅ Deploy workflow should deploy to Vercel

## 🔧 How It Works

### CI Workflow (`.github/workflows/ci.yml`)
**Runs on:** Every push to `main` and `claude/**` branches, and all pull requests

**Tests:**
- ✅ Lighthouse performance (target: ≥80)
- ✅ Lighthouse accessibility (target: ≥95)
- ✅ HTML validation
- ✅ Security checks (API key detection)
- ✅ JavaScript linting

### Deploy Workflow (`.github/workflows/deploy.yml`)
**Runs on:** Push to `main` branch

**Actions:**
1. Installs Vercel CLI
2. Pulls project configuration
3. Builds the project
4. Deploys to production

**Preview Deployments:**
- Pull requests get preview deployments automatically
- Preview URLs are commented on the PR

## 📊 What You'll See

### On Every Push:
- GitHub Actions runs all tests
- Green checkmarks ✅ mean tests passed
- Red X ❌ means something failed (check logs)

### On Merge to Main:
- Tests run first
- If tests pass → deploys to Vercel production
- Your site updates automatically at: `your-project.vercel.app`

### On Pull Requests:
- Tests run
- Preview deployment created
- Preview URL posted as comment

## 🐛 Troubleshooting

### Deployment fails with "No token found"
→ Check that `VERCEL_TOKEN` secret is set correctly in GitHub

### Tests fail on Lighthouse
→ Check the artifact uploaded to see detailed Lighthouse report

### HTML validation fails
→ Check `.github/workflows/ci.yml` logs for specific HTML errors

### Vercel CLI errors
→ Make sure `.vercel/project.json` is created and project is linked

## 🔒 Security Notes

- **Never commit API keys** to git
- Vercel secrets should be set as **Environment Variables** in Vercel dashboard
- GitHub secrets are encrypted and secure
- The OpenWeather API key in `app.js` should be moved to environment variables

## 📚 Next Steps

1. Move API keys to Vercel Environment Variables
2. Set up Vercel domains (custom domain)
3. Configure Vercel preview deployments
4. Add more tests (Jest, Playwright)

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
