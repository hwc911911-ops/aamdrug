import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTransactions } from '@/hooks/useTransactions';
import { useStockSummary } from '@/hooks/useStockSummary';
import { useExpiringBatches } from '@/hooks/useBatches';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyTransactions, isLoading: dailyLoading } = useTransactions(dateStr);
  const { data: stockSummary, isLoading: stockLoading } = useStockSummary();
  const { data: expiringBatches, isLoading: expiringLoading } = useExpiringBatches(90);

  const exportToCSV = (data: unknown[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0] as object);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = (row as Record<string, unknown>)[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDailyReport = () => {
    const data = dailyTransactions?.map((tx) => ({
      Drug: tx.drug?.name || '',
      Batch: tx.batch?.batch_number || 'N/A',
      Opening: tx.opening_stock,
      Received: tx.received,
      Used: tx.used,
      Closing: tx.closing_stock,
      Remarks: tx.remarks || '',
    }));
    exportToCSV(data || [], `daily_report_${dateStr}`);
  };

  const exportStockReport = () => {
    const data = stockSummary?.map((item) => ({
      Drug: item.drug.name,
      Category: item.drug.category,
      Unit: item.drug.unit,
      'Current Stock': item.current_stock,
      'Min Threshold': item.drug.min_stock_threshold,
      Status: item.status,
    }));
    exportToCSV(data || [], 'stock_report');
  };

  const exportExpiryReport = () => {
    const data = expiringBatches?.map((batch) => ({
      Drug: batch.drug?.name || '',
      'Batch Number': batch.batch_number,
      'Mfg Date': batch.mfg_date,
      'Exp Date': batch.exp_date,
      Quantity: batch.current_quantity,
    }));
    exportToCSV(data || [], 'expiry_report');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            View and export inventory reports
          </p>
        </div>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily Report</TabsTrigger>
            <TabsTrigger value="stock">Stock Report</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Report</TabsTrigger>
          </TabsList>

          {/* Daily Report */}
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Daily Transactions</CardTitle>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button onClick={exportDailyReport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dailyLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : dailyTransactions?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No transactions on this date</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="text-center">Opening</TableHead>
                          <TableHead className="text-center">Received</TableHead>
                          <TableHead className="text-center">Used</TableHead>
                          <TableHead className="text-center">Closing</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyTransactions?.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">
                              {tx.drug?.name}
                            </TableCell>
                            <TableCell>{tx.batch?.batch_number || 'N/A'}</TableCell>
                            <TableCell className="text-center">{tx.opening_stock}</TableCell>
                            <TableCell className="text-center text-green-600">
                              +{tx.received}
                            </TableCell>
                            <TableCell className="text-center text-red-600">
                              -{tx.used}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {tx.closing_stock}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {tx.remarks || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Report */}
          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Current Stock Status</CardTitle>
                <Button onClick={exportStockReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-center">Current Stock</TableHead>
                          <TableHead className="text-center">Min Threshold</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockSummary?.map((item) => (
                          <TableRow key={item.drug.id}>
                            <TableCell className="font-medium">
                              {item.drug.name}
                            </TableCell>
                            <TableCell className="capitalize">{item.drug.category}</TableCell>
                            <TableCell className="text-center">{item.current_stock}</TableCell>
                            <TableCell className="text-center">{item.drug.min_stock_threshold}</TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                  item.status === 'good' && 'bg-green-100 text-green-700',
                                  item.status === 'low' && 'bg-yellow-100 text-yellow-700',
                                  item.status === 'critical' && 'bg-red-100 text-red-700',
                                  item.status === 'expired' && 'bg-red-200 text-red-800'
                                )}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expiry Report */}
          <TabsContent value="expiry" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Expiring Within 90 Days</CardTitle>
                <Button onClick={exportExpiryReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {expiringLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : expiringBatches?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No drugs expiring in the next 90 days</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug</TableHead>
                          <TableHead>Batch Number</TableHead>
                          <TableHead className="text-center">Mfg Date</TableHead>
                          <TableHead className="text-center">Exp Date</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiringBatches?.map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell className="font-medium">
                              {batch.drug?.name}
                            </TableCell>
                            <TableCell>{batch.batch_number}</TableCell>
                            <TableCell className="text-center">
                              {format(new Date(batch.mfg_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-center text-red-600 font-medium">
                              {format(new Date(batch.exp_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-center">{batch.current_quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
