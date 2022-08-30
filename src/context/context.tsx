import { createContext } from "react";
import { SchemaContextType } from "../api/types";

export const SchemaContext = createContext<SchemaContextType>(null);
