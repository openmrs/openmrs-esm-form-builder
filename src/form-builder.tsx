import React from "react";
import styles from "./form-builder.css";
import Dashboard from "./components/dashboard/dashboard.component";

const FormBuilder: React.FC = () => {
  return (
    <div className={`omrs-main-content ${styles.container}`}>
      <Dashboard />
    </div>
  );
};

export default FormBuilder;
