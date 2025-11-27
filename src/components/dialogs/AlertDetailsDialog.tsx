import { Alert } from '@/contexts/AlertContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { aiService, AIInsights } from '@/services/ai.service';
import { toast } from '@/hooks/use-toast';
import { AIInsightsPanel } from '@/components/alerts/AIInsightsPanel';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface AlertDetailsDialogProps {
    alert: Alert | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange }: AlertDetailsDialogProps) {
    const [insights, setInsights] = useState<AIInsights | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Reset insights when alert changes
    useEffect(() => {
        setInsights(null);
        setIsAnalyzing(false);
    }, [alert?.id]);

    if (!alert) return null;

    const handleGetInsights = async () => {
        setIsAnalyzing(true);
        try {
            const result = await aiService.analyzeAlert(alert);
            setInsights(result);
            toast({
                title: 'Analysis Complete',
                description: 'AI insights generated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Analysis Failed',
                description: error.message || 'Failed to get AI insights',
                variant: 'destructive',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSeverityIcon = () => {
        switch (alert.severity) {
            case 'critical':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'high':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'medium':
                return <Info className="h-5 w-5 text-yellow-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
        return Object.keys(obj || {}).reduce((acc: any, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    };

    // Prepare display data by merging alert fields and rawData
    const getDisplayData = () => {
        if (!alert) return {};
        const { rawData, ...alertProps } = alert;
        return flattenObject({
            ...alertProps,
            ...(rawData || {})
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {getSeverityIcon()}
                        <div className="flex-1">
                            <DialogTitle className="text-xl">{alert.title}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </DialogDescription>
                        </div>
                        <Badge
                            className={cn(
                                alert.severity === 'critical' && 'bg-destructive hover:bg-destructive',
                                alert.severity === 'high' && 'bg-orange-500 hover:bg-orange-600',
                                alert.severity === 'medium' && 'bg-yellow-500 hover:bg-yellow-600',
                                alert.severity === 'low' && 'bg-green-500 hover:bg-green-600'
                            )}
                        >
                            {alert.severity.toUpperCase()}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Alert Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Source</p>
                            <p className="text-sm mt-1">{alert.source}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Rule ID</p>
                            <p className="text-sm mt-1">
                                <code className="bg-secondary px-2 py-1 rounded text-xs">
                                    {(alert as any).ruleId || 'N/A'}
                                </code>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant="outline" className="mt-1">
                                {alert.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Alert ID</p>
                            <p className="text-sm mt-1 font-mono text-xs">{alert.id}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                        <p className="text-sm bg-secondary/50 p-3 rounded-md">{alert.description}</p>
                    </div>

                    {/* Parsed Fields Table */}
                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b bg-muted/40">
                            <h4 className="font-semibold text-sm">Event Fields</h4>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableBody>
                                    {Object.entries(getDisplayData()).map(([key, value]) => (
                                        <TableRow key={key} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-xs w-1/3 text-muted-foreground py-2">{key}</TableCell>
                                            <TableCell className="font-mono text-xs break-all py-2 text-foreground">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* AI Insights Button */}
                    {!insights && (
                        <div className="flex justify-center">
                            <Button
                                onClick={handleGetInsights}
                                disabled={isAnalyzing}
                                size="lg"
                                className="gap-2"
                            >
                                <Sparkles className={cn('h-5 w-5', isAnalyzing && 'animate-spin')} />
                                {isAnalyzing ? 'Analyzing with AI...' : 'Get AI Insights'}
                            </Button>
                        </div>
                    )}

                    {/* AI Insights Panel */}
                    {insights && <AIInsightsPanel insights={insights} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
