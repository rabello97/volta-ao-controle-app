import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/routes/LoginPage";
import { RequireAuth } from "@/routes/RequireAuth";
import { AppLayout } from "@/routes/AppLayout";
import { DashboardPage } from "@/routes/DashboardPage";
import { TransactionsPage } from "@/routes/TransactionsPage";
import { RecurringBillsPage } from "@/routes/RecurringBillsPage";
import { CreditCardsPage } from "@/routes/CreditCardsPage";
import { CreditCardDetailPage } from "@/routes/CreditCardDetailPage";
import { ReportsPage } from "@/routes/ReportsPage";
import { HouseholdPage } from "@/routes/HouseholdPage";
import { SettingsPage } from "@/routes/SettingsPage";
import { ErrorPage } from "@/routes/ErrorPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/recurring-bills" element={<RecurringBillsPage />} />
          <Route path="/credit-cards" element={<CreditCardsPage />} />
          <Route path="/credit-cards/:id" element={<CreditCardDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/household" element={<HouseholdPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/sem-acesso" element={<ErrorPage kind="forbidden" />} />
      {/* Rota desconhecida mostra o 404 em vez de mandar em silêncio para o
          painel — assim um link errado fica visível em vez de parecer que a
          navegação simplesmente não funcionou. */}
      <Route path="*" element={<ErrorPage kind="not-found" />} />
    </Routes>
  );
}
