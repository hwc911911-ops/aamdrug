import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDrugs, useAddDrug } from '@/hooks/useDrugs';
import { Search, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DrugCategory, DrugUnit } from '@/lib/types';

const categories: { value: DrugCategory; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injectable', label: 'Injectable' },
  { value: 'topical', label: 'Topical' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'contraceptive', label: 'Contraceptive' },
  { value: 'vitamin', label: 'Vitamin' },
  { value: 'other', label: 'Other' },
];

const units: { value: DrugUnit; label: string }[] = [
  { value: 'tablets', label: 'Tablets' },
  { value: 'capsules', label: 'Capsules' },
  { value: 'ml', label: 'ML' },
  { value: 'vials', label: 'Vials' },
  { value: 'ampoules', label: 'Ampoules' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'tubes', label: 'Tubes' },
  { value: 'strips', label: 'Strips' },
  { value: 'packets', label: 'Packets' },
  { value: 'units', label: 'Units' },
  { value: 'pieces', label: 'Pieces' },
];

export default function DrugList() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDrug, setNewDrug] = useState({
    name: '',
    category: 'tablet' as DrugCategory,
    unit: 'tablets' as DrugUnit,
    min_stock_threshold: 10,
  });

  const { data: drugs, isLoading } = useDrugs();
  const addDrug = useAddDrug();

  const filteredDrugs = drugs?.filter((drug) =>
    drug.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDrug = async () => {
    if (!newDrug.name.trim()) {
      toast.error('Please enter drug name');
      return;
    }

    try {
      await addDrug.mutateAsync(newDrug);
      toast.success('Drug added successfully');
      setIsDialogOpen(false);
      setNewDrug({
        name: '',
        category: 'tablet',
        unit: 'tablets',
        min_stock_threshold: 10,
      });
    } catch (error) {
      toast.error('Failed to add drug');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Drug Master List</h1>
            <p className="text-muted-foreground">
              Manage the list of all drugs in your inventory
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Drug
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Drug</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Drug Name</Label>
                  <Input
                    value={newDrug.name}
                    onChange={(e) =>
                      setNewDrug({ ...newDrug, name: e.target.value })
                    }
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newDrug.category}
                      onValueChange={(value: DrugCategory) =>
                        setNewDrug({ ...newDrug, category: value })
                      }
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={newDrug.unit}
                      onValueChange={(value: DrugUnit) =>
                        setNewDrug({ ...newDrug, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Stock Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newDrug.min_stock_threshold}
                    onChange={(e) =>
                      setNewDrug({
                        ...newDrug,
                        min_stock_threshold: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddDrug} className="w-full">
                  Add Drug
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search drugs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drug Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Drugs
              {filteredDrugs && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredDrugs.length} total)
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
                      <TableHead className="text-center">Min Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrugs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No drugs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrugs?.map((drug) => (
                        <TableRow key={drug.id}>
                          <TableCell className="font-medium">
                            {drug.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {drug.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center capitalize">
                            {drug.unit}
                          </TableCell>
                          <TableCell className="text-center">
                            {drug.min_stock_threshold}
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
