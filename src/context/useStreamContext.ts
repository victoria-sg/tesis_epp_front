import { useContext } from "react";
import { StreamContext } from "./StreamContext";
import type { StreamContextType } from "./StreamContext";

export const useStreamContext = () => useContext<StreamContextType>(StreamContext);
