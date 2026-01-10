import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStockSummary } from '@/hooks/useStockSummary';
import { Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DrugCategory } from '@/lib/types';

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'tablet', label: 'Tablets' },
  { value: 'capsule', label: 'Capsules' },
  { value: 'liquid', label: 'Liquids' },
  { value: 'injectable', label: 'Injectables' },
  { value: 'topical', label: 'Topical' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'other', label: 'Other' },
];

const stockFilters = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'good', label: '🟢 Good Stock' },
  { value: 'low', label: '🟡 Low Stock' },
  { value: 'critical', label: '🔴 Critical/Out' },
];

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const { data: stockSummary, isLoading } = useStockSummary();

  const filteredStock = stockSummary?.filter((item) => {
    const matchesSearch = item.drug.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.drug.category === category;
    
    let matchesStock = true;
    if (stockFilter === 'good') {
      matchesStock = item.status === 'good';
    } else if (stockFilter === 'low') {
      matchesStock = item.status === 'low';
    } else if (stockFilter === 'critical') {
      matchesStock = item.status === 'critical' || item.status === 'expired';
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Good</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Low</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Critical</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            View and manage drug stock levels
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search drugs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Stock Overview
              {filteredStock && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredStock.length} drugs)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                      <TableHead>Drug Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">Current Stock</TableHead>
                      <TableHead className="text-center">Min Threshold</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No drugs found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStock?.map((item) => (
                        <TableRow 
                          key={item.drug.id}
                          className={cn(
                            item.status === 'expired' && 'bg-red-50 dark:bg-red-950',
                            item.status === 'critical' && 'bg-red-50/50 dark:bg-red-950/50',
                            item.status === 'low' && 'bg-yellow-50 dark:bg-yellow-950/30'
                          )}
                        >
                          <TableCell className="font-medium">
                            {item.drug.name}
                            {item.expiring_soon && (
                              <Badge variant="outline" className="ml-2 text-xs border-orange-500 text-orange-600">
                                Expiring Soon
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{item.drug.category}</TableCell>
                          <TableCell className="text-center capitalize">{item.drug.unit}</TableCell>
                          <TableCell className="text-center font-medium">
                            {item.current_stock}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {item.drug.min_stock_threshold}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(item.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
