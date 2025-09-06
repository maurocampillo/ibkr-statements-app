# Branch Protection Configuration

To set up branch protection rules for your repository, follow these steps:

## 1. Go to Repository Settings
- Navigate to your GitHub repository
- Click on **Settings** tab
- Go to **Branches** in the left sidebar

## 2. Add Branch Protection Rule
Click **Add rule** and configure the following:

### Branch Name Pattern
```
main
```
(or `master` if that's your default branch)

### Protection Settings

#### ✅ **Require a pull request before merging**
- [x] Require approvals: **1**
- [x] Dismiss stale PR approvals when new commits are pushed
- [x] Require review from code owners (if you have a CODEOWNERS file)

#### ✅ **Require status checks to pass before merging**
- [x] Require branches to be up to date before merging

**Required status checks:**
- `Code Quality & Tests (18.x)`
- `Code Quality & Tests (20.x)`
- `PR Quality Gate`
- `Check for Breaking Changes`
- `Bundle Size Check`

#### ✅ **Require conversation resolution before merging**
- [x] All conversations on code must be resolved

#### ✅ **Require signed commits**
- [x] Require signed commits (optional but recommended)

#### ✅ **Require linear history**
- [x] Require linear history (prevents merge commits)

#### ✅ **Include administrators**
- [x] Include administrators (applies rules to admins too)

#### ✅ **Restrict pushes that create files**
- [x] Restrict pushes that create files larger than 100 MB

## 3. Additional Security Settings

### Repository Security Settings
Go to **Settings > Security & analysis** and enable:

- [x] **Dependency graph**
- [x] **Dependabot alerts**
- [x] **Dependabot security updates**
- [x] **Secret scanning**
- [x] **Push protection** (prevents committing secrets)

### Code Scanning
Go to **Security > Code scanning** and set up:

- [x] **CodeQL analysis** (GitHub's semantic code analysis)

## 4. Create CODEOWNERS File (Optional)

Create `.github/CODEOWNERS` to automatically request reviews:

```
# Global owners
* @your-username

# Frontend components
/src/components/ @frontend-team

# Configuration files
*.json @devops-team
*.yml @devops-team
*.yaml @devops-team

# Documentation
*.md @docs-team
```

## 5. Webhook Notifications (Optional)

Set up webhooks for:
- Slack/Discord notifications on PR status
- Email notifications for security alerts
- Integration with project management tools

## Example Workflow

With these settings, the typical workflow becomes:

1. **Developer creates feature branch**
2. **Developer opens PR**
3. **GitHub Actions run automatically:**
   - Code quality checks
   - Tests
   - Security scans
   - Bundle size analysis
4. **All checks must pass** ✅
5. **Code review required** 👥
6. **PR can be merged** 🎉

## Benefits

✅ **Prevents broken code** from reaching main branch
✅ **Ensures code quality** standards are met
✅ **Catches security vulnerabilities** early
✅ **Maintains consistent formatting**
✅ **Requires peer review** for all changes
✅ **Automated dependency updates** with testing
✅ **Bundle size monitoring** prevents bloat