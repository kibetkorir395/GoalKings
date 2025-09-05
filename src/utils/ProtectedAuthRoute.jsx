import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../recoil/atoms";

/**
 * ProtectedAuthRoute - Redirects authenticated users away from routes meant for unauthenticated users.
 */
const ProtectedAuthRoute = ({ children }) => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const previousPath = location.state?.from || '/';
      navigate(previousPath, { replace: true });
    }
  }, [user, navigate, location]);

  if (user) return null;

  return children;
};

export default ProtectedAuthRoute;
