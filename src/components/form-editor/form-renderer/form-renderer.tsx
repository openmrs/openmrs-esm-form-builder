import React, { useContext, useEffect, useState } from "react";
import { OHRIForm } from "@ohri/openmrs-ohri-form-engine-lib";
import { OHRIFormSchema } from "@ohri/openmrs-ohri-form-engine-lib/src/api/types";
import { SchemaContext } from "../../../context/context";

const FormRenderer: React.FC = () => {
  const defaultSchema: OHRIFormSchema = {
    name: "",
    pages: [],
    processor: "EncounterFormProcessor",
    uuid: "xxx",
    encounterType: "",
    referencedForms: [],
  };
  const patientUUID = "b280078a-c0ce-443b-9997-3c66c63ec2f8";
  const [currentFormMode, setCurrentFormMode] = useState<any>("enter");
  const { schema, setSchema } = useContext(SchemaContext);
  const [renderFormSchema, setRenderFormSchema] =
    useState<OHRIFormSchema>(defaultSchema);
  useEffect(() => {
    if (schema != undefined) {
      setRenderFormSchema(schema);
    }
  }, [schema]);

  return (
    <div>
      {schema == renderFormSchema ? (
        <OHRIForm
          formJson={renderFormSchema}
          mode={currentFormMode}
          patientUUID={patientUUID}
        />
      ) : null}
    </div>
  );
};
export default FormRenderer;
