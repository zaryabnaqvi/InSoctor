import { AIInsights } from '@/services/ai.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Shield,
    AlertTriangle,
    ListChecks,
    Lightbulb,
    Copy,
    CheckCircle2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface AIInsightsPanelProps {
    insights: AIInsights;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        const text = `
AI Security Analysis
====================

Summary:
${insights.summary}

Severity Analysis:
${insights.severity_analysis}

Remediation Steps:
${insights.remediation_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Prevention Measures:
${insights.prevention_measures.map((measure, i) => `${i + 1}. ${measure}`).join('\n')}
${insights.mitre_tactics ? `\nMITRE ATT&CK Tactics: ${insights.mitre_tactics.join(', ')}` : ''}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: 'Copied to Clipboard',
            description: 'AI insights have been copied successfully',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">AI Security Analysis</h3>
                        <p className="text-xs text-muted-foreground">Powered by Azure OpenAI</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                    {copied ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Summary */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Threat Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{insights.summary}</p>
                </CardContent>
            </Card>

            {/* Severity Analysis */}
            <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Severity Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{insights.severity_analysis}</p>
                </CardContent>
            </Card>

            {/* Remediation Steps */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-green-500" />
                        Remediation Steps
                    </CardTitle>
                    <CardDescription>Follow these steps to address this security alert</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {insights.remediation_steps.map((step, index) => (
                            <li key={index} className="flex gap-3">
                                <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center shrink-0">
                                    {index + 1}
                                </Badge>
                                <p className="text-sm leading-relaxed">{step}</p>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Prevention Measures */}
            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-500" />
                        Prevention Measures
                    </CardTitle>
                    <CardDescription>Best practices to prevent similar incidents</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {insights.prevention_measures.map((measure, index) => (
                            <li key={index} className="flex gap-2 text-sm">
                                <span className="text-purple-500 shrink-0">•</span>
                                <span className="leading-relaxed">{measure}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* MITRE ATT&CK Tactics (if available) */}
            {insights.mitre_tactics && insights.mitre_tactics.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">MITRE ATT&CK Tactics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {insights.mitre_tactics.map((tactic, index) => (
                                <Badge key={index} variant="secondary">
                                    {tactic}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
