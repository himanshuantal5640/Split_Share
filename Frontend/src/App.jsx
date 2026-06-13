import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/groups/Groups';
import CreateGroup from './pages/groups/CreateGroup';
import GroupDetails from './pages/groups/GroupDetails';
import Expenses from './pages/expenses/Expenses';
import CreateExpense from './pages/expenses/CreateExpense';
import ExpenseDetails from './pages/expenses/ExpenseDetails';
import EditExpense from './pages/expenses/EditExpense';
import Settlements from './pages/settlements/Settlements';
import CreateSettlement from './pages/settlements/CreateSettlement';
import SettlementDetails from './pages/settlements/SettlementDetails';
import Imports from './pages/imports/Imports';
import UploadImport from './pages/imports/UploadImport';
import ImportDetails from './pages/imports/ImportDetails';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />
          <Route
            path="/register"
            element={
              <MainLayout>
                <Register />
              </MainLayout>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <MainLayout>
                <Unauthorized />
              </MainLayout>
            }
          />

          {/* Protected Routes wrapped under ProtectedRoute and DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Groups />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateGroup />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GroupDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Expenses />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateExpense />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/:expenseId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ExpenseDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/:expenseId/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditExpense />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settlements"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settlements />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settlements/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateSettlement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settlements/:settlementId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettlementDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/imports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Imports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/imports/upload"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UploadImport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/imports/:importId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ImportDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/balances"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-All / 404 Route */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;



