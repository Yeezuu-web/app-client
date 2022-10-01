import { configureStore, combineReducers, AnyAction, Store } from '@reduxjs/toolkit'
import { HYDRATE, MakeStore, createWrapper } from 'next-redux-wrapper';
import { authSlice } from './slices/auth'
import { usersSlice } from './slices/users'

const combinedReducers = combineReducers({
  authReducer: authSlice.reducer,
  usersReducer: usersSlice.reducer,
})

// Type that indicates our whole State will be used for useSelector and other things.
export type OurStore = ReturnType<typeof combinedReducers>

const rootReducer: any = (
  state: ReturnType<typeof combinedReducers>,
  action: AnyAction,
) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    }

    return nextState
  }

  return combinedReducers(state, action)
}

export const store = configureStore<OurStore>({
  reducer: rootReducer,
})

const makeStore: MakeStore<Store<any>> = (store: any) => store

export const wrapper = createWrapper(makeStore, { storeKey: 'key' } as any)

// Type that will be used to type useDispatch() for async actions.
export type MyThunkDispatch = typeof store.dispatch
