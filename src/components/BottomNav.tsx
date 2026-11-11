import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/',
    label: 'Inicio',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5V20h12v-9.5" />
      </svg>
    ),
  },
  {
    to: '/registrar',
    label: 'Registrar',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    to: '/parcelas',
    label: 'Parcelas',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 18V7l8-3 8 3v11" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v14M4 18h16" />
      </svg>
    ),
  },
  {
    to: '/informes',
    label: 'Informes',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7l4 4v12H7V4Z" />
        <path strokeLinecap="round" d="M10 12h4M10 16h4" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5 pb-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-brand' : ''}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
