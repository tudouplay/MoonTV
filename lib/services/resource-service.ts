import axios from 'axios';
import { getConfig } from '@/lib/config';

export interface ResourceSite {
  key: string;
  api: string;
  name: string;
  detail?: string;
  priority: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastChecked?: number;
  responseTime?: number;
}

export interface ResourceResult {
  id: string;
  title: string;
  cover: string;
  type: 'movie' | 'tv';
  year?: string;
  score?: number;
  source: string;
  sourceKey: string;
  url: string;
  quality?: string;
  language?: string;
  updateTime?: string;
}

// 测试资源站可用性
export async function checkResourceSiteStatus(site: ResourceSite): Promise<{
  status: 'active' | 'inactive';
  responseTime: number;
}> {
  try {
    const start = Date.now();
    await axios.head(site.api, { timeout: 5000 });
    const responseTime = Date.now() - start;
    
    return {
      status: 'active',
      responseTime
    };
  } catch (error) {
    return {
      status: 'inactive',
      responseTime: 0
    };
  }
}

// 批量检查所有资源站状态
export async function checkAllResourceSites() {
  const config = getConfig();
  const sites: ResourceSite[] = Object.entries(config.api_site).map(([key, value]) => ({
    key,
    ...value as any
  }));
  
  const results = await Promise.all(
    sites.map(site => checkResourceSiteStatus(site))
  );
  
  return sites.map((site, index) => ({
    ...site,
    status: results[index].status,
    responseTime: results[index].responseTime,
    lastChecked: Date.now()
  }));
}

// 搜索资源并按优先级和质量排序
export async function searchResources(
  keyword: string, 
  type: 'movie' | 'tv' | 'all' = 'all',
  page = 1,
  limit = 20
): Promise<ResourceResult[]> {
  const config = getConfig();
  const sites: ResourceSite[] = Object.entries(config.api_site)
    .map(([key, value]) => ({ key, ...value as any }))
    .filter(site => site.status === 'active')
    .sort((a, b) => a.priority - b.priority); // 按优先级排序
    
  // 并行搜索所有活跃资源站
  const searchPromises = sites.map(async (site) => {
    try {
      const response = await axios.get(site.api, {
        params: {
          wd: keyword,
          type: type === 'all' ? '' : type,
          page,
          limit
        },
        timeout: 10000
      });
      
      // 适配不同API返回格式
      const results = response.data?.list || response.data?.data || [];
      
      // 标准化结果格式
      return results.map((item: any) => ({
        id: item.id || `${site.key}-${Date.now()}-${Math.random()}`,
        title: item.title || item.name,
        cover: item.cover || item.img,
        type: item.type === '电影' ? 'movie' : 'tv',
        year: item.year,
        score: item.score,
        source: site.name,
        sourceKey: site.key,
        url: item.url || `${site.detail}/${item.id}.html`,
        quality: item.quality,
        language: item.language,
        updateTime: item.update_time
      })) as ResourceResult[];
    } catch (error) {
      console.error(`搜索资源站 ${site.name} 失败:`, error);
      return [];
    }
  });
  
  // 等待所有搜索完成并合并结果
  const allResults = await Promise.all(searchPromises);
  let mergedResults = allResults.flat();
  
  // 应用过滤配置
  const { resource_filters } = config;
  if (resource_filters.exclude_low_quality) {
    mergedResults = mergedResults.filter(item => 
      !item.quality || ['HD', '1080P', '4K', '蓝光'].includes(item.quality)
    );
  }
  
  // 去重（基于标题和年份）
  const uniqueResults = Array.from(
    new Map(mergedResults.map(item => 
      [`${item.title}-${item.year}`, item]
    )).values()
  );
  
  // 最终排序：优先按评分，然后按更新时间
  return uniqueResults.sort((a, b) => {
    if (b.score && a.score) {
      return b.score - a.score;
    }
    return new Date(b.updateTime || '').getTime() - new Date(a.updateTime || '').getTime();
  });
}
