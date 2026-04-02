-- c:\www\EMPREGACALDAS\supabase\migrations\011_create_blog.sql
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    author_name TEXT,
    author_role TEXT,
    author_avatar TEXT,
    reading_time INTEGER DEFAULT 5,
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_post_categories (
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE public.blog_post_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_images ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage blog_categories" ON public.blog_categories
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin'));
CREATE POLICY "Admins can manage blog_posts" ON public.blog_posts
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin'));
CREATE POLICY "Admins can manage blog_post_categories" ON public.blog_post_categories
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin'));
CREATE POLICY "Admins can manage blog_post_images" ON public.blog_post_images
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin'));

-- Public can read
CREATE POLICY "Public can read blog_categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public can read blog_post_categories" ON public.blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Public can read blog_post_images" ON public.blog_post_images FOR SELECT USING (true);

-- Trigger for updated_at in blog_posts
CREATE TRIGGER trigger_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
