"use client"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and system preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">Account Email</p>
                <p className="text-sm text-muted-foreground">admin@payroll.com</p>
              </div>
              <button className="px-4 py-2 text-primary text-sm font-medium hover:underline">Change</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <button className="px-4 py-2 text-primary text-sm font-medium hover:underline">Update</button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about payroll processing</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="checkbox" className="w-4 h-4" />
              <div>
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Get summary reports every Monday</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
