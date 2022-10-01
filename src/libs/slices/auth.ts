import { createSlice, SerializedError, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axios';

export enum AuthStates {
  IDLE = 'idle',
  LOADING = 'loading'
}

export const fetchUser = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const response = await axios.get<{ name?: string; email?: string; type?: string }>('api/me')

    return response.data
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.message })
  }
})

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post<{ access_token: string }>('api/login', credentials)
      const refetch = await axios.get<{ name: string }>('api/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      })

      return { access_token: response.data.access_token, me: { name: refetch.data.name } }
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message })
    }
  }
)
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { email: string; password: string; name: string }, thunkAPI) => {
    try {
      const response = await axios.post<{ access_token: string }>('api/register', credentials)
      const refetch = await axios.get<{ name: string }>('api/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      })

      return { access_token: response.data.access_token, me: { name: refetch.data.name } }
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message })
    }
  }
)
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    const response = await axios.delete<{ access_token: string }>('api/logout')

    return response.data
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.message })
  }
})

export interface AuthSliceState {
  access_token: string,
  loading: AuthStates,
  me?: {
    firstName?: string,
    lastName?: string,
    email?: string
  } | null,
  error?: SerializedError | null
}

// That's what we will store in the auth slice.
const internalInitialState = {
  access_token: '',
  loading: AuthStates.IDLE,
  me: null,
  error: null
}

// Create slice
export const authSlice = createSlice({
  name: "auth",
  initialState: internalInitialState,
  reducers: {
    // here will end up non async basic reducers.
    updateAccessToken(state: AuthSliceState, action: PayloadAction<{ token: string }>) {
      state.access_token = action.payload.token
    },

    reset: () => internalInitialState,
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state: AuthSliceState, action: any) => {
      state.access_token = action.payload.access_token
      state.me = action.payload.me
      state.loading = AuthStates.IDLE
    })
    builder.addCase(login.rejected, (state: AuthSliceState, action: any) => {
      state = { ...internalInitialState, error: action.error }
      throw new Error(action.error.message)
    })
    builder.addCase(logout.pending, (state) => {
      state.loading = AuthStates.LOADING
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(logout.fulfilled, (_state) => internalInitialState)
    builder.addCase(login.pending, (state) => {
      state.loading = AuthStates.LOADING
    })
    builder.addCase(register.fulfilled, (state: AuthSliceState, action: any) => {
      state.access_token = action.payload.access_token
      state.me = action.payload.me
      state.loading = AuthStates.IDLE
    })
    builder.addCase(register.rejected, (state: AuthSliceState, action: any) => {
      state.error = action.error
    })
    builder.addCase(fetchUser.rejected, (state: AuthSliceState, action: any) => {
      state = { ...internalInitialState, error: action.error }

      // throw new Error(action.error.message)
    })
    builder.addCase(fetchUser.fulfilled, (state: AuthSliceState, action: any) => {
      state.me = action.payload
    })
  },
})

// Actions generated automatically by createSlice function
export const { updateAccessToken, reset } = authSlice.actions
