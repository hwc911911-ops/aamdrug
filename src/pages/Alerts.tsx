import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStockSummary } from '@/hooks/useStockSummary';
import { useExpiringBatches } from '@/hooks/useBatches';
import { AlertTriangle, Clock, XCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Alerts() {
  const { data: stockSummary, isLoading: stockLoading } = useStockSummary();
  const { data: expiringBatches30, isLoading: expiring30Loading } = useExpiringBatches(30);
  const { data: expiringBatches60 } = useExpiringBatches(60);
  const { data: expiringBatches90 } = useExpiringBatches(90);

  const lowStockDrugs = stockSummary?.filter((item) => item.status === 'low') || [];
  const criticalStockDrugs = stockSummary?.filter((item) => item.status === 'critical') || [];
  const expiredDrugs = stockSummary?.filter((item) => item.status === 'expired') || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor stock levels and expiry dates
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Critical/Out of Stock</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {criticalStockDrugs.length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                    {lowStockDrugs.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Expiring (30 days)</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {expiringBatches30?.length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Expired</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {expiredDrugs.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">Stock Alerts</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Alerts</TabsTrigger>
          </TabsList>

          {/* Stock Alerts */}
          <TabsContent value="stock" className="space-y-4">
            {/* Critical Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Critical / Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : criticalStockDrugs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No critical stock alerts 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {criticalStockDrugs.map((item) => (
                      <div
                        key={item.drug.id}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
                      >
                        <div>
                          <p className="font-medium">{item.drug.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.drug.category} • Min: {item.drug.min_stock_threshold} {item.drug.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {item.current_stock === 0 ? 'OUT OF STOCK' : 'CRITICAL'}
                          </Badge>
                          <p className="mt-1 text-sm">
                            Current: <strong>{item.current_stock}</strong> {item.drug.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : lowStockDrugs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No low stock alerts 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lowStockDrugs.map((item) => (
                      <div
                        key={item.drug.id}
                        className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950"
                      >
                        <div>
                          <p className="font-medium">{item.drug.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.drug.category} • Min: {item.drug.min_stock_threshold} {item.drug.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                            LOW STOCK
                          </Badge>
                          <p className="mt-1 text-sm">
                            Current: <strong>{item.current_stock}</strong> {item.drug.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expiry Alerts */}
          <TabsContent value="expiry" className="space-y-4">
            {/* Expiring in 30 days */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  Expiring in 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiring30Loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : expiringBatches30?.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No drugs expiring in 30 days 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expiringBatches30?.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
                      >
                        <div>
                          <p className="font-medium">{batch.drug?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Batch: {batch.batch_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {format(new Date(batch.exp_date), 'MMM d, yyyy')}
                          </Badge>
                          <p className="mt-1 text-sm">
                            Qty: <strong>{batch.current_quantity}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expiring in 60 days */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Expiring in 60 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiringBatches60?.filter(
                  (b) => !expiringBatches30?.some((b30) => b30.id === b.id)
                ).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No additional drugs expiring in 60 days
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expiringBatches60
                      ?.filter((b) => !expiringBatches30?.some((b30) => b30.id === b.id))
                      .map((batch) => (
                        <div
                          key={batch.id}
                          className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950"
                        >
                          <div>
                            <p className="font-medium">{batch.drug?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Batch: {batch.batch_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              {format(new Date(batch.exp_date), 'MMM d, yyyy')}
                            </Badge>
                            <p className="mt-1 text-sm">
                              Qty: <strong>{batch.current_quantity}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
