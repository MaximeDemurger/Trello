# Trello-like Board (Technical Test)

Small Trello-style board app built with React Native (Expo) and TypeScript. I wrote this alone for a company technical test. The goal is to show clear structure, clean code, and sensible tooling in a short timeframe.

## Features (scope of this test)

- Boards with groups (columns) and items (cards)
- Simple drag context prepared for moving items between groups
- Swipe to delete on item cards with haptic feedback
- Bottom sheet modals for create/edit flows
- Local, fast persistence via MMKV (no backend)
- Basic animations with Reanimated and sensible UI defaults

## Tech stack

- React Native (Expo SDK 54), TypeScript
- React Navigation (native stack), expo-linking (deep linking skeleton)
- Zustand + MMKV for state and storage
- React Native Gesture Handler + Reanimated
- Unistyles for theming/design tokens
- Jest for unit tests, ESLint + Prettier for code quality

## Project structure

```
app/
├── components/
│   ├── ItemCard/            # Card UI (swipe-to-delete)
│   ├── GroupColumn/         # Column with items
│   ├── Create*Modal/        # Bottom sheet based CRUD modals
│   └── DragDropProvider/    # Drag context utilities
├── screens/
│   ├── BoardListScreen/
│   └── BoardDetailScreen/   # Columns, empty state, accessibility labels
├── navigation/
│   └── AppNavigator.tsx     # Stack navigator + deep linking config
├── stores/
│   └── useBoardStore.ts     # Zustand + MMKV persistence
├── types/
│   └── board.types.ts
├── utils/
│   └── id.ts                # ID/timestamp helpers (+ tests)
└── unistyles.ts             # Design tokens & theme
```

## Getting started

1. Install dependencies

```bash
yarn install
```

2. Run the app (Expo)

```bash
yarn start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan the QR code with Expo Go

## Useful scripts

- Type check: `yarn typecheck`
- Lint: `yarn lint`
- Format: `yarn format`
- Tests: `yarn test`

## Notes

- Local-only state (MMKV). No server or auth in this scope.
- Drag & drop is structured for extension, but limited for the test.
- I optimized for readability and a clean baseline rather than breadth.
