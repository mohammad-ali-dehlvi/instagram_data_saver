/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { StorageState } from "../api";

type SelectedStorageType = (typeof StorageState)[keyof typeof StorageState];

export const SHOW_STORAGE_STATE_SELECT = true;
export const storageStateOptions = Object.values(StorageState);
export const shouldShowStorageStateSelect =
  SHOW_STORAGE_STATE_SELECT && storageStateOptions.length > 1;

interface StorageStateContextType {
  selectedStorageState: SelectedStorageType;
  setSelectedStorageState: Dispatch<SetStateAction<SelectedStorageType>>;
}

const StorageStateContext = createContext({} as StorageStateContextType);

export const useStorageStateContext = () => useContext(StorageStateContext);

interface StorageStateContextProviderProps {
  children: ReactNode;
}

export default function StorageStateContextProvider(
  props: StorageStateContextProviderProps,
) {
  const { children } = props;
  const [selectedStorageState, setSelectedStorageState] =
    useState<SelectedStorageType>(storageStateOptions[0]);

  const contextValue = useMemo(() => {
    return {
      selectedStorageState,
      setSelectedStorageState,
    };
  }, [selectedStorageState, setSelectedStorageState]);

  return (
    <StorageStateContext.Provider value={contextValue}>
      {children}
    </StorageStateContext.Provider>
  );
}
