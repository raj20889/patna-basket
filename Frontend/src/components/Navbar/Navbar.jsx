import { useEffect, useState } from 'react'
import PublicNavbar from './PublicNavbar'
import CustomerNavbar from './CustomerNavbar'
import AdminNavbar from './AdminNavbar'
import DeliveryNavbar from './DeliveryNavbar'

const Navbar = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    setUser(storedUser)
  }, [])

  if (!user) return <PublicNavbar />
  if (user.role === "customer") return <CustomerNavbar />
  if (user.role === "admin") return <AdminNavbar />
  if (user.role === "delivery") return <DeliveryNavbar />

  return null
}

export default Navbar
