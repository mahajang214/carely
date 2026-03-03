import { ChevronLeft } from "lucide-react";
import { Button } from "../ui";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Navbar({ title = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className="upper_notification  justify-between items-center border-b pb-2 hidden md:flex ">
      <h1>{title}</h1>
      <Button
        onClick={handleBack}
        variant="dashboardIcon"
        size="sm"
        className={`gap-1`}
      >
        <ChevronLeft size={20} /> Back
      </Button>
    </div>
  );
}

export default Navbar;
