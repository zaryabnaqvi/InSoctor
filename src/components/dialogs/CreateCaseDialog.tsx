import { useState } from 'react';
import { Alert } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api.service';
import { Loader2 } from 'lucide-react';

interface CreateCaseDialogProps {
    alert: Alert | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (createdCase: any) => void;
}

export function CreateCaseDialog({ alert, open, onOpenChange, onSuccess }: CreateCaseDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate case title from alert
    const generateTitle = (alert: Alert): string => {
        const ruleDesc = alert.rawData?.rule?.description || alert.title;
        const agentName = alert.rawData?.agent?.name || 'Unknown Agent';
        const agentIp = alert.rawData?.agent?.ip || 'N/A';
        return `${ruleDesc} - ${agentName} (${agentIp})`;
    };

    // Generate case description from alert
    const generateDescription = (alert: Alert): string => {
        const timestamp = new Date(alert.timestamp).toLocaleString();
        const ruleId = alert.rawData?.rule?.id || 'N/A';
        const ruleLevel = alert.rawData?.rule?.level || 'N/A';
        const agentName = alert.rawData?.agent?.name || 'N/A';
        const agentIp = alert.rawData?.agent?.ip || 'N/A';

        return `## Alert Details
- **Alert ID**: ${alert.id}
- **Timestamp**: ${timestamp}
- **Rule ID**: ${ruleId}
- **Rule Level**: ${ruleLevel}
- **Source**: ${alert.source}
- **Agent**: ${agentName} (${agentIp})

## Description
${alert.description}

## Full Alert Data
\`\`\`json
${JSON.stringify(alert.rawData, null, 2)}
\`\`\`

[View Alert in Dashboard](#/alerts?id=${alert.id})`;
    };

    // Map alert severity to case severity
    const mapSeverity = (alertSeverity: string): string => {
        if (alertSeverity === 'info') return 'low';
        return alertSeverity; // critical, high, medium, low
    };

    const [formData, setFormData] = useState({
        title: alert ? generateTitle(alert) : '',
        description: alert ? generateDescription(alert) : '',
        severity: alert ? mapSeverity(alert.severity) : 'medium',
        classification: 'security-incident',
    });

    // Update form when alert changes
    useState(() => {
        if (alert) {
            setFormData({
                title: generateTitle(alert),
                description: generateDescription(alert),
                severity: mapSeverity(alert.severity),
                classification: 'security-incident',
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!alert) return;

        setIsSubmitting(true);

        try {
            const caseData = {
                name: formData.title,
                description: formData.description,
                severity: formData.severity,
                classification: formData.classification,
                alertIds: [alert.id],
            };

            const createdCase = await apiClient.createCase(caseData);

            toast({
                title: 'Case created successfully',
                description: `IRIS case has been created for alert ${alert.id}`,
            });

            onOpenChange(false);
            onSuccess?.(createdCase);
        } catch (error: any) {
            console.error('Failed to create case:', error);
            toast({
                title: 'Failed to create case',
                description: error.message || 'An error occurred while creating the case',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!alert) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create IRIS Case from Alert</DialogTitle>
                    <DialogDescription>
                        Review and create an IRIS case with pre-filled details from the alert.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Case Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Case title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                            value={formData.severity}
                            onValueChange={(value) => setFormData({ ...formData, severity: value })}
                        >
                            <SelectTrigger id="severity">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="classification">Classification</Label>
                        <Select
                            value={formData.classification}
                            onValueChange={(value) => setFormData({ ...formData, classification: value })}
                        >
                            <SelectTrigger id="classification">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="security-incident">Security Incident</SelectItem>
                                <SelectItem value="malware">Malware</SelectItem>
                                <SelectItem value="phishing">Phishing</SelectItem>
                                <SelectItem value="data-breach">Data Breach</SelectItem>
                                <SelectItem value="unauthorized-access">Unauthorized Access</SelectItem>
                                <SelectItem value="denial-of-service">Denial of Service</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Case description with alert details"
                            className="min-h-[200px] font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Includes full alert data in JSON format for forensic analysis
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Case
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
