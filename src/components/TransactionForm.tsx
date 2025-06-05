import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Transaction } from "@/types";
import { Storage } from "@/lib/storage";
import { toast } from "sonner";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onTransactionAdded?: (transaction: Transaction) => void;
  editTransaction?: Transaction;
  onTransactionUpdated?: (transaction: Transaction) => void;
  onCancel?: () => void;
}

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Gift",
  "Bonus",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Home & Garden",
  "Insurance",
  "Savings",
  "Other Expense",
];

export function TransactionForm({
  onTransactionAdded,
  editTransaction,
  onTransactionUpdated,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editTransaction
      ? {
          type: editTransaction.type,
          amount: editTransaction.amount,
          description: editTransaction.description,
          category: editTransaction.category,
          date: editTransaction.date,
        }
      : {
          type: "expense",
          amount: 0,
          description: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
        },
  });

  const transactionType = watch("type");

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (editTransaction) {
        const updatedTransaction = Storage.updateTransaction(
          editTransaction.id,
          data,
        );
        if (updatedTransaction) {
          onTransactionUpdated?.(updatedTransaction);
          toast.success("Transaction updated successfully");
        } else {
          toast.error("Failed to update transaction");
        }
      } else {
        const newTransaction = Storage.addTransaction(data);
        onTransactionAdded?.(newTransaction);
        toast.success("Transaction added successfully");
        reset();
      }
    } catch (error) {
      toast.error("Failed to save transaction");
      console.error("Error saving transaction:", error);
    }
  };

  const categories =
    transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card className="transaction-form-card">
      <CardHeader>
        <CardTitle>
          {editTransaction ? "Edit Transaction" : "Add New Transaction"}
        </CardTitle>
        <CardDescription>
          {editTransaction
            ? "Update the transaction details below"
            : "Enter the details of your income or expense"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="transaction-form-content"
        >
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="type">Type</Label>
              <Select
                value={transactionType}
                onValueChange={(value) =>
                  setValue("type", value as "income" | "expense")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="error-message">{errors.type.message}</p>
              )}
            </div>

            <div className="form-field">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="error-message">{errors.amount.message}</p>
              )}
            </div>

            <div className="form-field">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="error-message">{errors.category.message}</p>
              )}
            </div>

            <div className="form-field">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="error-message">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="form-field">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this transaction"
              {...register("description")}
            />
            {errors.description && (
              <p className="error-message">{errors.description.message}</p>
            )}
          </div>

          <div className="form-actions">
            {editTransaction && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting
                ? "Saving..."
                : editTransaction
                  ? "Update Transaction"
                  : "Add Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
