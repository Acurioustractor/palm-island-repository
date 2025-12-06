# Contributing Guide

## Git Workflow

This project uses a **two-branch strategy** for stability:

### Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production code | Protected - requires PR |
| `develop` | Testing/integration | Default branch for PRs |

### Development Flow

```
main (production)
  │
  └── develop (testing)
        │
        ├── feature/new-story-page
        ├── feature/media-upload
        └── fix/image-loading
```

### Creating a Feature

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "Add: description of changes"

# Push and create PR
git push -u origin feature/my-feature
```

### Pull Request Process

1. Create PR from your feature branch → `develop`
2. Ensure tests pass
3. Request review if needed
4. Merge to `develop`
5. Test on staging environment
6. When stable, create PR from `develop` → `main`

### Commit Messages

Use clear, descriptive commit messages:

```
Add: new feature or file
Update: changes to existing feature
Fix: bug fix
Remove: deleted code/files
Refactor: code restructuring
Docs: documentation changes
```

Examples:
- `Add: story filtering by category`
- `Fix: image upload timeout issue`
- `Update: navigation styling`

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Define types for props and data
- Avoid `any` type

### Components
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks

### Styling
- Use Tailwind CSS classes
- Follow the design system in `docs/archive/PICC-BRAND-STYLE-GUIDE.md`
- Mobile-first responsive design

### File Organization
```
components/
├── ui/           # Reusable UI components
├── navigation/   # Nav components
├── stories/      # Story-specific components
└── [feature]/    # Feature-specific components
```

## Testing

Before submitting a PR:

1. Run the dev server and test manually
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Test on mobile viewport
4. Verify database operations work

## Environment

- Node.js 18+ required
- Use `.env.local` for local environment variables
- Never commit secrets or API keys

## Questions?

Open an issue on GitHub or check existing documentation in `docs/`.
