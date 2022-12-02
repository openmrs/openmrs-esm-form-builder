import React, { useEffect, useState } from "react";
import { OHRIForm } from "@ohri/openmrs-ohri-form-engine-lib";
import { OHRIFormSchema } from "@ohri/openmrs-ohri-form-engine-lib/src/api/types";
import { useConfig } from "@openmrs/esm-framework";
import { Schema } from "../../../types";

type FormRendererProps = {
  onSchemaUpdate: (schema: Schema) => void;
  schema: Schema;
};

const FormRenderer: React.FC<FormRendererProps> = ({
  onSchemaUpdate,
  schema,
}) => {
  const { patientUuidConfig } = useConfig();
  const defaultSchema: OHRIFormSchema = {
    name: "",
    pages: [],
    processor: "EncounterFormProcessor",
    uuid: "xxx",
    encounterType: "",
    referencedForms: [],
  };
  const patientUUID = patientUuidConfig;
  const [currentFormMode, setCurrentFormMode] = useState<any>("enter");
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
