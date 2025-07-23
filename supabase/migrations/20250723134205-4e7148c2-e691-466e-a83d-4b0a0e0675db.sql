-- Create talent_profiles table for professional information
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  title TEXT,
  specialty TEXT,
  bio TEXT,
  skills TEXT[],
  years_experience INTEGER,
  availability TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for talent profiles
CREATE POLICY "Users can view all talent profiles" 
ON public.talent_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own talent profile" 
ON public.talent_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own talent profile" 
ON public.talent_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_talent_profiles_updated_at
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create work experience table
CREATE TABLE public.work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for work experience
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

-- Create policies for work experience
CREATE POLICY "Users can view work experience through talent profiles" 
ON public.work_experience 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.talent_profiles 
  WHERE talent_profiles.id = work_experience.talent_profile_id
));

CREATE POLICY "Users can manage their own work experience" 
ON public.work_experience 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.talent_profiles 
  WHERE talent_profiles.id = work_experience.talent_profile_id 
  AND talent_profiles.user_id = auth.uid()
));

-- Create education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  graduation_year INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for education
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create policies for education
CREATE POLICY "Users can view education through talent profiles" 
ON public.education 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.talent_profiles 
  WHERE talent_profiles.id = education.talent_profile_id
));

CREATE POLICY "Users can manage their own education" 
ON public.education 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.talent_profiles 
  WHERE talent_profiles.id = education.talent_profile_id 
  AND talent_profiles.user_id = auth.uid()
));

-- Create saved opportunities table
CREATE TABLE public.saved_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- Enable RLS for saved opportunities
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for saved opportunities
CREATE POLICY "Users can manage their own saved opportunities" 
ON public.saved_opportunities 
FOR ALL 
USING (auth.uid() = user_id);