'use client';

import { useEffect, useState } from 'react';
import { checkAllResourceSites, ResourceSite } from '@/lib/services/resource-service';
import { FaCheckCircle, FaExclamationCircle, FaClock, FaRefresh } from 'react-icons/fa';

export function ResourceStatusMonitor() {
  const [sites, setSites] = useState<ResourceSite[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const statuses = await checkAllResourceSites();
      setSites(statuses);
    } catch (error) {
      console.error('Failed to check resource sites', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    
    // 每5分钟自动刷新一次
    const interval = setInterval(refreshStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaExclamationCircle className="text-red-500" />;
      case 'maintenance':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '正常';
      case 'inactive':
        return '不可用';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-background rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">资源站状态监控</h3>
          <button 
            onClick={refreshStatus}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-accent disabled:opacity-50"
          >
            <FaRefresh className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">资源站状态监控</h3>
        <button 
          onClick={refreshStatus}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-accent disabled:opacity-50"
        >
          <FaRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">资源站</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">状态</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">响应时间</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">优先级</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites.map((site) => (
              <tr key={site.key} className="hover:bg-accent/50 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">{site.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {getStatusIndicator(site.status)}
                    <span>{getStatusText(site.status)}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {site.responseTime ? `${site.responseTime}ms` : '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{site.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
