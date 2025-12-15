import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/api.service';
import { Loader2 } from 'lucide-react';

interface CreateCaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alertId?: string;
    alertTitle?: string;
    alertDescription?: string;
    onCaseCreated?: () => void;
}

export function CreateCaseDialog({
    open,
    onOpenChange,
    alertId,
    alertTitle,
    alertDescription,
    onCaseCreated,
}: CreateCaseDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: alertTitle || '',
        description: alertDescription || '',
        severity: 'medium',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (alertId) {
                // Create case from alert
                await apiClient.createCaseFromAlert(alertId, {
                    title: formData.title,
                    description: formData.description,
                    severity: formData.severity,
                });
            } else {
                // Create standalone case
                await apiClient.createCase({
                    name: formData.title,
                    description: formData.description,
                    severity: formData.severity,
                });
            }

            toast({
                title: 'Case created successfully',
                description: 'The case has been created and linked to the alert.',
            });

            onOpenChange(false);
            if (onCaseCreated) {
                onCaseCreated();
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                severity: 'medium',
            });
        } catch (error: any) {
            console.error('Failed to create case:', error);
            toast({
                title: 'Failed to create case',
                description: error.response?.data?.message || error.message || 'An error occurred',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription>
                        {alertId
                            ? 'Create a case from this alert for investigation and tracking.'
                            : 'Create a new case for investigation and tracking.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Case Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter case title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the case details..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                required
                                disabled={loading}
                                rows={4}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="severity">Severity</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, severity: value })
                                }
                                disabled={loading}
                            >
                                <SelectTrigger id="severity">
                                    <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Case
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
