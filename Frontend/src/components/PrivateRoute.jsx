import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // Assuming you store role on login

  if (!token) {
    return <Navigate to="/login" />
  }

  // If allowedRoles prop is passed, restrict access based on role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" /> // Redirect to home or unauthorized page
  }

  return children
}

export default PrivateRoute
