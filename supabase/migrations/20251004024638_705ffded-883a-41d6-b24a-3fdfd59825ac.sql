-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Create enum for expense status
CREATE TYPE public.expense_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for expense categories
CREATE TYPE public.expense_category AS ENUM ('travel', 'meals', 'office', 'equipment', 'other');

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_manager_approver BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code TEXT NOT NULL,
  amount_in_company_currency DECIMAL(10, 2),
  category public.expense_category NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  status public.expense_status NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_workflows table
CREATE TABLE public.approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  status public.expense_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_rules table
CREATE TABLE public.approval_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  percentage_threshold INTEGER,
  specific_approver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_hybrid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_rules ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's company
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can update their company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_company(auth.uid()) AND 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their company"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert profiles in their company"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_user_company(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update profiles in their company"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view roles in their company"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') AND
    user_id IN (
      SELECT user_id FROM public.profiles 
      WHERE company_id = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Admins can manage roles in their company"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') AND
    user_id IN (
      SELECT user_id FROM public.profiles 
      WHERE company_id = public.get_user_company(auth.uid())
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Employees can view their own expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view team expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') AND
    company_id = public.get_user_company(auth.uid())
  );

CREATE POLICY "Admins can view all company expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') AND
    company_id = public.get_user_company(auth.uid())
  );

CREATE POLICY "Employees can create expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    company_id = public.get_user_company(auth.uid())
  );

CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for approval_workflows
CREATE POLICY "Users can view their expense approvals"
  ON public.approval_workflows FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM public.expenses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can view pending approvals"
  ON public.approval_workflows FOR SELECT
  TO authenticated
  USING (approver_user_id = auth.uid());

CREATE POLICY "Managers can update their approvals"
  ON public.approval_workflows FOR UPDATE
  TO authenticated
  USING (
    approver_user_id = auth.uid() AND
    (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "System can create approval workflows"
  ON public.approval_workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for approval_rules
CREATE POLICY "Users can view company approval rules"
  ON public.approval_rules FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can manage approval rules"
  ON public.approval_rules FOR ALL
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Create a new company for the first user (admin)
  INSERT INTO public.companies (name, currency_code)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'currency_code', 'USD')
  )
  RETURNING id INTO new_company_id;

  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, company_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );

  -- Assign admin role to the first user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON public.approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at
  BEFORE UPDATE ON public.approval_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();