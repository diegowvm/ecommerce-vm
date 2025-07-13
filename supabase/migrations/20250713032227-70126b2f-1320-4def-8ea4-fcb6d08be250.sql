-- Complete RLS policies for all tables

-- ====================================
-- ORDERS TABLE POLICIES
-- ====================================

-- Allow users to create their own orders
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to delete orders (for management purposes)
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (is_admin());

-- ====================================
-- ORDER_ITEMS TABLE POLICIES
-- ====================================

-- Allow system to insert order items during checkout
CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow admins to update order items (for corrections)
CREATE POLICY "Admins can update order items" 
ON public.order_items 
FOR UPDATE 
USING (is_admin());

-- Allow admins to delete order items (for management)
CREATE POLICY "Admins can delete order items" 
ON public.order_items 
FOR DELETE 
USING (is_admin());

-- ====================================
-- USER_ROLES TABLE POLICIES
-- ====================================

-- Allow system to create default user roles during signup
CREATE POLICY "System can create user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (role = 'user'::app_role);

-- Allow admins to manage all user roles
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (is_admin());

-- ====================================
-- PROFILES TABLE POLICIES
-- ====================================

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);