import { createAsyncThunk, createSlice, SerializedError, PayloadAction } from '@reduxjs/toolkit';
import axios from '../axios';

export enum UserStates {
  IDLE = 'idel',
  LOADING = 'loading'
}

export const fetchUsers = createAsyncThunk('auth/Users', async (_, thunkAPI) => {
  try {
    const response = await axios.get<{ hits: any[] }>('api/users') // Call proxy server (api/pages/users.ts)

    return response
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.message })
  }
})

export interface UserSliceState {
  loading: UserStates,
  users?: any[] | null,
  error?: SerializedError | null
}

const internalInitialState = {
  loading: UserStates.IDLE,
  users: [],
  error: null
}

export const usersSlice = createSlice({
  name: 'users',
  initialState: internalInitialState,
  reducers: {
    reset: () => internalInitialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state: UserSliceState, action: PayloadAction<any>) => {
      state.users = [...action.payload.hits]
      state.loading = UserStates.IDLE
    })
    builder.addCase(fetchUsers.rejected, (state: UserSliceState, action) => {
      state = { ...internalInitialState, error: action.error }
      throw new Error(action.error.message)
    })
    builder.addCase(fetchUsers.pending, (state: UserSliceState) => {
      state.loading = UserStates.LOADING
    })
  },
})

export const { reset } = usersSlice.actions
