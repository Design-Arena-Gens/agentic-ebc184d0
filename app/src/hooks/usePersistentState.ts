'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string) => T;

const isBrowser = typeof window !== "undefined";

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  }: {
    serialize?: Serializer<T>;
    deserialize?: Deserializer<T>;
  } = {},
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) {
      return initialValue;
    }
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        return deserialize(stored);
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    try {
      window.localStorage.setItem(keyRef.current, serialize(state));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${keyRef.current}":`, error);
    }
  }, [serialize, state]);

  return [state, setState];
}
