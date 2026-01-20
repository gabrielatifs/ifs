import { useEffect } from 'react'
import './App.css'
import Pages from './pages/index.jsx'
import { Toaster } from '@ifs/shared/components/ui/toaster'
import { checkDomainRedirect } from '@ifs/shared/utils/domainRedirect'

function App() {
  useEffect(() => {
    // Check if current page should be on a different domain
    const redirectUrl = checkDomainRedirect('admin');
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
