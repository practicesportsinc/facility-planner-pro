import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { Settings, Database, Users, Download, Mail } from "lucide-react";
import { MakeWebhookSettings } from "@/components/admin/MakeWebhookSettings";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple mock authentication for demo
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <Card className="w-full max-w-md shadow-custom-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Access the administrative dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-md"
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  className="w-full p-3 border rounded-md"
                  placeholder="Enter password"
                />
              </div>
              <Button variant="hero" className="w-full" onClick={handleLogin}>
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage cost libraries, presets, and customer leads
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="costs">
              <Database className="h-4 w-4 mr-2" />
              Cost Library
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Download className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure default values and system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Currency</label>
                    <select className="w-full p-3 border rounded-md">
                      <option>USD - US Dollar</option>
                      <option>CAD - Canadian Dollar</option>
                      <option>EUR - Euro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lead Capture Mode</label>
                    <select className="w-full p-3 border rounded-md">
                      <option>Soft Gate (Show summary first)</option>
                      <option>Hard Gate (Require info immediately)</option>
                    </select>
                  </div>
                </div>
                <Button variant="default">Save Settings</Button>
              </CardContent>
            </Card>

            <MakeWebhookSettings />
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Library Management</CardTitle>
                <CardDescription>
                  Manage equipment costs, labor rates, and regional multipliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Equipment Categories</h3>
                    <Button variant="outline">Add Category</Button>
                  </div>
                  <div className="grid gap-4">
                    {['Baseball Equipment', 'Basketball Equipment', 'General Facility'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">{category}</span>
                        <div className="space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Leads</CardTitle>
                <CardDescription>
                  View and manage customer inquiries and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Recent Leads</h3>
                    <Button variant="outline">Export CSV</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'John Smith', email: 'john@example.com', date: '2024-01-15', project: 'Baseball Facility' },
                      { name: 'Sarah Johnson', email: 'sarah@example.com', date: '2024-01-14', project: 'Multi-Sport Complex' },
                      { name: 'Mike Chen', email: 'mike@example.com', date: '2024-01-13', project: 'Basketball Facility' },
                    ].map((lead, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                          <div className="text-xs text-muted-foreground">{lead.project}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{lead.date}</div>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Reports</CardTitle>
                <CardDescription>
                  Download usage statistics and analytics reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Calculator Usage Report', description: 'Step completion rates and drop-off analysis' },
                    { title: 'Lead Generation Report', description: 'Conversion rates and lead quality metrics' },
                    { title: 'Cost Library Usage', description: 'Most frequently used equipment and costs' },
                    { title: 'Regional Analysis', description: 'Usage patterns by geographic region' },
                  ].map((report) => (
                    <div key={report.title} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email templates and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notification Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border rounded-md"
                    placeholder="admin@practicesports.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Template</label>
                  <textarea 
                    className="w-full p-3 border rounded-md h-32"
                    placeholder="Thank you for using our calculator..."
                  />
                </div>
                <Button variant="default">Save Email Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;