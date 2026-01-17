import { useEffect } from 'react'
import './App.css'
import Pages from './pages/index.jsx'
import { Toaster } from '@ifs/shared/components/ui/toaster'
import { checkDomainRedirect } from '@ifs/shared/utils/domainRedirect'

function App() {
  useEffect(() => {
    // Check if current page should be on main site domain
    const redirectUrl = checkDomainRedirect('portal');
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, []);

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App
