import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CheckCircle, Users, BarChart3, ArrowRight, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">ExpenseFlow</h1>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Get Started
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-8 shadow-elegant">
              <Receipt className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Simplify Expense Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your expense reimbursement process with intelligent approval workflows, 
              multi-level approvals, and real-time tracking.
            </p>
            <Button onClick={() => navigate("/auth")} size="lg" className="text-lg h-12 px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need for modern expense management</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Level Approvals</CardTitle>
                <CardDescription>
                  Configure sequential approval workflows with manager, finance, and director levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Admin, Manager, and Employee roles with precise permission controls
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Smart Rules</CardTitle>
                <CardDescription>
                  Percentage-based or specific approver rules with hybrid combinations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Multi-Currency Support</CardTitle>
                <CardDescription>
                  Handle expenses in different currencies with automatic conversion
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with audit trails and compliance features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Instant notifications and status updates for all stakeholders
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-3xl mb-4">Ready to streamline your expenses?</CardTitle>
              <CardDescription className="text-lg mb-6">
                Join companies that have transformed their expense management
              </CardDescription>
              <Button onClick={() => navigate("/auth")} size="lg" className="text-lg h-12 px-8">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardHeader>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 ExpenseFlow. Built for your hackathon success.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
