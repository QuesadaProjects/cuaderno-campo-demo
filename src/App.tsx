import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './context/AppContext'
import { Dashboard } from './pages/Dashboard'
import { NewParcel } from './pages/NewParcel'
import { ParcelDetail } from './pages/ParcelDetail'
import { Parcels } from './pages/Parcels'
import { RegisterFertilization } from './pages/RegisterFertilization'
import { RegisterHub } from './pages/RegisterHub'
import { RegisterTreatment } from './pages/RegisterTreatment'
import { Reports } from './pages/Reports'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
