import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/notion'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://campus-lecture-website.vercel.app'

  // 靜態頁面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lecturers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lecture-request`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/apply`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 動態文章頁面
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const result = await getPosts({ status: '已發佈' })
    if (result.success && result.data) {
      blogPages = result.data.map(post => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Sitemap: 獲取文章失敗', error)
  }

  // 動態講師頁面
  let lecturerPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('is_approved', true)
      .eq('is_public', true)
      .in('role', ['instructor', 'admin'])

    if (data) {
      lecturerPages = data.map(lecturer => ({
        url: `${baseUrl}/lecturer/${lecturer.id}`,
        lastModified: lecturer.updated_at ? new Date(lecturer.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Sitemap: 獲取講師失敗', error)
  }

  return [...staticPages, ...blogPages, ...lecturerPages]
}
