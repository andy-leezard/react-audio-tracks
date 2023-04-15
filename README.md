# Summary

- A light-weight solution to manage audio tracks and captions in front-end web projects.
- Optimized for React projects.

# Maintenance

I am using `changeset` to make versioning easier.

```bash
pnpm changeset
```

# How it's made

```bash
pnpm add react
pnpm add -D typescript tsup @types/react @changesets/cli
git init
pnpm run lint
pnpm run build
pnpm changeset init
```