import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { NewParcel } from './pages/NewParcel'
import { ParcelDetail } from './pages/ParcelDetail'
import { Parcels } from './pages/Parcels'
import { RegisterFertilization } from './pages/RegisterFertilization'
import { RegisterHub } from './pages/RegisterHub'
import { RegisterTreatment } from './pages/RegisterTreatment'
import { Reports } from './pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="registrar" element={<RegisterHub />} />
                <Route path="registrar/tratamiento" element={<RegisterTreatment />} />
                <Route path="registrar/fertilizacion" element={<RegisterFertilization />} />
                <Route path="parcelas" element={<Parcels />} />
                <Route path="parcelas/nueva" element={<NewParcel />} />
                <Route path="parcelas/:id" element={<ParcelDetail />} />
                <Route path="informes" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
