import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useDashboardStats } from '@/hooks/useStockSummary';
import { Package, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useExpiringBatches } from '@/hooks/useBatches';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const today = new Date().toISOString().split('T')[0];
  const { data: todayTransactions, isLoading: transactionsLoading } = useTransactions(today);
  const { data: expiringBatches, isLoading: expiringLoading } = useExpiringBatches(30);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to AAM Shivnagri HSC Drug Inventory System
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Drugs"
                value={stats?.totalDrugs || 0}
                icon={Package}
                variant="default"
                description="In master list"
              />
              <StatCard
                title="Low Stock"
                value={stats?.lowStockCount || 0}
                icon={AlertTriangle}
                variant={stats?.lowStockCount ? 'warning' : 'success'}
                description="Below threshold"
              />
              <StatCard
                title="Expiring Soon"
                value={stats?.expiringSoon || 0}
                icon={Clock}
                variant={stats?.expiringSoon ? 'danger' : 'success'}
                description="Within 30 days"
              />
              <StatCard
                title="Today's Entries"
                value={stats?.todayTransactions || 0}
                icon={Activity}
                variant="default"
                description={format(new Date(), 'MMM d, yyyy')}
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : todayTransactions?.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No transactions today
                </p>
              ) : (
                <div className="space-y-2">
                  {todayTransactions?.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{tx.drug?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.batch?.batch_number || 'No batch'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {tx.received > 0 && (
                          <span className="text-green-600">+{tx.received}</span>
                        )}
                        {tx.received > 0 && tx.used > 0 && ' / '}
                        {tx.used > 0 && (
                          <span className="text-red-600">-{tx.used}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expiring Soon (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : expiringBatches?.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No drugs expiring soon
                </p>
              ) : (
                <div className="space-y-2">
                  {expiringBatches?.slice(0, 5).map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.drug?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Batch: {batch.batch_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          Exp: {format(new Date(batch.exp_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {batch.current_quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
