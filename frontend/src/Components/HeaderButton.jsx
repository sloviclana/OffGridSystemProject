import React from "react";
import { Button } from "react-bootstrap";


const HeaderButton = ({ children, ...props }) => {
    return (
      <Button
        className="primaryBtn"
        {...props}
        >
        {children}
      </Button>
    );
  };

export default HeaderButton;