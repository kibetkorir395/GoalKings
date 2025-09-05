import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../recoil/atoms";

/**
 * ProtectedAdminRoute - Restricts access to admin-only routes.
 */
const ProtectedAdminRoute = ({ children }) => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !['kkibetkkoir@gmail.com', 'charleykibet254@gmail.com', 'coongames8@gmail.com'].includes(user.email)) {
      const previousPath = location.state?.from || '/';
      navigate(previousPath, { replace: true });
    }
  }, [user, navigate, location]);

  if (!user || !['kkibetkkoir@gmail.com', 'charleykibet254@gmail.com', 'coongames8@gmail.com'].includes(user.email)) {
    return null; // Optionally render a loading indicator or message
  }

  return children;
};

export default ProtectedAdminRoute;
