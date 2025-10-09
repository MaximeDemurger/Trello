/**
 * BoardFlow - Trello-like Board Management App
 * Main Application Entry Point
 */

// Import Unistyles configuration FIRST - before any components
import "./app/unistyles";

import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AppNavigator } from "./app/navigation/AppNavigator";
import { useBoardStore } from "./app/stores/useBoardStore";
import { AuthProvider } from "./app/providers/AuthProvider";
import { QueryProvider } from "./app/providers/QueryProvider";

export default function App() {
  const initializeDefaultData = useBoardStore(
    (state) => state.initializeDefaultData
  );

  useEffect(() => {
    // Initialize default data on first launch
    initializeDefaultData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <BottomSheetModalProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </BottomSheetModalProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
