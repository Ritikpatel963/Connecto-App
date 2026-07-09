CREATE TABLE IF NOT EXISTS public.coin_packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    coins INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/authenticated reads
CREATE POLICY "Allow public read access to active coin_packages" 
ON public.coin_packages FOR SELECT USING (is_active = true);

-- Allow admins full access
CREATE POLICY "Allow admin full access to coin_packages" 
ON public.coin_packages FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    amount_coins INTEGER NOT NULL,
    amount_fiat DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL, -- e.g., 'UPI', 'Bank Transfer'
    payment_details JSONB NOT NULL, -- e.g., {"upi_id": "user@upi"}
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
    processed_by_admin_id INTEGER,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own requests
CREATE POLICY "Allow users to view own withdrawal requests" 
ON public.withdrawal_requests FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own requests
CREATE POLICY "Allow users to insert own withdrawal requests" 
ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow admins full access
CREATE POLICY "Allow admin full access to withdrawal_requests" 
ON public.withdrawal_requests FOR ALL USING (true) WITH CHECK (true);
