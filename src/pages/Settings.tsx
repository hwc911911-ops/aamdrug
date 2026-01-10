import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Database } from 'lucide-react';
import { useStockSummary } from '@/hooks/useStockSummary';
import { useDrugs } from '@/hooks/useDrugs';
import { useBatches } from '@/hooks/useBatches';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Settings() {
  const { data: stockSummary } = useStockSummary();
  const { data: drugs } = useDrugs();
  const { data: batches } = useBatches();
  const { data: transactions } = useTransactions();

  const exportAllData = () => {
    const data = {
      exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      drugs: drugs || [],
      batches: batches || [],
      transactions: transactions || [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage system settings and backups
          </p>
        </div>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
            <CardDescription>
              Overview of your inventory data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Drugs</p>
                <p className="text-2xl font-bold">{drugs?.length || 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-2xl font-bold">{batches?.length || 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions?.length || 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-lg font-medium">
                  {format(new Date(), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup & Export
            </CardTitle>
            <CardDescription>
              Download a complete backup of your inventory data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We recommend downloading a backup at least once a month to ensure your data is safe.
            </p>
            <Button onClick={exportAllData}>
              <Download className="mr-2 h-4 w-4" />
              Download Full Backup (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facility Name</span>
                <span className="font-medium">AAM Shivnagri HSC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Storage</span>
                <span className="font-medium">Lovable Cloud Database</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
