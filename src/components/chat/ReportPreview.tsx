import React, { useRef, useState } from 'react';
import { X, Download, FileText, Shield, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

interface ReportData {
    title: string;
    timeRange: string;
    generatedAt: string;
    metrics: {
        totalAlerts: number;
        severityDistribution: { name: string; value: number }[];
        topAgents: { name: string; value: number }[];
        alertTrend: { date: string; count: number }[];
    };
    summary: string;
}

interface ReportPreviewProps {
    data: ReportData;
    onClose: () => void;
}

const COLORS = {
    critical: '#ef4444', // red-500
    high: '#f97316',     // orange-500
    medium: '#eab308',   // yellow-500
    low: '#3b82f6',      // blue-500
    info: '#22c55e'      // green-500
};

export function ReportPreview({ data, onClose }: ReportPreviewProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!reportRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#0f172a', // Match theme background
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`InSOCtor_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-950 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Security Report Preview</h3>
                            <p className="text-xs text-slate-400">Generated on {new Date(data.generatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                        >
                            {isGenerating ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Report Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-950 custom-scrollbar">
                    <div ref={reportRef} className="space-y-8 bg-slate-950 p-8 min-h-[1000px] text-slate-200">
                        {/* Report Title Section */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-white">{data.title}</h1>
                                <p className="text-slate-400">Period: {data.timeRange}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-8 h-8 text-cyan-500" />
                                <span className="text-xl font-bold text-white">InSOCtor</span>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Executive Summary
                            </h2>
                            <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-white/5">
                                {data.summary}
                            </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-slate-900/50 border-white/10">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">{data.metrics.totalAlerts}</div>
                                    <div className="text-sm text-slate-400">Total Alerts</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900/50 border-white/10">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-4xl font-bold text-red-500 mb-2">
                                        {data.metrics.severityDistribution.find(s => s.name === 'critical')?.value || 0}
                                    </div>
                                    <div className="text-sm text-slate-400">Critical Alerts</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900/50 border-white/10">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-4xl font-bold text-cyan-500 mb-2">
                                        {data.metrics.topAgents.length}
                                    </div>
                                    <div className="text-sm text-slate-400">Active Agents</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* Severity Distribution */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-cyan-400" />
                                    Severity Distribution
                                </h3>
                                <div className="h-[300px] bg-slate-900/30 rounded-xl border border-white/5 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.metrics.severityDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.metrics.severityDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                                        {data.metrics.severityDistribution.map((entry) => (
                                            <div key={entry.name} className="flex items-center gap-1.5">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] || '#94a3b8' }}
                                                />
                                                <span className="text-xs text-slate-300 capitalize">{entry.name} ({entry.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Top Agents */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-cyan-400" />
                                    Top Agents by Alerts
                                </h3>
                                <div className="h-[300px] bg-slate-900/30 rounded-xl border border-white/5 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.metrics.topAgents} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                            <XAxis type="number" stroke="#94a3b8" />
                                            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                cursor={{ fill: '#334155', opacity: 0.4 }}
                                            />
                                            <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Alert Trend */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                Alert Activity Trend
                            </h3>
                            <div className="h-[300px] bg-slate-900/30 rounded-xl border border-white/5 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.metrics.alertTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-8 mt-8 border-t border-white/10 text-center text-slate-500 text-sm">
                            <p>Confidential Security Report • Generated by InSOCtor AI</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
