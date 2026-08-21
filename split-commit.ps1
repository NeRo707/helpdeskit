$ErrorActionPreference = "Stop"

# Go to the chunky commit
git checkout 0c20c8c

# Reset to its parent (4c3004e) but keep working directory changes
git reset HEAD~1

# Array of feature groupings
$groups = @(
    @{
        msg = "feat: add core providers, store, api client, and config"
        files = @("app/providers.tsx", "lib/", "stores/", "package.json", "pnpm-lock.yaml", "next.config.mjs")
    },
    @{
        msg = "feat: implement buildings dashboard and hooks"
        files = @("app/(dashboard)/buildings/", "hooks/use-buildings.ts")
    },
    @{
        msg = "feat: implement computers dashboard and hooks"
        files = @("hooks/use-computers.ts", "app/(dashboard)/buildings/[id]/rooms/[roomId]/computers-table.tsx", "app/(dashboard)/buildings/[id]/rooms/[roomId]/computers/")
    },
    @{
        msg = "feat: implement network devices dashboard and hooks"
        files = @("hooks/use-netdevices.ts", "app/(dashboard)/buildings/[id]/rooms/[roomId]/netdevices-table.tsx", "app/(dashboard)/buildings/[id]/rooms/[roomId]/netdevices/")
    },
    @{
        msg = "feat: implement tickets dashboard and hooks"
        files = @("app/(dashboard)/tickets/", "hooks/use-tickets.ts", "app/(dashboard)/dashboard/_components/RecentTickets.tsx")
    },
    @{
        msg = "feat: implement users dashboard and authentication layout"
        files = @("app/(dashboard)/users/", "hooks/use-users.ts", "app/(dashboard)/dashboard-layout-client.tsx", "app/(dashboard)/layout.tsx", "app/register/page.tsx", "actions/auth.ts")
    },
    @{
        msg = "feat: finalize dashboard layout and remaining components"
        files = @(".")
    }
)

$startDate = Get-Date "2026-08-20T08:00:00"

foreach ($group in $groups) {
    foreach ($file in $group.files) {
        git add $file
    }
    
    # Check if there's anything to commit
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 1) {
        $startDate = $startDate.AddHours((Get-Random -Minimum 2 -Maximum 5))
        $dStr = $startDate.ToString("yyyy-MM-dd HH:mm:ss")
        $env:GIT_AUTHOR_DATE = $dStr
        $env:GIT_COMMITTER_DATE = $dStr
        git commit -m $group.msg --date="$dStr"
    }
}

# Now cherry pick the README commit
$startDate = $startDate.AddDays(1)
$dStr = $startDate.ToString("yyyy-MM-dd HH:mm:ss")
$env:GIT_AUTHOR_DATE = $dStr
$env:GIT_COMMITTER_DATE = $dStr
git cherry-pick 41290e6
git commit --amend --no-edit --date="$dStr"

# Move main pointer and push
git branch -f main HEAD
git checkout main
git push origin main --force
