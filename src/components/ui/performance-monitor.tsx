import React, { useState } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Activity, Clock, Image as ImageIcon, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
interface PerformanceMonitorProps {
  showDetailed?: boolean;
  className?: string;
}
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetailed = false,
  className
}) => {
  const {
    metrics,
    imageMetrics,
    performanceGrade
  } = usePerformanceMetrics();
  const [isExpanded, setIsExpanded] = useState(false);
  if (!showDetailed && performanceGrade === 'good') {
    return null; // Don't show if performance is good and not detailed view
  }
  const formatMetric = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}${unit}`;
  };
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'needs-improvement':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-4 h-4" />;
      case 'poor':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };
  if (!showDetailed) {
    return <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        
        
        {isExpanded && <Card className="absolute bottom-12 right-0 w-80 shadow-lg backdrop-blur-sm bg-background/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Métricas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span className="font-mono">{formatMetric(metrics.lcp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>FCP:</span>
                  <span className="font-mono">{formatMetric(metrics.fcp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <span className="font-mono">{formatMetric(metrics.cls, '')}</span>
                </div>
                <div className="flex justify-between">
                  <span>FID:</span>
                  <span className="font-mono">{formatMetric(metrics.fid)}</span>
                </div>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Imagens
                  </span>
                  <span className="font-mono">
                    {imageMetrics.loadedImages}/{imageMetrics.totalImages}
                  </span>
                </div>
                {imageMetrics.averageLoadTime > 0 && <div className="flex justify-between text-xs mt-1">
                    <span>Tempo médio:</span>
                    <span className="font-mono">{formatMetric(imageMetrics.averageLoadTime)}</span>
                  </div>}
              </div>
            </CardContent>
          </Card>}
      </div>;
  }
  return <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Performance Dashboard</h3>
        <Badge className={getGradeColor(performanceGrade)}>
          {getGradeIcon(performanceGrade)}
          <span className="ml-1">
            {performanceGrade === 'good' ? 'Excelente' : performanceGrade === 'needs-improvement' ? 'Moderado' : 'Crítico'}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetric(metrics.lcp)}</div>
            <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              FCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetric(metrics.fcp)}</div>
            <p className="text-xs text-muted-foreground">First Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              CLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetric(metrics.cls, '')}</div>
            <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {imageMetrics.loadedImages}/{imageMetrics.totalImages}
            </div>
            <p className="text-xs text-muted-foreground">
              Carregadas ({formatMetric(imageMetrics.averageLoadTime)} médio)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métricas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">TTFB:</span>
            <div className="font-mono font-semibold">{formatMetric(metrics.ttfb)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">FID:</span>
            <div className="font-mono font-semibold">{formatMetric(metrics.fid)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Falhas de Imagem:</span>
            <div className="font-mono font-semibold">{imageMetrics.failedImages}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa de Sucesso:</span>
            <div className="font-mono font-semibold">
              {imageMetrics.totalImages > 0 ? Math.round(imageMetrics.loadedImages / imageMetrics.totalImages * 100) : 0}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};