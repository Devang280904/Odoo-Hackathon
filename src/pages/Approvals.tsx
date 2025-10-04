import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Session } from "@supabase/supabase-js";

interface PendingExpense {
  id: string;
  amount: number;
  currency_code: string;
  amount_in_company_currency: number;
  category: string;
  description: string;
  expense_date: string;
  status: string;
}

const Approvals = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<PendingExpense | null>(null);
  const [comments, setComments] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      });

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        navigate("/auth");
      }

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchUserRole();
      fetchPendingExpenses();
    }
  }, [session]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session?.user?.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchPendingExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingExpenses(data || []);
    } catch (error: any) {
      toast.error("Error loading pending expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId: string, approved: boolean) => {
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("expenses")
        .update({ status: approved ? "approved" : "rejected" })
        .eq("id", expenseId);

      if (error) throw error;

      toast.success(`Expense ${approved ? "approved" : "rejected"} successfully!`);
      setSelectedExpense(null);
      setComments("");
      fetchPendingExpenses();
    } catch (error: any) {
      toast.error(error.message || "Error processing approval");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== "admin" && userRole !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Pending Approvals</h1>
              <p className="text-xs text-muted-foreground">Review and approve expense claims</p>
            </div>
          </div>
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {pendingExpenses.length} Pending
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          {pendingExpenses.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment</p>
              </CardContent>
            </Card>
          ) : (
            pendingExpenses.map((expense) => (
              <Card key={expense.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg capitalize">{expense.category}</CardTitle>
                      <CardDescription>Expense Claim</CardDescription>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground text-sm">Amount:</span>
                        <p className="font-semibold">{expense.currency_code} {expense.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Date:</span>
                        <p className="font-semibold">{new Date(expense.expense_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="mt-1">{expense.description}</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Expense</DialogTitle>
                            <DialogDescription>
                              Confirm approval for this expense claim
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="comments">Comments (optional)</Label>
                              <Textarea
                                id="comments"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add any comments about this approval..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                onClick={() => handleApproval(expense.id, true)}
                                disabled={processing}
                              >
                                {processing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Confirm Approval"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Expense</DialogTitle>
                            <DialogDescription>
                              Provide a reason for rejecting this expense claim
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reject-comments">Reason for rejection</Label>
                              <Textarea
                                id="reject-comments"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Please provide a reason..."
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleApproval(expense.id, false)}
                                disabled={processing || !comments}
                              >
                                {processing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Confirm Rejection"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Approvals;
