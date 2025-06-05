import React, { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Transaction } from "@/types";
import { Storage } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionUpdated?: () => void;
  onTransactionEdit?: (transaction: Transaction) => void;
  showMatchStatus?: boolean;
}

export function TransactionList({
  transactions,
  onTransactionUpdated,
  onTransactionEdit,
  showMatchStatus = false,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const success = Storage.deleteTransaction(id);
      if (success) {
        toast.success("Transaction deleted successfully");
        onTransactionUpdated?.();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error("Error deleting transaction:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getTypeColor = (type: "income" | "expense") => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  const getTypeBadgeVariant = (type: "income" | "expense") => {
    return type === "income" ? "default" : "secondary";
  };

  if (transactions.length === 0) {
    return (
      <Card className="transaction-list-empty">
        <CardContent className="empty-state">
          <div className="empty-icon">
            <AlertCircle className="icon-lg text-muted-foreground" />
          </div>
          <h3 className="empty-title">No transactions found</h3>
          <p className="empty-description">
            Start by adding your first income or expense transaction.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="transaction-list-container">
      <div className="transaction-list-header">
        <h3 className="list-title">Recent Transactions</h3>
        <p className="list-description">
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="transaction-list-grid">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="transaction-item">
            <CardContent className="transaction-content">
              <div className="transaction-header">
                <div className="transaction-info">
                  <div className="transaction-main">
                    <div className="transaction-amount-type">
                      <span
                        className={cn(
                          "transaction-amount",
                          getTypeColor(transaction.type),
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <Badge
                        variant={getTypeBadgeVariant(transaction.type)}
                        className="type-badge"
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                    {showMatchStatus && (
                      <div className="match-status">
                        {transaction.isMatched ? (
                          <div className="match-indicator matched">
                            <CheckCircle className="match-icon" />
                            <span className="match-text">Matched</span>
                          </div>
                        ) : (
                          <div className="match-indicator unmatched">
                            <AlertCircle className="match-icon" />
                            <span className="match-text">Unmatched</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="transaction-details">
                    <h4 className="transaction-description">
                      {transaction.description}
                    </h4>
                    <div className="transaction-meta">
                      <span className="transaction-category">
                        {transaction.category}
                      </span>
                      <span className="transaction-date">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {transaction.bankReference && (
                      <p className="bank-reference">
                        Bank Ref: {transaction.bankReference}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="action-button">
                      <MoreHorizontal className="action-icon" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onTransactionEdit?.(transaction)}
                      className="edit-action"
                    >
                      <Edit className="action-menu-icon" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="delete-action"
                        >
                          <Trash2 className="action-menu-icon" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Transaction
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="delete-confirm-button"
                          >
                            {deletingId === transaction.id
                              ? "Deleting..."
                              : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
