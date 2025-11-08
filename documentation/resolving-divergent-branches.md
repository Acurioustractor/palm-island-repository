# Resolving Divergent Branches in Git

This guide explains how to resolve the "divergent branches" error in Git and provides strategies for keeping your local branches synchronized with remote branches.

## Understanding the Error

When you run `git pull` and see this error:

```
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
```

It means your local branch and the remote branch have diverged - they have different commit histories that need to be reconciled.

## Common Scenarios

### Scenario 1: Local Branch Is Behind Remote

This is the most common case where:
- Your local branch is still at an older commit
- The remote branch has moved forward with new commits
- There are no local changes that conflict with the remote

**Solution:**

```bash
# Configure git to use merge strategy (one-time setup)
git config pull.rebase false

# Switch to the divergent branch
git checkout <branch-name>

# Reset your local branch to match the remote exactly
git reset --hard origin/<branch-name>
```

**Note:** This will discard any local commits. If you have local changes you want to keep, see Scenario 2.

### Scenario 2: Both Local and Remote Have New Commits

This occurs when:
- You've made commits locally
- Someone else has pushed commits to the remote
- Both sets of commits need to be preserved

**Solution A: Merge Strategy**

```bash
# Configure git to use merge (creates a merge commit)
git config pull.rebase false

# Pull and merge
git pull origin <branch-name>

# Resolve any conflicts if they arise
# Then commit the merge
```

**Solution B: Rebase Strategy** (Cleaner history)

```bash
# Configure git to use rebase (replays your commits on top)
git config pull.rebase true

# Pull with rebase
git pull origin <branch-name>

# Resolve any conflicts if they arise
# Continue the rebase with: git rebase --continue
```

### Scenario 3: Fast-Forward Only

For situations where you want to ensure no merge commits are created:

```bash
# Configure git to only allow fast-forward pulls
git config pull.ff only

# Pull (will fail if fast-forward is not possible)
git pull origin <branch-name>
```

## Best Practices

### 1. Regular Synchronization

Pull changes frequently to avoid large divergences:

```bash
# Before starting new work
git fetch origin
git pull origin <branch-name>
```

### 2. Set Global Preferences

Choose your preferred strategy globally:

```bash
# For merge strategy (preserves exact history)
git config --global pull.rebase false

# For rebase strategy (cleaner, linear history)
git config --global pull.rebase true

# For fast-forward only (most conservative)
git config --global pull.ff only
```

### 3. Check Before Pulling

Always check the status before pulling:

```bash
# See what's changed locally
git status

# See what's different from remote
git fetch origin
git log --oneline --graph --decorate HEAD origin/<branch-name>

# See how many commits you're ahead/behind
git status -sb
```

### 4. Use the Custom Pull Script

For this repository, use the provided `palmpull` script which handles common scenarios:

```bash
palmpull
```

## Recovering from Mistakes

### If You Accidentally Reset the Wrong Branch

```bash
# View reflog to find the commit you were at
git reflog

# Reset back to that commit
git reset --hard HEAD@{n}  # where n is the reflog entry number
```

### If You Have Uncommitted Changes

```bash
# Stash your changes before pulling
git stash save "Work in progress"

# Pull the changes
git pull origin <branch-name>

# Restore your changes
git stash pop
```

## Quick Reference

| Situation | Command | Effect |
|-----------|---------|--------|
| Local behind, no local changes | `git reset --hard origin/<branch>` | Fast sync to remote |
| Local ahead and behind | `git pull --no-rebase` | Merge remote into local |
| Local ahead and behind | `git pull --rebase` | Rebase local on remote |
| Want to see differences | `git fetch && git log origin/<branch>` | Compare without changing |
| Save work before pulling | `git stash && git pull` | Stash, pull, pop |

## Resolution for This Repository

For the Palm Island repository, the divergent branch issue was resolved by:

1. Configuring merge strategy:
   ```bash
   git config pull.rebase false
   ```

2. Switching to the divergent branch:
   ```bash
   git checkout claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV
   ```

3. Resetting to match remote (no local changes to preserve):
   ```bash
   git reset --hard origin/claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV
   ```

This brought the local branch from commit `ba7a1ee` (initial commit) to `9abaaa6` (latest remote commit), synchronizing 27 commits worth of changes.

## Additional Resources

- [Git Documentation: git-pull](https://git-scm.com/docs/git-pull)
- [Git Documentation: git-rebase](https://git-scm.com/docs/git-rebase)
- [Atlassian Git Tutorial: Merging vs Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)

---

**Last Updated:** 2025-11-08
**Resolved By:** Claude AI Assistant
