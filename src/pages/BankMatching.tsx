import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BankTransaction, Transaction, MatchResult } from "@/types";
import { Storage } from "@/lib/storage";
import { BankMatcher } from "@/lib/bankMatching";
import { toast } from "sonner";
import { format } from "date-fns";

export function BankMatching() {
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(
    [],
  );
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const transactions = Storage.getTransactions();
    setUserTransactions(transactions);

    const savedBankTransactions = Storage.getBankTransactions();
    setBankTransactions(savedBankTransactions);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);

    try {
      const content = await file.text();
      const parsedTransactions = BankMatcher.parseBankStatement(content);

      if (parsedTransactions.length === 0) {
        toast.error("No valid transactions found in the CSV file");
        return;
      }

      setBankTransactions(parsedTransactions);
      Storage.saveBankTransactions(parsedTransactions);
      toast.success(
        `Successfully uploaded ${parsedTransactions.length} bank transactions`,
      );

      // Reset match result when new file is uploaded
      setMatchResult(null);
    } catch (error) {
      toast.error("Failed to parse CSV file. Please check the format.");
      console.error("CSV parsing error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMatching = async () => {
    if (bankTransactions.length === 0) {
      toast.error("Please upload bank statements first");
      return;
    }

    if (userTransactions.length === 0) {
      toast.error("No user transactions found. Add some transactions first.");
      return;
    }

    setIsMatching(true);

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = BankMatcher.matchTransactions(
        userTransactions,
        bankTransactions,
      );
      setMatchResult(result);

      // Update transactions with matching status
      result.matched.forEach((transaction) => {
        Storage.updateTransaction(transaction.id, {
          isMatched: true,
          bankReference: transaction.bankReference,
        });
      });

      toast.success("Bank matching completed successfully");
    } catch (error) {
      toast.error("Failed to match transactions");
      console.error("Matching error:", error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleDownloadReport = () => {
    if (!matchResult) return;

    try {
      const report = BankMatcher.generateDiscrepancyReport(matchResult);
      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `bank_matching_report_${new Date().toISOString().split("T")[0]}.txt`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report downloaded successfully");
      }
    } catch (error) {
      toast.error("Failed to download report");
      console.error("Download error:", error);
    }
  };

  const handleClearBankData = () => {
    setBankTransactions([]);
    setMatchResult(null);
    Storage.saveBankTransactions([]);
    toast.success("Bank data cleared");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getMatchingProgress = () => {
    if (!matchResult) return 0;
    const total = userTransactions.length;
    const matched = matchResult.matched.length;
    return total > 0 ? (matched / total) * 100 : 0;
  };

  return (
    <div className="bank-matching-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Bank Matching</h1>
            <p className="page-description">
              Upload your bank statements and match them with your recorded
              transactions
            </p>
          </div>
        </div>
      </div>

      <div className="bank-matching-content">
        <Card className="upload-card">
          <CardHeader>
            <CardTitle className="upload-title">
              <Upload className="title-icon" />
              Upload Bank Statement
            </CardTitle>
            <CardDescription>
              Upload a CSV file containing your bank transactions. The file
              should have columns for Date, Description, Amount, and Balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="upload-section">
              <div className="upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="bank-statement-upload"
                />
                <label htmlFor="bank-statement-upload" className="upload-label">
                  <FileText className="upload-icon" />
                  <span className="upload-text">
                    {isUploading ? "Uploading..." : "Click to upload CSV file"}
                  </span>
                  <span className="upload-hint">
                    Supports CSV files from most banks
                  </span>
                </label>
              </div>

              <div className="upload-actions">
                <Button
                  onClick={handleMatching}
                  disabled={
                    bankTransactions.length === 0 ||
                    userTransactions.length === 0 ||
                    isMatching
                  }
                  className="match-button"
                >
                  {isMatching ? "Matching..." : "Start Matching"}
                </Button>

                {bankTransactions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearBankData}
                    className="clear-button"
                  >
                    <X className="button-icon" />
                    Clear Bank Data
                  </Button>
                )}
              </div>
            </div>

            {bankTransactions.length > 0 && (
              <div className="bank-summary">
                <Alert>
                  <CheckCircle className="alert-icon" />
                  <AlertTitle>Bank Statement Loaded</AlertTitle>
                  <AlertDescription>
                    Successfully loaded {bankTransactions.length} bank
                    transactions. You can now start the matching process.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {matchResult && (
          <Card className="results-card">
            <CardHeader>
              <div className="results-header">
                <div>
                  <CardTitle className="results-title">
                    Matching Results
                  </CardTitle>
                  <CardDescription>
                    Analysis of your transaction matching
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="download-report-button"
                >
                  <Download className="button-icon" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="results-summary">
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Matching Progress</span>
                    <span className="progress-percentage">
                      {getMatchingProgress().toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={getMatchingProgress()}
                    className="matching-progress"
                  />
                </div>

                <div className="summary-grid">
                  <div className="summary-item matched">
                    <CheckCircle className="summary-icon" />
                    <div className="summary-content">
                      <span className="summary-count">
                        {matchResult.matched.length}
                      </span>
                      <span className="summary-label">Matched</span>
                    </div>
                  </div>

                  <div className="summary-item unmatched">
                    <AlertTriangle className="summary-icon" />
                    <div className="summary-content">
                      <span className="summary-count">
                        {matchResult.unmatched.length}
                      </span>
                      <span className="summary-label">Unmatched</span>
                    </div>
                  </div>

                  <div className="summary-item discrepancies">
                    <X className="summary-icon" />
                    <div className="summary-content">
                      <span className="summary-count">
                        {matchResult.discrepancies.length}
                      </span>
                      <span className="summary-label">Discrepancies</span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="matched" className="results-tabs">
                <TabsList className="results-tabs-list">
                  <TabsTrigger value="matched">
                    Matched ({matchResult.matched.length})
                  </TabsTrigger>
                  <TabsTrigger value="unmatched">
                    Unmatched ({matchResult.unmatched.length})
                  </TabsTrigger>
                  <TabsTrigger value="discrepancies">
                    Discrepancies ({matchResult.discrepancies.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="matched" className="tab-content">
                  <div className="transactions-list">
                    {matchResult.matched.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="transaction-item matched-item"
                      >
                        <div className="transaction-info">
                          <div className="transaction-main">
                            <h4 className="transaction-description">
                              {transaction.description}
                            </h4>
                            <div className="transaction-meta">
                              <Badge variant="default" className="type-badge">
                                {transaction.type}
                              </Badge>
                              <span className="transaction-amount">
                                {formatCurrency(transaction.amount)}
                              </span>
                              <span className="transaction-date">
                                {format(
                                  new Date(transaction.date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          </div>
                          <CheckCircle className="match-status-icon matched" />
                        </div>
                        {transaction.bankReference && (
                          <p className="bank-reference">
                            Bank Reference: {transaction.bankReference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unmatched" className="tab-content">
                  <div className="transactions-list">
                    {matchResult.unmatched.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="transaction-item unmatched-item"
                      >
                        <div className="transaction-info">
                          <div className="transaction-main">
                            <h4 className="transaction-description">
                              {transaction.description}
                            </h4>
                            <div className="transaction-meta">
                              <Badge variant="secondary" className="type-badge">
                                {transaction.type}
                              </Badge>
                              <span className="transaction-amount">
                                {formatCurrency(transaction.amount)}
                              </span>
                              <span className="transaction-date">
                                {format(
                                  new Date(transaction.date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          </div>
                          <AlertTriangle className="match-status-icon unmatched" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="discrepancies" className="tab-content">
                  <div className="discrepancies-list">
                    {matchResult.discrepancies.map((discrepancy, index) => (
                      <div key={index} className="discrepancy-item">
                        <div className="discrepancy-header">
                          <div className="transaction-info">
                            <h4 className="transaction-description">
                              {discrepancy.transaction.description}
                            </h4>
                            <div className="transaction-meta">
                              <Badge
                                variant="destructive"
                                className="type-badge"
                              >
                                {discrepancy.transaction.type}
                              </Badge>
                              <span className="transaction-amount">
                                {formatCurrency(discrepancy.transaction.amount)}
                              </span>
                              <span className="transaction-date">
                                {format(
                                  new Date(discrepancy.transaction.date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          </div>
                          <X className="match-status-icon discrepancy" />
                        </div>

                        <Alert className="discrepancy-alert">
                          <AlertTriangle className="alert-icon" />
                          <AlertDescription>
                            <strong>Issue:</strong> {discrepancy.issue}
                          </AlertDescription>
                        </Alert>

                        {discrepancy.bankTransaction && (
                          <div className="bank-transaction-details">
                            <h5 className="bank-transaction-title">
                              Potential Bank Match:
                            </h5>
                            <div className="bank-transaction-info">
                              <span className="bank-description">
                                {discrepancy.bankTransaction.description}
                              </span>
                              <span className="bank-amount">
                                {formatCurrency(
                                  discrepancy.bankTransaction.amount,
                                )}
                              </span>
                              <span className="bank-date">
                                {format(
                                  new Date(discrepancy.bankTransaction.date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="instructions-card">
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
            <CardDescription>
              Follow these guidelines for best matching results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="instructions-content">
              <h4 className="instructions-title">Required CSV Columns:</h4>
              <ul className="instructions-list">
                <li>
                  <strong>Date:</strong> Transaction date (MM/DD/YYYY or
                  DD/MM/YYYY)
                </li>
                <li>
                  <strong>Description:</strong> Transaction description or
                  merchant name
                </li>
                <li>
                  <strong>Amount:</strong> Transaction amount (positive for
                  credits, negative for debits)
                </li>
                <li>
                  <strong>Balance:</strong> Account balance after transaction
                </li>
                <li>
                  <strong>Reference:</strong> Bank reference number (optional)
                </li>
              </ul>

              <div className="example-format">
                <h5 className="example-title">Example CSV Format:</h5>
                <code className="example-code">
                  Date,Description,Amount,Balance,Reference
                  <br />
                  01/15/2024,"Grocery Store",-850.50,12345.50,REF123
                  <br />
                  01/16/2024,"Salary Deposit",25000.00,37345.50,SAL456
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
