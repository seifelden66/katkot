import { configureStore, createSlice } from '@reduxjs/toolkit'

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    selectedCategory: null as number | null,
    selectedStore: null as number | null
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload
    },
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.selectedStore = null;
    }
  }
})

export const { setSelectedCategory, setSelectedStore, clearFilters } = filterSlice.actions
export const store = configureStore({
  reducer: {
    filter: filterSlice.reducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch