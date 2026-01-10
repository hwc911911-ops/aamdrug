import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDrugs } from '@/hooks/useDrugs';
import { useBatches, useAddBatch } from '@/hooks/useBatches';
import { useAddTransaction, useLastTransaction } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function DailyEntry() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isNewBatch, setIsNewBatch] = useState(false);
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [mfgDate, setMfgDate] = useState<Date | undefined>();
  const [expDate, setExpDate] = useState<Date | undefined>();
  const [received, setReceived] = useState<number>(0);
  const [used, setUsed] = useState<number>(0);
  const [remarks, setRemarks] = useState('');

  const { data: drugs } = useDrugs();
  const { data: batches } = useBatches(selectedDrugId);
  const { data: lastTransaction } = useLastTransaction(selectedDrugId);
  const addBatch = useAddBatch();
  const addTransaction = useAddTransaction();

  const openingStock = lastTransaction?.closing_stock || 0;
  const closingStock = openingStock + received - used;

  const handleSubmit = async () => {
    if (!selectedDrugId) {
      toast.error('Please select a drug');
      return;
    }

    if (received === 0 && used === 0) {
      toast.error('Please enter received or used quantity');
      return;
    }

    if (used > openingStock + received) {
      toast.error('Cannot use more than available stock');
      return;
    }

    try {
      let batchId = selectedBatchId;

      // Create new batch if needed
      if (isNewBatch && newBatchNumber && mfgDate && expDate) {
        if (expDate <= mfgDate) {
          toast.error('Expiry date must be after manufacturing date');
          return;
        }

        const newBatch = await addBatch.mutateAsync({
          drug_id: selectedDrugId,
          batch_number: newBatchNumber,
          mfg_date: format(mfgDate, 'yyyy-MM-dd'),
          exp_date: format(expDate, 'yyyy-MM-dd'),
          initial_quantity: received,
          current_quantity: received,
        });
        batchId = newBatch.id;
      }

      // Create transaction
      await addTransaction.mutateAsync({
        drug_id: selectedDrugId,
        batch_id: batchId || undefined,
        transaction_date: format(selectedDate, 'yyyy-MM-dd'),
        opening_stock: openingStock,
        received,
        used,
        closing_stock: closingStock,
        remarks: remarks || undefined,
      });

      toast.success('Transaction saved successfully');

      // Reset form
      setSelectedDrugId('');
      setSelectedBatchId('');
      setIsNewBatch(false);
      setNewBatchNumber('');
      setMfgDate(undefined);
      setExpDate(undefined);
      setReceived(0);
      setUsed(0);
      setRemarks('');
    } catch (error) {
      toast.error('Failed to save transaction');
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Entry</h1>
          <p className="text-muted-foreground">
            Record daily drug transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Drug Selection */}
            <div className="space-y-2">
              <Label>Drug</Label>
              <Select value={selectedDrugId} onValueChange={setSelectedDrugId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drug" />
                </SelectTrigger>
                <SelectContent>
                  {drugs?.map((drug) => (
                    <SelectItem key={drug.id} value={drug.id}>
                      {drug.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch Selection */}
            {selectedDrugId && (
              <div className="space-y-2">
                <Label>Batch</Label>
                <div className="flex gap-2">
                  <Select
                    value={isNewBatch ? 'new' : selectedBatchId}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setIsNewBatch(true);
                        setSelectedBatchId('');
                      } else {
                        setIsNewBatch(false);
                        setSelectedBatchId(value);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add New Batch
                        </span>
                      </SelectItem>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number} (Exp: {format(new Date(batch.exp_date), 'MMM yyyy')}) - Qty: {batch.current_quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* New Batch Fields */}
            {isNewBatch && (
              <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                <h4 className="font-medium">New Batch Details</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={newBatchNumber}
                      onChange={(e) => setNewBatchNumber(e.target.value)}
                      placeholder="e.g., B2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturing Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !mfgDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {mfgDate ? format(mfgDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={mfgDate}
                          onSelect={setMfgDate}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !expDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expDate ? format(expDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expDate}
                          onSelect={setExpDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Calculation */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Opening Stock</Label>
                  <p className="text-2xl font-bold">{openingStock}</p>
                </div>
                <div className="space-y-2">
                  <Label>Received (+)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={received}
                    onChange={(e) => setReceived(parseInt(e.target.value) || 0)}
                    className="text-green-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Used (-)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={openingStock + received}
                    value={used}
                    onChange={(e) => setUsed(parseInt(e.target.value) || 0)}
                    className="text-red-600 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Closing Stock</Label>
                  <p className={cn(
                    'text-2xl font-bold',
                    closingStock < 0 ? 'text-red-600' : 'text-green-600'
                  )}>
                    {closingStock}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks (Optional)</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={addTransaction.isPending || addBatch.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Save Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
